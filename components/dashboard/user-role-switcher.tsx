"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HOSPITAL_ROLE_NAMES, normalizeRole } from "@/lib/permissions";
import { ROLE_EVENT, ROLE_STORAGE_KEY, useCurrentRole } from "@/components/dashboard/use-current-role";
import data from "@/data/dashboard.json";

export const HOSPITAL_ROLES = HOSPITAL_ROLE_NAMES.map((name) => ({
  name,
  description: roleDescription(name),
}));

function roleDescription(name: string): string {
  switch (name) {
    case "Admin":
      return "Full control";
    case "Management":
      return "Departments and reports";
    case "Doctor":
      return "Patients and prescriptions";
    case "Nurse":
      return "Patient care and wards";
    case "Receptionist":
      return "Registration and booking";
    case "Billing Staff":
      return "Bills and payments";
    case "Pharmacist":
      return "Dispense and stock";
    case "Lab Tech":
      return "Tests and reports";
    default:
      return "";
  }
}

export function getStoredRole(): string {
  if (typeof window === "undefined") return data.user.role;
  try {
    return normalizeRole(window.localStorage.getItem(ROLE_STORAGE_KEY));
  } catch {
    return data.user.role;
  }
}

export function UserRoleSwitcher() {
  const role = useCurrentRole();

  function select(next: string) {
    const value = normalizeRole(next);
    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, value);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(ROLE_EVENT, { detail: value }));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Switch role"
          className="flex w-full items-center gap-2.5 rounded-lg border bg-card p-2.5 shadow-xs transition-all hover:bg-accent active:translate-y-px"
        >
          <Image
            src="/meow.png"
            alt={data.user.name}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
          <span className="flex-1 text-left">
            <span className="block text-sm font-semibold">{data.user.name}</span>
            <span className="block text-[11px] text-muted-foreground">{role}</span>
          </span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="top" sideOffset={8}>
        <DropdownMenuLabel className="font-mono text-[10px] tracking-wider uppercase">
          Switch role
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={role} onValueChange={select}>
          {HOSPITAL_ROLES.map((r) => (
            <DropdownMenuRadioItem key={r.name} value={r.name}>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted-foreground">{r.description}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
