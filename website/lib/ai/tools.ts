// Read-only AI tools. Each tool maps to one sidebar permission so the
// assistant can only touch data the current role may visit.
import { z } from "zod";
import { canAccess } from "@/lib/permissions";
import {
  appointmentRepo,
  bedRepo,
  billingRepo,
  labRepo,
  patientRepo,
  pharmacyRepo,
  prescriptionRepo,
  triageRepo,
} from "@/lib/repos/hospital";
import * as supa from "@/lib/repos/supabase";
import { getSupabase } from "@/lib/supabase";

function hasSupabase(): boolean {
  return getSupabase() !== null;
}

const searchPatientsArgs = z.object({
  query: z.string().min(1).describe("Patient id, name, or doctor"),
  limit: z.number().int().min(1).max(25).optional(),
});

const patientBriefArgs = z.object({
  patient: z.string().min(1).describe("Exact patient name"),
});

const bedAvailabilityArgs = z.object({
  ward: z
    .enum(["ICU", "General", "Emergency", "Pediatrics", "Maternity"])
    .optional(),
});

const appointmentsArgs = z.object({
  status: z
    .enum(["Scheduled", "In Progress", "Completed", "Cancelled", "No Show"])
    .optional(),
  doctor: z.string().optional(),
});

const labArgs = z.object({
  patient: z.string().optional(),
  status: z
    .enum(["Sample Collected", "In Progress", "Ready", "Critical"])
    .optional(),
});

const noArgs = z.object({});

type ToolDef = {
  name: string;
  href: string;
  description: string;
  parameters: Record<string, unknown>;
  validate: (args: unknown) => unknown;
  run: (args: never) => unknown | Promise<unknown>;
};

function slimPatient(p: {
  id: string;
  name: string;
  age: number;
  gender: string;
  blood: string;
  doctor: string;
  department: string;
  status: string;
}) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    blood: p.blood,
    doctor: p.doctor,
    department: p.department,
    status: p.status,
  };
}

export const TOOL_DEFS: ToolDef[] = [
  {
    name: "search_patients",
    href: "/customers",
    description: "Search patients by id, name, or doctor. Returns minimal demographics.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Patient id, name, or doctor" },
        limit: { type: "number", description: "Max rows, default 10" },
      },
      required: ["query"],
    },
    validate: (a) => searchPatientsArgs.parse(a),
    run: async (a) => {
      const args = a as z.infer<typeof searchPatientsArgs>;
      if (hasSupabase()) {
        try {
          return (await supa.searchPatients(args.query, args.limit)).map(slimPatient);
        } catch {
          // fall through to JSON
        }
      }
      return patientRepo.search(args.query, args.limit).map(slimPatient);
    },
  },
  {
    name: "patient_brief",
    href: "/customers",
    description: "Compiled brief for one patient: demographics, visits, prescriptions, labs.",
    parameters: {
      type: "object",
      properties: {
        patient: { type: "string", description: "Exact patient name" },
      },
      required: ["patient"],
    },
    validate: (a) => patientBriefArgs.parse(a),
    run: async (a) => {
      const args = a as z.infer<typeof patientBriefArgs>;
      if (hasSupabase()) {
        try {
          const found = await supa.getPatientsByName(args.patient);
          if (found.length > 0) {
            const p = found[0];
            const [visits, prescriptions, labs] = await Promise.all([
              supa.listAppointments().then((all) => all.filter((v) => v.patient === p.name)),
              supa.prescriptionsForPatient(p.name),
              supa.labList({ patient: p.name }),
            ]);
            return {
              patient: slimPatient(p),
              visits: visits.map((v) => ({
                id: v.id, date: v.date, type: v.type, doctor: v.doctor, status: v.status,
              })),
              prescriptions: prescriptions.map((r) => ({
                id: r.id, date: r.date, diagnosis: r.diagnosis,
                medicines: r.medicines.map((m) => `${m.name} ${m.dosage} x ${m.duration}`),
                status: r.status,
              })),
              labs: labs.map((l) => ({
                id: l.id, test: l.test, result: l.result, status: l.status,
              })),
            };
          }
        } catch {
          // fall through to JSON
        }
      }
      const found = patientRepo.getByName(args.patient);
      if (found.length === 0) return { error: "patient_not_found" };
      const p = found[0];
      return {
        patient: slimPatient(p),
        visits: appointmentRepo.forPatient(p.name).map((v) => ({
          id: v.id, date: v.date, type: v.type, doctor: v.doctor, status: v.status,
        })),
        prescriptions: prescriptionRepo.forPatient(p.name).map((r) => ({
          id: r.id, date: r.date, diagnosis: r.diagnosis,
          medicines: r.medicines.map((m) => `${m.name} ${m.dosage} x ${m.duration}`),
          status: r.status,
        })),
        labs: labRepo.list({ patient: p.name }).map((l) => ({
          id: l.id, test: l.test, result: l.result, status: l.status,
        })),
      };
    },
  },
  {
    name: "bed_availability",
    href: "/channels",
    description: "Bed counts grouped by ward and status. Optional ward filter.",
    parameters: {
      type: "object",
      properties: {
        ward: { type: "string", enum: ["ICU", "General", "Emergency", "Pediatrics", "Maternity"] },
      },
    },
    validate: (a) => bedAvailabilityArgs.parse(a),
    run: async (a) => {
      if (hasSupabase()) {
        try {
          return await supa.bedAvailability((a as z.infer<typeof bedAvailabilityArgs>).ward);
        } catch {
          // fall through
        }
      }
      return bedRepo.availability((a as z.infer<typeof bedAvailabilityArgs>).ward);
    },
  },
  {
    name: "list_appointments",
    href: "/orders",
    description: "List appointments, optionally filtered by status or doctor.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["Scheduled", "In Progress", "Completed", "Cancelled", "No Show"] },
        doctor: { type: "string" },
      },
    },
    validate: (a) => appointmentsArgs.parse(a),
    run: async (a) => {
      const args = a as z.infer<typeof appointmentsArgs>;
      const mapRows = (rows: { id: string; patient: string; doctor: string; department: string; date: string; time: string; type: string; status: string }[]) =>
        rows.map((v) => ({
          id: v.id, patient: v.patient, doctor: v.doctor, department: v.department,
          when: `${v.date} ${v.time}`, type: v.type, status: v.status,
        }));
      if (hasSupabase()) {
        try {
          return mapRows(await supa.listAppointments(args));
        } catch {
          // fall through
        }
      }
      return mapRows(appointmentRepo.list(args));
    },
  },
  {
    name: "billing_summary",
    href: "/billing",
    description: "Totals grouped by bill status: counts and amounts in rupees.",
    parameters: { type: "object", properties: {} },
    validate: (a) => noArgs.parse(a),
    run: async () => {
      if (hasSupabase()) {
        try {
          return await supa.billingSummary();
        } catch {
          // fall through
        }
      }
      return billingRepo.summary();
    },
  },
  {
    name: "lab_lookup",
    href: "/lab",
    description: "Look up lab reports by patient and/or status.",
    parameters: {
      type: "object",
      properties: {
        patient: { type: "string" },
        status: { type: "string", enum: ["Sample Collected", "In Progress", "Ready", "Critical"] },
      },
    },
    validate: (a) => labArgs.parse(a),
    run: async (a) => {
      const args = a as z.infer<typeof labArgs>;
      const mapRows = (rows: { id: string; patient: string; test: string; result: string; status: string; date: string }[]) =>
        rows.map((l) => ({
          id: l.id, patient: l.patient, test: l.test,
          result: l.result, status: l.status, date: l.date,
        }));
      if (hasSupabase()) {
        try {
          return mapRows(await supa.labList(args));
        } catch {
          // fall through
        }
      }
      return mapRows(labRepo.list(args));
    },
  },
  {
    name: "triage_waiting",
    href: "/triage",
    description: "Current emergency triage waiting queue.",
    parameters: { type: "object", properties: {} },
    validate: (a) => noArgs.parse(a),
    run: async () => {
      const mapRows = (rows: { id: string; patient: string; severity: string; complaint: string; waitMins: number; doctor: string }[]) =>
        rows.map((t) => ({
          id: t.id, patient: t.patient, severity: t.severity,
          complaint: t.complaint, wait_mins: t.waitMins, doctor: t.doctor,
        }));
      if (hasSupabase()) {
        try {
          return mapRows(await supa.triageWaiting());
        } catch {
          // fall through
        }
      }
      return mapRows(triageRepo.waiting());
    },
  },
  {
    name: "pharmacy_alerts",
    href: "/products",
    description: "Medicines low or out of stock.",
    parameters: { type: "object", properties: {} },
    validate: (a) => noArgs.parse(a),
    run: async () => {
      const mapRows = (rows: { name: string; sku: string; stock: number; status: string }[]) =>
        rows.map((m) => ({
          name: m.name, sku: m.sku, stock: m.stock, status: m.status,
        }));
      if (hasSupabase()) {
        try {
          return mapRows(await supa.pharmacyLowStock());
        } catch {
          // fall through
        }
      }
      return mapRows(pharmacyRepo.lowStock());
    },
  },
];

export function openAiTools() {
  return TOOL_DEFS.map((t) => ({
    type: "function" as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

export async function executeTool(
  name: string,
  rawArgs: unknown,
  role: string,
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const tool = TOOL_DEFS.find((t) => t.name === name);
  if (!tool) return { ok: false, error: `unknown_tool:${name}` };
  if (!canAccess(tool.href, role)) {
    return { ok: false, error: `denied: role ${role} may not access ${tool.href}` };
  }
  try {
    const args = tool.validate(rawArgs) as never;
    return { ok: true, data: await tool.run(args) };
  } catch {
    return { ok: false, error: "invalid_args" };
  }
}
