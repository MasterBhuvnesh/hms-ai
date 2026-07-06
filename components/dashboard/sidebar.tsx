import Image from "next/image";
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
  Megaphone01Icon,
  Message01Icon,
  PackageIcon,
  PuzzleIcon,
  Settings02Icon,
  Share01Icon,
  UserGroupIcon,
  UserLock01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import data from "@/data/dashboard.json";

type NavItem = { label: string; icon: IconSvgElement; active?: boolean };

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Main Menu",
    items: [
      { label: "Dashboard", icon: Home01Icon, active: true },
      { label: "Products", icon: PackageIcon },
      { label: "Transactions", icon: Invoice01Icon },
      { label: "Reports & Analytics", icon: Analytics01Icon },
      { label: "Messages", icon: Message01Icon },
      { label: "Team Performance", icon: UserGroupIcon },
      { label: "Campaigns", icon: Megaphone01Icon },
    ],
  },
  {
    title: "Customers",
    items: [
      { label: "Customer List", icon: UserMultiple02Icon },
      { label: "Channels", icon: Share01Icon },
      { label: "Order Management", icon: DeliveryBox01Icon },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Roles & Permissions", icon: UserLock01Icon },
      { label: "Billing & Subscription", icon: CreditCardIcon },
      { label: "Integrations", icon: PuzzleIcon },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Customer Support", icon: CustomerSupportIcon },
      { label: "Help Center", icon: HelpCircleIcon },
      { label: "System Settings", icon: Settings02Icon },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar">
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
        {sections.map((section, i) => (
          <div key={section.title} className={i > 0 ? "mt-4 border-t pt-4" : ""}>
            <p className="px-2 pb-2 text-xs text-foreground">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.label}>
                  <a
                    href="#"
                    className={
                      item.active
                        ? "flex items-center gap-2.5 rounded-lg border bg-card px-2.5 py-2 text-sm font-medium shadow-xs"
                        : "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    }
                  >
                    <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative p-4 pt-0">
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-linear-to-t from-sidebar to-transparent" />
        <button className="flex w-full items-center gap-2.5 rounded-lg border bg-card p-2.5 shadow-xs">
          <Image
            src="/meow.png"
            alt={data.user.name}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
          <span className="flex-1 text-left">
            <span className="block text-sm font-semibold">{data.user.name}</span>
            <span className="block text-[11px] text-muted-foreground">{data.user.role}</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
