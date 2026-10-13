import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function loadLocalEnv(): void {
  try {
    const raw = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#') || !t.includes('=')) continue;
      const i = t.indexOf('=');
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    // ignore
  }
}
loadLocalEnv();
import {
  appointments,
  beds,
  bills,
  discharges,
  expenses,
  healthCampaigns,
  insuranceClaims,
  labReports,
  leaveRequests,
  medicines,
  patients,
  prescriptions,
  staff,
  surgeries,
  triageQueue,
} from '../data/hospital';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('missing supabase env');
const sb = createClient(url, key);

function num(s: string): number {
  return Number(String(s).replace(/[^0-9.]/g, '')) || 0;
}

async function upsert(table: string, rows: Record<string, unknown>[], onConflict: string): Promise<void> {
  if (!rows.length) return;
  const size = 100;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await sb.from(table).upsert(chunk, { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`${table}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
}

await upsert('patients', patients.map((p) => ({
  id: p.id, name: p.name, age: p.age, gender: p.gender, phone: p.phone,
  blood: p.blood, doctor: p.doctor, department: p.department,
  last_visit: p.lastVisit, status: p.status,
})), 'id');

await upsert('staff', staff.map((s) => ({
  name: s.name, role: s.role, department: s.department, patients: s.patients,
  shift: s.shift, status: s.status,
})), 'name');

await upsert('appointments', appointments.map((a) => ({
  id: a.id, patient_name: a.patient, doctor: a.doctor, department: a.department,
  date: a.date, time: a.time, type: a.type, status: a.status,
})), 'id');

await upsert('prescriptions', prescriptions.map((r) => ({
  id: r.id, patient_name: r.patient, patient_age: r.patientAge, doctor: r.doctor,
  department: r.department, date: r.date, diagnosis: r.diagnosis, status: r.status,
})), 'id');

for (const r of prescriptions) {
  const meds = r.medicines.map((m) => ({
    prescription_id: r.id, name: m.name, dosage: m.dosage, duration: m.duration,
  }));
  const { error } = await sb.from('prescription_medicines').upsert(meds);
  if (error) throw new Error(`prescription_medicines ${r.id}: ${error.message}`);
}
console.log('prescription_medicines done');

await upsert('bills', bills.map((b) => ({
  id: b.id, patient_name: b.patient, date: b.date, department: b.department,
  amount_text: b.amount, amount_value: num(b.amount), status: b.status,
})), 'id');

await upsert('medicines', medicines.map((m) => ({
  sku: m.sku, name: m.name, category: m.category, price_text: m.price,
  price_value: num(m.price), stock: m.stock, status: m.status, sold: m.sold,
})), 'sku');

await upsert('beds', beds.map((b) => ({
  id: b.id, ward: b.ward, patient_name: b.patient, doctor: b.doctor,
  since: b.since, status: b.status,
})), 'id');

await upsert('triage_queue', triageQueue.map((t) => ({
  id: t.id, patient_name: t.patient, age: t.age, severity: t.severity,
  complaint: t.complaint, wait_mins: t.waitMins, doctor: t.doctor, status: t.status,
})), 'id');

await upsert('lab_reports', labReports.map((l) => ({
  id: l.id, patient_name: l.patient, test: l.test, doctor: l.doctor,
  date: l.date, status: l.status, result: l.result,
})), 'id');

await upsert('discharges', discharges.map((d) => ({
  id: d.id, patient_name: d.patient, doctor: d.doctor, department: d.department,
  admit_date: d.admitDate, discharge_date: d.dischargeDate, diagnosis: d.diagnosis, status: d.status,
})), 'id');

await upsert('surgeries', surgeries.map((s) => ({
  id: s.id, patient_name: s.patient, procedure: s.procedure, surgeon: s.surgeon,
  ot: s.ot, date: s.date, time: s.time, status: s.status,
})), 'id');

await upsert('health_campaigns', healthCampaigns.map((c) => ({
  name: c.name, channel: c.channel, status: c.status, budget: c.budget,
  spent: c.spent, reached: c.reached, coverage: c.coverage,
})), 'name');

await upsert('insurance_claims', insuranceClaims.map((c) => ({
  id: c.id, patient_name: c.patient, provider: c.provider, amount_text: c.amount,
  amount_value: num(c.amount), date: c.date, status: c.status,
})), 'id');

await upsert('expenses', expenses.map((e) => ({
  id: e.id, item: e.item, category: e.category, amount_text: e.amount,
  amount_value: num(e.amount), date: e.date, by_name: e.by, status: e.status,
})), 'id');

await upsert('leave_requests', leaveRequests.map((l) => ({
  id: l.id, staff_name: l.staff, role: l.role, from_date: l.from, to_date: l.to,
  reason: l.reason, status: l.status,
})), 'id');

console.log('seed complete');
