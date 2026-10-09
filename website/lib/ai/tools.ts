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
  run: (args: never) => unknown;
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
    run: (a) => {
      const args = a as z.infer<typeof searchPatientsArgs>;
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
    run: (a) => {
      const args = a as z.infer<typeof patientBriefArgs>;
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
    run: (a) => bedRepo.availability((a as z.infer<typeof bedAvailabilityArgs>).ward),
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
    run: (a) => {
      const args = a as z.infer<typeof appointmentsArgs>;
      return appointmentRepo.list(args).map((v) => ({
        id: v.id, patient: v.patient, doctor: v.doctor, department: v.department,
        when: `${v.date} ${v.time}`, type: v.type, status: v.status,
      }));
    },
  },
  {
    name: "billing_summary",
    href: "/billing",
    description: "Totals grouped by bill status: counts and amounts in rupees.",
    parameters: { type: "object", properties: {} },
    validate: (a) => noArgs.parse(a),
    run: () => billingRepo.summary(),
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
    run: (a) => {
      const args = a as z.infer<typeof labArgs>;
      return labRepo.list(args).map((l) => ({
        id: l.id, patient: l.patient, test: l.test,
        result: l.result, status: l.status, date: l.date,
      }));
    },
  },
  {
    name: "triage_waiting",
    href: "/triage",
    description: "Current emergency triage waiting queue.",
    parameters: { type: "object", properties: {} },
    validate: (a) => noArgs.parse(a),
    run: () => triageRepo.waiting().map((t) => ({
      id: t.id, patient: t.patient, severity: t.severity,
      complaint: t.complaint, wait_mins: t.waitMins, doctor: t.doctor,
    })),
  },
  {
    name: "pharmacy_alerts",
    href: "/products",
    description: "Medicines low or out of stock.",
    parameters: { type: "object", properties: {} },
    validate: (a) => noArgs.parse(a),
    run: () => pharmacyRepo.lowStock().map((m) => ({
      name: m.name, sku: m.sku, stock: m.stock, status: m.status,
    })),
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
