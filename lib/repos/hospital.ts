// Repository boundary for hospital data.
// Tools and API routes must read through these interfaces, never by
// importing seed data directly. Swapping Json* for Supabase* implementations
// later will not change tool schemas or call sites.

import {
  appointments,
  beds,
  bills,
  discharges,
  labReports,
  medicines,
  patients,
  prescriptions,
  surgeries,
  triageQueue,
  type Appointment,
  type Bed,
  type Bill,
  type LabReport,
  type Medicine,
  type Patient,
  type Prescription,
  type Triage,
} from "@/data/hospital";

export interface PatientRepository {
  search(query: string, limit?: number): Patient[];
  getById(id: string): Patient | undefined;
  getByName(name: string): Patient[];
  statusCounts(): Record<string, number>;
}

export interface BedRepository {
  availability(ward?: string): { ward: string; status: string; count: number }[];
  occupiedIcu(): Bed[];
}

export interface AppointmentRepository {
  list(filter?: { status?: string; doctor?: string }): Appointment[];
  forPatient(name: string): Appointment[];
}

export interface BillingRepository {
  summary(): { status: string; count: number; total: number }[];
  recent(limit?: number): Bill[];
}

export interface LabRepository {
  list(filter?: { patient?: string; status?: string }): LabReport[];
}

export interface TriageRepository {
  waiting(): Triage[];
}

export interface PrescriptionRepository {
  forPatient(name: string): Prescription[];
}

export interface PharmacyRepository {
  lowStock(): Medicine[];
}

function moneyToNumber(s: string): number {
  return Number(String(s).replace(/[^0-9.]/g, "")) || 0;
}

class JsonPatientRepository implements PatientRepository {
  search(query: string, limit = 10): Patient[] {
    const q = query.trim().toLowerCase();
    return patients
      .filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.doctor.toLowerCase().includes(q),
      )
      .slice(0, Math.min(limit, 25));
  }
  getById(id: string): Patient | undefined {
    return patients.find((p) => p.id.toLowerCase() === id.trim().toLowerCase());
  }
  getByName(name: string): Patient[] {
    const q = name.trim().toLowerCase();
    return patients.filter((p) => p.name.toLowerCase() === q).slice(0, 5);
  }
  statusCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const p of patients) counts[p.status] = (counts[p.status] ?? 0) + 1;
    return counts;
  }
}

class JsonBedRepository implements BedRepository {
  availability(ward?: string) {
    const rows = ward
      ? beds.filter((b) => b.ward.toLowerCase() === ward.toLowerCase())
      : beds;
    const map = new Map<string, number>();
    for (const b of rows) {
      const k = `${b.ward}|${b.status}`;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].map(([k, count]) => {
      const [w, status] = k.split("|");
      return { ward: w, status, count };
    });
  }
  occupiedIcu(): Bed[] {
    return beds.filter((b) => b.ward === "ICU" && b.status === "Occupied");
  }
}

class JsonAppointmentRepository implements AppointmentRepository {
  list(filter?: { status?: string; doctor?: string }): Appointment[] {
    return appointments
      .filter((a) => !filter?.status || a.status === filter.status)
      .filter(
        (a) =>
          !filter?.doctor ||
          a.doctor.toLowerCase().includes(filter.doctor.toLowerCase()),
      )
      .slice(0, 30);
  }
  forPatient(name: string): Appointment[] {
    const q = name.trim().toLowerCase();
    return appointments.filter((a) => a.patient.toLowerCase() === q);
  }
}

class JsonBillingRepository implements BillingRepository {
  summary() {
    const map = new Map<string, { count: number; total: number }>();
    for (const b of bills) {
      const e = map.get(b.status) ?? { count: 0, total: 0 };
      e.count += 1;
      e.total += moneyToNumber(b.amount);
      map.set(b.status, e);
    }
    return [...map.entries()].map(([status, v]) => ({ status, ...v }));
  }
  recent(limit = 10): Bill[] {
    return bills.slice(0, Math.min(limit, 25));
  }
}

class JsonLabRepository implements LabRepository {
  list(filter?: { patient?: string; status?: string }): LabReport[] {
    return labReports
      .filter(
        (l) =>
          !filter?.patient ||
          l.patient.toLowerCase().includes(filter.patient.toLowerCase()),
      )
      .filter((l) => !filter?.status || l.status === filter.status)
      .slice(0, 30);
  }
}

class JsonTriageRepository implements TriageRepository {
  waiting(): Triage[] {
    return triageQueue.filter((t) => t.status === "Waiting");
  }
}

class JsonPrescriptionRepository implements PrescriptionRepository {
  forPatient(name: string): Prescription[] {
    const q = name.trim().toLowerCase();
    return prescriptions.filter((p) => p.patient.toLowerCase() === q);
  }
}

class JsonPharmacyRepository implements PharmacyRepository {
  lowStock(): Medicine[] {
    return medicines.filter((m) => m.status !== "In Stock");
  }
}

export const patientRepo: PatientRepository = new JsonPatientRepository();
export const bedRepo: BedRepository = new JsonBedRepository();
export const appointmentRepo: AppointmentRepository =
  new JsonAppointmentRepository();
export const billingRepo: BillingRepository = new JsonBillingRepository();
export const labRepo: LabRepository = new JsonLabRepository();
export const triageRepo: TriageRepository = new JsonTriageRepository();
export const prescriptionRepo: PrescriptionRepository =
  new JsonPrescriptionRepository();
export const pharmacyRepo: PharmacyRepository = new JsonPharmacyRepository();

// Re-exported so tools can stay decoupled from @/data/hospital.
export type { Appointment, Bed, Bill, LabReport, Medicine, Patient, Prescription, Triage };
export { discharges, surgeries };
