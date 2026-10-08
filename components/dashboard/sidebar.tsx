"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Analytics01Icon,
  CreditCardIcon,
  CustomerSupportIcon,
  Home01Icon,
  DeliveryBox01Icon,
  HelpCircleIcon,
  Invoice01Icon,
  UserGroupIcon,
  UserLock01Icon,
  UserMultiple02Icon,
  PackageIcon,
  File02Icon,
  Message01Icon,
  Settings02Icon,
  PuzzleIcon,
} from "@hugeicons/core-free-icons";
import data from "@/data/dashboard.json";
import { UserRoleSwitcher } from "@/components/dashboard/user-role-switcher";
import { useCurrentRole } from "@/components/dashboard/use-current-role";
import { canAccess } from "@/lib/permissions";

type NavItem = { label: string; icon: IconSvgElement; href?: string };

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Main Menu",
    items: [
      { label: "Dashboard", icon: Home01Icon, href: "/" },
      { label: "Appointments", icon: DeliveryBox01Icon, href: "/orders" },
      { label: "Schedule", icon: DeliveryBox01Icon, href: "/schedule" },
      { label: "Patients", icon: UserMultiple02Icon, href: "/customers" },
      { label: "Triage", icon: CustomerSupportIcon, href: "/triage" },
      { label: "Doctors & Staff", icon: UserGroupIcon, href: "/team" },
      { label: "Shifts & Leaves", icon: UserGroupIcon, href: "/shifts" },
    ],
  },
  {
    title: "Clinical",
    items: [
      { label: "Prescriptions", icon: File02Icon, href: "/prescriptions" },
      { label: "Lab Reports", icon: File02Icon, href: "/lab" },
      { label: "Discharges", icon: File02Icon, href: "/discharge" },
      { label: "Surgeries", icon: PackageIcon, href: "/surgeries" },
      { label: "Beds & Wards", icon: PackageIcon, href: "/channels" },
      { label: "Pharmacy", icon: PackageIcon, href: "/products" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Billing & Invoices", icon: CreditCardIcon, href: "/billing" },
      { label: "Payments", icon: Invoice01Icon, href: "/transactions" },
      { label: "Insurance Claims", icon: Invoice01Icon, href: "/insurance" },
      { label: "Expenses", icon: Analytics01Icon, href: "/expenses" },
      { label: "Health Campaigns", icon: Analytics01Icon, href: "/campaigns" },
      { label: "Roles & Permissions", icon: UserLock01Icon, href: "/roles" },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Reports & Analytics", icon: Analytics01Icon, href: "/reports" },
      { label: "Messages", icon: Message01Icon, href: "/messages" },
      { label: "Integrations", icon: PuzzleIcon, href: "/integrations" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Helpdesk", icon: CustomerSupportIcon, href: "/support" },
      { label: "Help Center", icon: HelpCircleIcon, href: "/help" },
      { label: "System Settings", icon: Settings02Icon, href: "/settings" },
    ],
  },
];

export function Sidebar({
  active = "Dashboard",
  className = "hidden lg:flex",
}: {
  active?: string;
  className?: string;
}) {
  const role = useCurrentRole();
  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccess(item.href, role)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className={`${className} w-64 shrink-0 flex-col border-r bg-sidebar`}>
      <div className="p-4">
        <button className="flex w-full items-center gap-2.5 rounded-lg border bg-card p-2.5 shadow-xs">
          <span className="flex-1 text-left">
            <span className="block text-[11px] text-muted-foreground">
              {data.user.teamType}
            </span>
            <span className="block text-sm font-medium">{data.user.team}</span>
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {visibleSections.map((section, i) => (
          <div key={section.title} className={i > 0 ? "mt-4 border-t pt-4" : ""}>
            <p className="px-2 pb-2 text-xs text-foreground">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href ?? "#"}
                    className={
                      item.label === active
                        ? "flex items-center gap-2.5 rounded-lg border bg-card px-2.5 py-2 text-sm font-medium shadow-xs"
                        : "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    }
                  >
                    <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative p-4 pt-0">
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-linear-to-t from-sidebar to-transparent" />
        <UserRoleSwitcher />
      </div>
    </aside>
  );
}
