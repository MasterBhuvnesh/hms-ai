// Hospital Management System mock dataset.
// Deterministic seeded data, no Date.now() / Math.random() at module scope.

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0x48a5f1);

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function group(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function money(n: number): string {
  return "₹" + group(n);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PatientStatus = "Admitted" | "Outpatient" | "Discharged" | "Critical" | "Emergency";

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  blood: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  doctor: string;
  department: string;
  lastVisit: string;
  status: PatientStatus;
};

export type AppointmentStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "No Show";

export type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  type: "Consult" | "Follow-up" | "Emergency" | "Surgery" | "Lab Test";
  status: AppointmentStatus;
};

export type StaffRole =
  | "Doctor"
  | "Nurse"
  | "Receptionist"
  | "Billing Staff"
  | "Pharmacist"
  | "Lab Tech"
  | "Management"
  | "Admin";

export type StaffMember = {
  name: string;
  role: StaffRole;
  department: string;
  patients: number;
  shift: "Morning" | "Evening" | "Night";
  status: "On Duty" | "Off Duty" | "On Leave";
};

export type PrescriptionMedicine = {
  name: string;
  dosage: string;
  duration: string;
};

export type Prescription = {
  id: string;
  patient: string;
  patientAge: number;
  doctor: string;
  department: string;
  date: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  status: "Active" | "Completed" | "Cancelled";
};

export type BillStatus = "Paid" | "Pending" | "Overdue" | "Partial";

export type Bill = {
  id: string;
  patient: string;
  date: string;
  department: string;
  amount: string;
  status: BillStatus;
};

export type Medicine = {
  name: string;
  sku: string;
  category: "Tablets" | "Injections" | "Syrups" | "Surgical" | "IV Fluids";
  price: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  sold: string;
};

// ---------------------------------------------------------------------------
// Pools
// ---------------------------------------------------------------------------

export const DEPARTMENTS = [
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "General",
  "Emergency",
  "Radiology",
  "Pharmacy",
] as const;

const FIRST = [
  "Aarav", "Ananya", "Rohan", "Priya", "Kabir", "Meera", "Arjun", "Divya",
  "Vikram", "Sneha", "Rahul", "Pooja", "Karan", "Nisha", "Amit", "Shreya",
  "Rajesh", "Kavya", "Suresh", "Anita", "Manoj", "Ritu", "Sanjay", "Geeta",
  "Deepak", "Shalini", "Vikas", "Pooja", "Nikhil", "Tara", "Farhan", "Zoya",
];

const LAST = [
  "Sharma", "Verma", "Patel", "Iyer", "Khan", "Gupta", "Mehta", "Reddy",
  "Nair", "Singh", "Joshi", "Das", "Kulkarni", "Chopra", "Bose", "Menon",
];

const DOCTORS = [
  "Dr. Aditi Rao",
  "Dr. Jonas Weber",
  "Dr. Mei Lin",
  "Dr. Tom Okafor",
  "Dr. Sara Kim",
  "Dr. Leo Martins",
  "Dr. Nina Petrova",
  "Dr. Hana Suzuki",
];

const MEDICINE_NAMES: { name: string; category: Medicine["category"] }[] = [
  { name: "Paracetamol 500mg", category: "Tablets" },
  { name: "Amoxicillin 250mg", category: "Tablets" },
  { name: "Azithromycin 500mg", category: "Tablets" },
  { name: "Ceftriaxone 1g Inj", category: "Injections" },
  { name: "Insulin Glargine", category: "Injections" },
  { name: "Cough Relief Syrup", category: "Syrups" },
  { name: "ORS Powder", category: "Syrups" },
  { name: "Surgical Gloves (Box)", category: "Surgical" },
  { name: "Suture Kit 3-0", category: "Surgical" },
  { name: "NS 500ml IV", category: "IV Fluids" },
  { name: "RL 500ml IV", category: "IV Fluids" },
  { name: "Metformin 500mg", category: "Tablets" },
];

const DIAGNOSES = [
  "Acute viral fever",
  "Type 2 Diabetes Mellitus",
  "Hypertension Stage 1",
  "Lower back pain",
  "Acute bronchitis",
  "Migraine",
  "Gastritis",
  "Post-op review - Knee",
  "Pediatric URI",
  "Chest pain - under eval",
];

const BLOOD: Patient["blood"][] = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

function personName(): string {
  return `${pick(FIRST)} ${pick(LAST)}`;
}

export const patients: Patient[] = Array.from({ length: 64 }, (_, i) => {
  const r = rng();
  const status: PatientStatus =
    r < 0.35 ? "Outpatient" : r < 0.55 ? "Admitted" : r < 0.75 ? "Discharged" : r < 0.9 ? "Emergency" : "Critical";
  return {
    id: `P-${1001 + i}`,
    name: personName(),
    age: randInt(2, 84),
    gender: pick(["Male", "Female", "Female", "Male", "Other"] as const),
    phone: `+91 ${randInt(70000, 99999)} ${randInt(10000, 99999)}`,
    blood: pick(BLOOD),
    doctor: pick(DOCTORS),
    department: pick(DEPARTMENTS),
    lastVisit: `${randInt(1, 28)} ${pick(["Sep", "Oct", "Nov"])} 2025`,
    status,
  };
});

export const appointments: Appointment[] = Array.from({ length: 53 }, (_, i) => {
  const r = rng();
  const status: AppointmentStatus =
    r < 0.45 ? "Scheduled" : r < 0.6 ? "Completed" : r < 0.72 ? "In Progress" : r < 0.9 ? "Cancelled" : "No Show";
  return {
    id: `APT-${5001 + i}`,
    patient: pick(patients).name,
    doctor: pick(DOCTORS),
    department: pick(DEPARTMENTS),
    date: `${randInt(1, 28)} ${pick(["Oct", "Nov"])} 2025`,
    time: `${randInt(9, 18)}:${pick(["00", "15", "30", "45"])}`,
    type: pick(["Consult", "Follow-up", "Follow-up", "Emergency", "Surgery", "Lab Test"] as const),
    status,
  };
});

export const staff: StaffMember[] = [
  { name: "Dr. Aditi Rao", role: "Doctor", department: "Cardiology", patients: 48, shift: "Morning", status: "On Duty" },
  { name: "Dr. Jonas Weber", role: "Doctor", department: "Orthopedics", patients: 42, shift: "Morning", status: "On Duty" },
  { name: "Dr. Mei Lin", role: "Doctor", department: "Pediatrics", patients: 51, shift: "Evening", status: "On Duty" },
  { name: "Dr. Tom Okafor", role: "Doctor", department: "Neurology", patients: 33, shift: "Morning", status: "Off Duty" },
  { name: "Nurse Sara Kim", role: "Nurse", department: "Emergency", patients: 27, shift: "Night", status: "On Duty" },
  { name: "Nurse Leo Martins", role: "Nurse", department: "General", patients: 24, shift: "Evening", status: "On Duty" },
  { name: "Nina Petrova", role: "Receptionist", department: "General", patients: 60, shift: "Morning", status: "On Duty" },
  { name: "Hana Suzuki", role: "Billing Staff", department: "General", patients: 38, shift: "Morning", status: "On Duty" },
  { name: "Diego Alvarez", role: "Pharmacist", department: "Pharmacy", patients: 44, shift: "Evening", status: "On Duty" },
  { name: "Lucas Silva", role: "Lab Tech", department: "Radiology", patients: 31, shift: "Morning", status: "On Leave" },
  { name: "Bhuvnesh Verma", role: "Admin", department: "General", patients: 12, shift: "Morning", status: "On Duty" },
  { name: "Emma Johansson", role: "Management", department: "General", patients: 18, shift: "Morning", status: "On Duty" },
];

export const prescriptions: Prescription[] = Array.from({ length: 42 }, (_, i) => {
  const patient = pick(patients);
  const medCount = randInt(1, 4);
  const meds: PrescriptionMedicine[] = Array.from({ length: medCount }, () => {
    const m = pick(MEDICINE_NAMES);
    return {
      name: m.name,
      dosage: pick(["1-0-1", "1-0-0", "0-0-1", "1-1-1", "SOS", "0-1-0"]),
      duration: pick(["3 days", "5 days", "7 days", "14 days", "30 days"]),
    };
  });
  const r = rng();
  return {
    id: `RX-${9001 + i}`,
    patient: patient.name,
    patientAge: patient.age,
    doctor: pick(DOCTORS),
    department: pick(DEPARTMENTS),
    date: `${randInt(1, 28)} ${pick(["Oct", "Nov"])} 2025`,
    diagnosis: pick(DIAGNOSES),
    medicines: meds,
    status: r < 0.6 ? "Active" : r < 0.9 ? "Completed" : "Cancelled",
  };
});

export const bills: Bill[] = Array.from({ length: 48 }, (_, i) => {
  const r = rng();
  return {
    id: `BILL-${7001 + i}`,
    patient: pick(patients).name,
    date: `${randInt(1, 28)} ${pick(["Oct", "Nov"])} 2025`,
    department: pick(DEPARTMENTS),
    amount: money(randInt(500, 85000)),
    status: r < 0.6 ? "Paid" : r < 0.8 ? "Pending" : r < 0.92 ? "Partial" : "Overdue",
  };
});

export const medicines: Medicine[] = MEDICINE_NAMES.map(({ name, category }, i) => {
  const r = rng();
  const stock = r < 0.12 ? 0 : r < 0.3 ? randInt(1, 15) : randInt(16, 400);
  return {
    name,
    sku: `MED-${3100 + i}`,
    category,
    price: money(randInt(25, 850)),
    stock,
    status: stock === 0 ? "Out of Stock" : stock <= 15 ? "Low Stock" : "In Stock",
    sold: group(randInt(80, 3200)),
  };
});

export const hospitalKpis = [
  { label: "Today's Patients", value: "184", suffix: "", delta: "+12", deltaLabel: "vs yesterday", spark: [4, 6, 5, 8, 6, 9, 7, 10, 8, 12] },
  { label: "Bed Occupancy", value: "78%", suffix: "42 beds", delta: "+4%", deltaLabel: "vs last week", spark: [5, 6, 4, 7, 8, 7, 9, 8, 10, 12] },
  { label: "Avg Wait Time", value: "18m", suffix: "", delta: "-3m", deltaLabel: "vs last week", spark: [10, 9, 8, 9, 7, 8, 6, 5, 6, 12] },
  { label: "Today's Revenue", value: "₹24,680", suffix: "", delta: "+8,2%", deltaLabel: "vs yesterday", spark: [4, 7, 3, 8, 5, 9, 4, 10, 6, 12] },
];

// ---------------------------------------------------------------------------
// Extended modules
// ---------------------------------------------------------------------------

export type BedStatus = "Occupied" | "Available" | "Cleaning" | "Maintenance";

export type Bed = {
  id: string;
  ward: "ICU" | "General" | "Emergency" | "Pediatrics" | "Maternity";
  patient: string;
  doctor: string;
  since: string;
  status: BedStatus;
};

export type Triage = {
  id: string;
  patient: string;
  age: number;
  severity: "Critical" | "Urgent" | "Stable";
  complaint: string;
  waitMins: number;
  doctor: string;
  status: "Waiting" | "In Progress" | "Admitted" | "Discharged";
};

export type LabReport = {
  id: string;
  patient: string;
  test: string;
  doctor: string;
  date: string;
  status: "Sample Collected" | "In Progress" | "Ready" | "Critical";
  result: string;
};

export type Discharge = {
  id: string;
  patient: string;
  doctor: string;
  department: string;
  admitDate: string;
  dischargeDate: string;
  diagnosis: string;
  status: "Ready" | "Completed" | "Pending";
};

export type Surgery = {
  id: string;
  patient: string;
  procedure: string;
  surgeon: string;
  ot: "OT-1" | "OT-2" | "OT-3";
  date: string;
  time: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
};

export type HealthCampaign = {
  name: string;
  channel: "Camp" | "SMS" | "Email" | "Poster" | "ASHA Visit";
  status: "Active" | "Paused" | "Ended";
  budget: string;
  spent: string;
  reached: string;
  coverage: string;
};

export type InsuranceClaim = {
  id: string;
  patient: string;
  provider: "Star Health" | "HDFC Ergo" | "ICICI Lombard" | "CGHS" | "Ayushman";
  amount: string;
  date: string;
  status: "Submitted" | "Approved" | "Rejected" | "Pending Docs";
};

export type Expense = {
  id: string;
  item: string;
  category: "Pharmacy Purchase" | "Equipment" | "Salaries" | "Maintenance" | "Utilities";
  amount: string;
  date: string;
  by: string;
  status: "Paid" | "Pending" | "Overdue";
};

export type LeaveRequest = {
  id: string;
  staff: string;
  role: string;
  from: string;
  to: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const beds: Bed[] = Array.from({ length: 36 }, (_, i) => {
  const r = rng();
  const status: BedStatus = r < 0.6 ? "Occupied" : r < 0.8 ? "Available" : r < 0.9 ? "Cleaning" : "Maintenance";
  const p = pick(patients);
  return {
    id: `B-${101 + i}`,
    ward: pick(["ICU", "General", "Emergency", "Pediatrics", "Maternity"] as const),
    patient: status === "Occupied" ? p.name : "-",
    doctor: status === "Occupied" ? p.doctor : pick(DOCTORS),
    since: `${randInt(1, 28)} Oct 2025`,
    status,
  };
});

export const triageQueue: Triage[] = Array.from({ length: 18 }, (_, i) => {
  const p = pick(patients);
  const r = rng();
  return {
    id: `T-${201 + i}`,
    patient: p.name,
    age: p.age,
    severity: r < 0.2 ? "Critical" : r < 0.55 ? "Urgent" : "Stable",
    complaint: pick(["Chest pain", "Fever + breathlessness", "Road accident", "Head injury", "Abdominal pain", "High fever"] as const),
    waitMins: randInt(2, 95),
    doctor: pick(DOCTORS),
    status: r < 0.55 ? "Waiting" : r < 0.75 ? "In Progress" : r < 0.9 ? "Admitted" : "Discharged",
  };
});

export const labReports: LabReport[] = Array.from({ length: 32 }, (_, i) => {
  const p = pick(patients);
  const r = rng();
  return {
    id: `LAB-${3001 + i}`,
    patient: p.name,
    test: pick(["CBC", "HbA1c", "Lipid Profile", "Chest X-Ray", "ECG", "MRI Brain", "Urine R/M", "Thyroid T3T4TSH"] as const),
    doctor: pick(DOCTORS),
    date: `${randInt(1, 28)} ${pick(["Oct", "Nov"])} 2025`,
    status: r < 0.3 ? "Ready" : r < 0.55 ? "In Progress" : r < 0.8 ? "Sample Collected" : "Critical",
    result: pick(["Normal", "High WBC", "Hb 9.2 low", "Awaiting", "Borderline"] as const),
  };
});

export const discharges: Discharge[] = Array.from({ length: 24 }, (_, i) => {
  const p = pick(patients);
  return {
    id: `DS-${4001 + i}`,
    patient: p.name,
    doctor: pick(DOCTORS),
    department: pick(DEPARTMENTS),
    admitDate: `${randInt(1, 20)} Oct 2025`,
    dischargeDate: `${randInt(21, 28)} Oct 2025`,
    diagnosis: pick(DIAGNOSES),
    status: pick(["Ready", "Completed", "Completed", "Pending"] as const),
  };
});

export const surgeries: Surgery[] = Array.from({ length: 16 }, (_, i) => {
  const p = pick(patients);
  const r = rng();
  return {
    id: `SURG-${501 + i}`,
    patient: p.name,
    procedure: pick(["Knee Replacement", "Appendectomy", "Cataract", "C-Section", "Hernia Repair", "Fracture Fixation"] as const),
    surgeon: pick(DOCTORS),
    ot: pick(["OT-1", "OT-2", "OT-3"] as const),
    date: `${randInt(1, 28)} Nov 2025`,
    time: `${randInt(8, 16)}:${pick(["00", "30"])}`,
    status: r < 0.5 ? "Scheduled" : r < 0.65 ? "In Progress" : r < 0.9 ? "Completed" : "Cancelled",
  };
});

export const healthCampaigns: HealthCampaign[] = [
  { name: "Polio Drive Nov", channel: "Camp", status: "Active", budget: "₹3,000", spent: "₹2,140", reached: "12,480", coverage: "4,2%" },
  { name: "Diabetes Screening", channel: "SMS", status: "Active", budget: "₹2,500", spent: "₹1,860", reached: "9,320", coverage: "3,9%" },
  { name: "Blood Donation Camp", channel: "Camp", status: "Active", budget: "₹4,000", spent: "₹3,610", reached: "15,205", coverage: "4,8%" },
  { name: "Flu Vaccination", channel: "Email", status: "Paused", budget: "₹800", spent: "₹430", reached: "3,115", coverage: "2,7%" },
  { name: "Antenatal Checkup", channel: "ASHA Visit", status: "Paused", budget: "₹1,500", spent: "₹920", reached: "4,470", coverage: "2,3%" },
  { name: "TB Awareness", channel: "Poster", status: "Ended", budget: "₹2,000", spent: "₹2,000", reached: "8,660", coverage: "3,1%" },
  { name: "Eye Checkup Camp", channel: "Camp", status: "Ended", budget: "₹3,200", spent: "₹3,200", reached: "22,340", coverage: "5,6%" },
];

export const insuranceClaims: InsuranceClaim[] = Array.from({ length: 28 }, (_, i) => {
  const r = rng();
  return {
    id: `CLM-${6001 + i}`,
    patient: pick(patients).name,
    provider: pick(["Star Health", "HDFC Ergo", "ICICI Lombard", "CGHS", "Ayushman"] as const),
    amount: money(randInt(8000, 250000)),
    date: `${randInt(1, 28)} Oct 2025`,
    status: r < 0.4 ? "Submitted" : r < 0.65 ? "Approved" : r < 0.85 ? "Pending Docs" : "Rejected",
  };
});

export const expenses: Expense[] = Array.from({ length: 26 }, (_, i) => {
  const r = rng();
  return {
    id: `EXP-${8001 + i}`,
    item: pick(["Antibiotics bulk", "Syringes 5ml", "ECG machine service", "Nurse salaries Oct", "Diesel generator", "MRI AMC", "Gloves boxes"] as const),
    category: pick(["Pharmacy Purchase", "Equipment", "Salaries", "Maintenance", "Utilities"] as const),
    amount: money(randInt(2000, 180000)),
    date: `${randInt(1, 28)} Oct 2025`,
    by: pick(["Bhuvnesh Verma", "Emma Johansson", "Hana Suzuki"] as const),
    status: r < 0.65 ? "Paid" : r < 0.85 ? "Pending" : "Overdue",
  };
});

export const leaveRequests: LeaveRequest[] = Array.from({ length: 14 }, (_, i) => {
  const s = pick(staff);
  const r = rng();
  return {
    id: `LV-${901 + i}`,
    staff: s.name,
    role: s.role,
    from: `${randInt(10, 20)} Nov 2025`,
    to: `${randInt(21, 28)} Nov 2025`,
    reason: pick(["Fever", "Family function", "Conference", "Casual"] as const),
    status: r < 0.5 ? "Pending" : r < 0.8 ? "Approved" : "Rejected",
  };
});

// ---------------------------------------------------------------------------
// Intentional dedupe-review seeds: 3 deterministic near-duplicates derived
// from existing patients (ZERO rng()/randInt()/pick() calls below, so the
// seeded sequence above is untouched). Surfaced by the Possible Duplicates
// panel on the Patients page.
// ---------------------------------------------------------------------------
const dupBase0 = patients[0];
const dupBase1 = patients[1];
const dupBase2 = patients[2];

function withDoubleSpace(name: string): string {
  const parts = name.split(" ");
  return `${parts[0]}  ${parts.slice(1).join(" ")}`;
}

function withLastDigitChanged(phone: string): string {
  const last = phone.slice(-1);
  const alt = last === "9" ? "8" : String(Number(last) + 1);
  return phone.slice(0, -1) + alt;
}

function withLowerLastName(name: string): string {
  const parts = name.split(" ");
  return [...parts.slice(0, -1), parts[parts.length - 1].toLowerCase()].join(" ");
}

patients.push(
  { ...dupBase0, id: "P-2001", name: withDoubleSpace(dupBase0.name), phone: withLastDigitChanged(dupBase0.phone) },
  { ...dupBase1, id: "P-2002", name: withLowerLastName(dupBase1.name), age: dupBase1.age + 1 },
  { ...dupBase2, id: "P-2003", name: `${dupBase2.name} ` },
);
