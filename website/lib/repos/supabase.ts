// Supabase implementations for hospital repos.
// No Supabase Auth here. Website uses open RLS read/write phase.
// Clerk is patient-app only. Third-party Clerk integration is configured
// in Supabase dashboard, local CLI equivalent is documented in
// patient-app/utils/supabase.ts.
import { requireSupabase } from "@/lib/supabase";
import type {
  Appointment,
  Bed,
  LabReport,
  Medicine,
  Patient,
  Prescription,
  Triage,
} from "@/lib/repos/hospital";

function toPatient(r: Record<string, string | number>): Patient {
  return {
    id: String(r.id),
    name: String(r.name),
    age: Number(r.age),
    gender: r.gender as Patient["gender"],
    phone: String(r.phone),
    blood: r.blood as Patient["blood"],
    doctor: String(r.doctor),
    department: String(r.department),
    lastVisit: String(r.last_visit ?? r.lastVisit ?? ""),
    status: r.status as Patient["status"],
  };
}

export async function searchPatients(query: string, limit = 10): Promise<Patient[]> {
  const sb = requireSupabase();
  const q = query.trim();
  const { data, error } = await sb
    .from("patients")
    .select("*")
    .or(`id.ilike.%${q}%,name.ilike.%${q}%,doctor.ilike.%${q}%`)
    .limit(Math.min(limit, 25));
  if (error) throw new Error(error.message);
  return (data ?? []).map(toPatient);
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("patients").select("*").eq("id", id.trim()).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toPatient(data) : undefined;
}

export async function getPatientsByName(name: string): Promise<Patient[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("patients").select("*").ilike("name", name.trim()).limit(5);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toPatient);
}

export async function patientStatusCounts(): Promise<Record<string, number>> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("patients").select("status");
  if (error) throw new Error(error.message);
  const counts: Record<string, number> = {};
  for (const r of data ?? []) counts[String(r.status)] = (counts[String(r.status)] ?? 0) + 1;
  return counts;
}

export async function bedAvailability(ward?: string) {
  const sb = requireSupabase();
  let q = sb.from("beds").select("ward,status");
  if (ward) q = q.eq("ward", ward);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const map = new Map<string, number>();
  for (const b of data ?? []) {
    const k = `${String(b.ward)}|${String(b.status)}`;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([k, count]) => {
    const [w, status] = k.split("|");
    return { ward: w, status, count };
  });
}

export async function occupiedIcu(): Promise<Bed[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("beds").select("*").eq("ward", "ICU").eq("status", "Occupied");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    ward: r.ward as Bed["ward"],
    patient: String(r.patient_name),
    doctor: String(r.doctor),
    since: String(r.since),
    status: r.status as Bed["status"],
  }));
}

export async function listAppointments(filter?: { status?: string; doctor?: string }): Promise<Appointment[]> {
  const sb = requireSupabase();
  let q = sb.from("appointments").select("*").limit(30);
  if (filter?.status) q = q.eq("status", filter.status);
  if (filter?.doctor) q = q.ilike("doctor", `%${filter.doctor}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    patient: String(r.patient_name),
    doctor: String(r.doctor),
    department: String(r.department),
    date: String(r.date),
    time: String(r.time),
    type: r.type as Appointment["type"],
    status: r.status as Appointment["status"],
  }));
}

export async function billingSummary() {
  const sb = requireSupabase();
  const { data, error } = await sb.from("bills").select("status,amount_value");
  if (error) throw new Error(error.message);
  const map = new Map<string, { count: number; total: number }>();
  for (const b of data ?? []) {
    const e = map.get(String(b.status)) ?? { count: 0, total: 0 };
    e.count += 1;
    e.total += Number(b.amount_value) || 0;
    map.set(String(b.status), e);
  }
  return [...map.entries()].map(([status, v]) => ({ status, ...v }));
}

export async function labList(filter?: { patient?: string; status?: string }): Promise<LabReport[]> {
  const sb = requireSupabase();
  let q = sb.from("lab_reports").select("*").limit(30);
  if (filter?.patient) q = q.ilike("patient_name", `%${filter.patient}%`);
  if (filter?.status) q = q.eq("status", filter.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    patient: String(r.patient_name),
    test: String(r.test),
    doctor: String(r.doctor),
    date: String(r.date),
    status: r.status as LabReport["status"],
    result: String(r.result),
  }));
}

export async function triageWaiting(): Promise<Triage[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("triage_queue").select("*").eq("status", "Waiting");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    patient: String(r.patient_name),
    age: Number(r.age),
    severity: r.severity as Triage["severity"],
    complaint: String(r.complaint),
    waitMins: Number(r.wait_mins),
    doctor: String(r.doctor),
    status: r.status as Triage["status"],
  }));
}

export async function prescriptionsForPatient(name: string): Promise<Prescription[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("prescriptions").select("*,prescription_medicines(name,dosage,duration)").ilike("patient_name", name.trim());
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    patient: String(r.patient_name),
    patientAge: Number(r.patient_age),
    doctor: String(r.doctor),
    department: String(r.department),
    date: String(r.date),
    diagnosis: String(r.diagnosis),
    medicines: ((r.prescription_medicines ?? []) as { name: string; dosage: string; duration: string }[]).map((m) => ({
      name: String(m.name),
      dosage: String(m.dosage),
      duration: String(m.duration),
    })),
    status: r.status as Prescription["status"],
  }));
}

export async function pharmacyLowStock(): Promise<Medicine[]> {  const sb = requireSupabase();
  const { data, error } = await sb.from("medicines").select("*").neq("status", "In Stock");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    name: String(r.name),
    sku: String(r.sku),
    category: r.category as Medicine["category"],
    price: String(r.price_text),
    stock: Number(r.stock),
    status: r.status as Medicine["status"],
    sold: String(r.sold),
  }));
}

function toBed(r: Record<string, string>): Bed {
  return {
    id: String(r.id),
    ward: r.ward as Bed["ward"],
    patient: String(r.patient_name),
    doctor: String(r.doctor),
    since: String(r.since),
    status: r.status as Bed["status"],
  };
}

export async function listBeds(): Promise<Bed[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("beds").select("*").order("id").limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toBed);
}

export async function addBed(b: Bed): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("beds").insert({
    id: b.id,
    ward: b.ward,
    patient_name: b.patient,
    doctor: b.doctor,
    since: b.since,
    status: b.status,
  });
  if (error) throw new Error(error.message);
}

export async function updateBed(
  id: string,
  patch: Partial<Pick<Bed, "ward" | "patient" | "doctor" | "status">>,
): Promise<void> {
  const sb = requireSupabase();
  const update: Record<string, string> = {};
  if (patch.ward !== undefined) update.ward = patch.ward;
  if (patch.patient !== undefined) update.patient_name = patch.patient;
  if (patch.doctor !== undefined) update.doctor = patch.doctor;
  if (patch.status !== undefined) update.status = patch.status;
  const { error } = await sb.from("beds").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBed(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("beds").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function billAmountValue(amount: string): number {
  return Number(String(amount).replace(/[^0-9.]/g, "")) || 0;
}

export async function addBill(b: {
  id: string;
  patient: string;
  date: string;
  department: string;
  amount: string;
  status: string;
}): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("bills").insert({
    id: b.id,
    patient_name: b.patient,
    date: b.date,
    department: b.department,
    amount_text: b.amount,
    amount_value: billAmountValue(b.amount),
    status: b.status,
  });
  if (error) throw new Error(error.message);
}
