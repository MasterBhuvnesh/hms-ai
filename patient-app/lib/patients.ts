import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

export type PatientRow = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  blood: string;
  doctor: string;
  department: string;
  last_visit: string;
  status: string;
  clerk_user_id: string | null;
  email: string | null;
};

export async function getMyPatient(
  client: SupabaseClient = supabase,
  clerkUserId?: string | null
): Promise<PatientRow | null> {
  if (!clerkUserId) return null;
  const { data, error } = await client
    .from('patients')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as PatientRow | null) ?? null;
}

export async function linkPatientToClerk(
  client: SupabaseClient = supabase,
  patientId: string,
  clerkUserId: string
): Promise<void> {
  const { error } = await client
    .from('patients')
    .update({ clerk_user_id: clerkUserId })
    .eq('id', patientId);
  if (error) throw new Error(error.message);
}

export async function ensurePatientForClerk(
  client: SupabaseClient = supabase,
  input: { clerkUserId: string; email?: string | null; fullName?: string | null }
): Promise<PatientRow> {
  const email = input.email?.trim().toLowerCase() || null;
  const byId = await client
    .from('patients')
    .select('*')
    .eq('clerk_user_id', input.clerkUserId)
    .maybeSingle();
  if (byId.error) throw new Error(byId.error.message);
  if (byId.data) return byId.data as PatientRow;

  if (email) {
    const byEmail = await client
      .from('patients')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (byEmail.error) throw new Error(byEmail.error.message);
    if (byEmail.data) {
      const row = byEmail.data as PatientRow;
      if (!row.clerk_user_id) {
        const { error } = await client
          .from('patients')
          .update({ clerk_user_id: input.clerkUserId })
          .eq('id', row.id);
        if (error) throw new Error(error.message);
        return { ...row, clerk_user_id: input.clerkUserId };
      }
      return row;
    }
  }

  const name =
    input.fullName?.trim() ||
    (email ? email.split('@')[0].replace(/[._-]+/g, ' ') : 'New Patient');
  const id = `P-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
  const payload = {
    id,
    name,
    age: 0,
    gender: 'Other',
    phone: '',
    blood: 'O+',
    doctor: 'TBD',
    department: 'General',
    last_visit: '',
    status: 'Outpatient',
    clerk_user_id: input.clerkUserId,
    email,
  };
  const { data, error } = await client
    .from('patients')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as PatientRow;
}

export const PATIENT_GENDERS = ['Male', 'Female', 'Other'] as const;

export const PATIENT_BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
] as const;

export type PatientProfilePatch = {
  name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  blood?: string;
};

export async function updatePatientProfile(
  client: SupabaseClient = supabase,
  clerkUserId: string,
  patch: PatientProfilePatch
): Promise<PatientRow> {
  const update: Record<string, string | number> = {};
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) throw new Error('Name is required');
    update.name = name;
  }
  if (patch.age !== undefined) {
    if (!Number.isInteger(patch.age) || patch.age < 0 || patch.age > 130) {
      throw new Error('Age must be 0-130');
    }
    update.age = patch.age;
  }
  if (patch.gender !== undefined) {
    if (!(PATIENT_GENDERS as readonly string[]).includes(patch.gender)) {
      throw new Error('Invalid gender');
    }
    update.gender = patch.gender;
  }
  if (patch.phone !== undefined) update.phone = patch.phone.trim();
  if (patch.blood !== undefined) {
    if (!(PATIENT_BLOOD_GROUPS as readonly string[]).includes(patch.blood)) {
      throw new Error('Invalid blood group');
    }
    update.blood = patch.blood;
  }
  const { data, error } = await client
    .from('patients')
    .update(update)
    .eq('clerk_user_id', clerkUserId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as PatientRow;
}

export async function getAppointmentsForPatient(
  client: SupabaseClient = supabase,
  patientName: string
) {
  const { data, error } = await client
    .from('appointments')
    .select('*')
    .eq('patient_name', patientName)
    .limit(30);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPrescriptionsForPatient(
  client: SupabaseClient = supabase,
  patientName: string
) {
  const { data, error } = await client
    .from('prescriptions')
    .select('*,prescription_medicines(name,dosage,duration)')
    .eq('patient_name', patientName);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLabsForPatient(
  client: SupabaseClient = supabase,
  patientName: string
) {
  const { data, error } = await client
    .from('lab_reports')
    .select('*')
    .eq('patient_name', patientName)
    .limit(30);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBillsForPatient(
  client: SupabaseClient = supabase,
  patientName: string
) {
  const { data, error } = await client
    .from('bills')
    .select('*')
    .eq('patient_name', patientName)
    .limit(30);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getDischargesForPatient(
  client: SupabaseClient = supabase,
  patientName: string
) {
  const { data, error } = await client
    .from('discharges')
    .select('*')
    .eq('patient_name', patientName)
    .limit(30);
  if (error) throw new Error(error.message);
  return data ?? [];
}
