// Central permission map for the hospital dashboard.
// Sidebar filtering and dashboard sections both read from here.
// Keep in sync with the matrix in app/roles/page.tsx.

export const HOSPITAL_ROLE_NAMES = [
  "Admin",
  "Management",
  "Doctor",
  "Nurse",
  "Receptionist",
  "Billing Staff",
  "Pharmacist",
  "Lab Tech",
] as const;

export type HospitalRole = (typeof HOSPITAL_ROLE_NAMES)[number];

export const DEFAULT_ROLE: HospitalRole = "Admin";

export function normalizeRole(raw: string | null | undefined): HospitalRole {
  if (!raw) return DEFAULT_ROLE;
  const match = HOSPITAL_ROLE_NAMES.find(
    (r) => r.toLowerCase() === raw.toLowerCase(),
  );
  return match ?? DEFAULT_ROLE;
}

// Sidebar hrefs each role may visit. "/" (Dashboard) is allowed for all.
const ALL_HREFS = [
  "/",
  "/orders",
  "/schedule",
  "/customers",
  "/triage",
  "/team",
  "/shifts",
  "/prescriptions",
  "/lab",
  "/discharge",
  "/surgeries",
  "/channels",
  "/products",
  "/billing",
  "/transactions",
  "/insurance",
  "/expenses",
  "/campaigns",
  "/roles",
  "/reports",
  "/messages",
  "/integrations",
  "/support",
  "/help",
  "/settings",
];

export const ROLE_NAV_ACCESS: Record<HospitalRole, string[]> = {
  Admin: ALL_HREFS,
  Management: ALL_HREFS.filter((h) => h !== "/settings"),
  Doctor: [
    "/",
    "/orders",
    "/schedule",
    "/customers",
    "/triage",
    "/prescriptions",
    "/lab",
    "/discharge",
    "/surgeries",
    "/channels",
    "/messages",
    "/support",
    "/help",
  ],
  Nurse: [
    "/",
    "/orders",
    "/schedule",
    "/customers",
    "/triage",
    "/prescriptions",
    "/discharge",
    "/surgeries",
    "/channels",
    "/products",
    "/messages",
    "/support",
    "/help",
  ],
  Receptionist: [
    "/",
    "/orders",
    "/schedule",
    "/customers",
    "/triage",
    "/channels",
    "/messages",
    "/support",
    "/help",
  ],
  "Billing Staff": [
    "/",
    "/customers",
    "/billing",
    "/transactions",
    "/insurance",
    "/expenses",
    "/messages",
    "/support",
    "/help",
  ],
  Pharmacist: [
    "/",
    "/prescriptions",
    "/products",
    "/messages",
    "/support",
    "/help",
  ],
  "Lab Tech": ["/", "/lab", "/messages", "/support", "/help"],
};

export function canAccess(href: string | undefined, role: string): boolean {
  if (!href || href === "#") return true;
  const allowed = ROLE_NAV_ACCESS[normalizeRole(role)];
  return allowed.includes(href);
}

// Sidebar `active` label -> route href, so Shell can guard pages.
export const ACTIVE_HREFS: Record<string, string> = {
  Dashboard: "/",
  Appointments: "/orders",
  Schedule: "/schedule",
  Patients: "/customers",
  Triage: "/triage",
  "Doctors & Staff": "/team",
  "Shifts & Leaves": "/shifts",
  Prescriptions: "/prescriptions",
  "Lab Reports": "/lab",
  Discharges: "/discharge",
  Discharge: "/discharge",
  Surgeries: "/surgeries",
  "Beds & Wards": "/channels",
  Pharmacy: "/products",
  "Billing & Invoices": "/billing",
  Payments: "/transactions",
  "Insurance Claims": "/insurance",
  Expenses: "/expenses",
  "Health Campaigns": "/campaigns",
  "Roles & Permissions": "/roles",
  "Reports & Analytics": "/reports",
  Messages: "/messages",
  Integrations: "/integrations",
  Helpdesk: "/support",
  "Customer Support": "/support",
  "Help Center": "/help",
  "System Settings": "/settings",
};

// Hrefs where a role may create/update. Delete is Admin + Management only.
const ROLE_WRITE: Record<HospitalRole, string[]> = {
  Admin: ALL_HREFS,
  Management: ALL_HREFS.filter((h) => h !== "/settings"),
  Doctor: ["/orders", "/schedule", "/customers", "/triage", "/prescriptions", "/discharge", "/surgeries", "/support"],
  Nurse: ["/customers", "/triage", "/channels", "/discharge", "/support"],
  Receptionist: ["/orders", "/schedule", "/customers", "/support"],
  "Billing Staff": ["/billing", "/transactions", "/insurance", "/expenses", "/support"],
  Pharmacist: ["/products", "/support"],
  "Lab Tech": ["/lab", "/support"],
};

export function canWrite(href: string | undefined, role: string): boolean {
  if (!href || href === "#") return true;
  const r = normalizeRole(role);
  if (r === "Admin") return true;
  if (r === "Management") return canAccess(href, r);
  return ROLE_WRITE[r].includes(href);
}

export function canDelete(href: string | undefined, role: string): boolean {
  if (!href || href === "#") return true;
  const r = normalizeRole(role);
  if (r === "Admin") return true;
  return r === "Management" && canAccess(href, r);
}

// Dashboard sections per role.
export type DashboardAccess = {
  kpis: string[];
  showAdmissions: boolean;
  showPayments: boolean;
  note: string;
};

const CLINICAL_KPIS = ["Today's Patients", "Bed Occupancy", "Avg Wait Time"];
const FINANCE_KPIS = ["Today's Revenue"];

export const ROLE_DASHBOARD_ACCESS: Record<HospitalRole, DashboardAccess> = {
  Admin: {
    kpis: [...CLINICAL_KPIS, ...FINANCE_KPIS],
    showAdmissions: true,
    showPayments: true,
    note: "Full hospital access.",
  },
  Management: {
    kpis: [...CLINICAL_KPIS, ...FINANCE_KPIS],
    showAdmissions: true,
    showPayments: true,
    note: "Departments, occupancy and revenue.",
  },
  Doctor: {
    kpis: CLINICAL_KPIS,
    showAdmissions: true,
    showPayments: false,
    note: "Your patients, appointments and admissions.",
  },
  Nurse: {
    kpis: CLINICAL_KPIS,
    showAdmissions: true,
    showPayments: false,
    note: "Ward care, triage and dispensing.",
  },
  Receptionist: {
    kpis: CLINICAL_KPIS,
    showAdmissions: true,
    showPayments: false,
    note: "Registration, booking and triage queue.",
  },
  "Billing Staff": {
    kpis: FINANCE_KPIS,
    showAdmissions: false,
    showPayments: true,
    note: "Bills, payments, claims and dues.",
  },
  Pharmacist: {
    kpis: ["Bed Occupancy", "Avg Wait Time"],
    showAdmissions: true,
    showPayments: false,
    note: "Prescriptions and pharmacy stock.",
  },
  "Lab Tech": {
    kpis: ["Today's Patients", "Avg Wait Time"],
    showAdmissions: true,
    showPayments: false,
    note: "Samples, tests and reports.",
  },
};

export function dashboardAccess(role: string): DashboardAccess {
  return ROLE_DASHBOARD_ACCESS[normalizeRole(role)];
}
