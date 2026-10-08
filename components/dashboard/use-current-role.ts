"use client";

import { useEffect, useState } from "react";
import { DEFAULT_ROLE, normalizeRole } from "@/lib/permissions";
import data from "@/data/dashboard.json";

export const ROLE_STORAGE_KEY = "hospital-role";
export const ROLE_EVENT = "hospital-role-change";

export function readStoredRole(): string {
  if (typeof window === "undefined") return data.user.role || DEFAULT_ROLE;
  try {
    return normalizeRole(window.localStorage.getItem(ROLE_STORAGE_KEY));
  } catch {
    return DEFAULT_ROLE;
  }
}

export function useCurrentRole(): string {
  // Initial value must be static so server HTML and first client render match.
  // The stored role is applied in an effect after mount.
  const [role, setRole] = useState<string>(data.user.role || DEFAULT_ROLE);

  useEffect(() => {
    setRole(readStoredRole());
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setRole(normalizeRole(detail));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === ROLE_STORAGE_KEY) setRole(normalizeRole(e.newValue));
    };
    window.addEventListener(ROLE_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ROLE_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return role;
}
