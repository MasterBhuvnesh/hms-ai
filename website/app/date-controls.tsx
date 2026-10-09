"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const RANGES = ["Daily", "Weekly", "Monthly", "Yearly"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function DateControls({ initialDate }: { initialDate: string }) {
  const [range, setRange] = useState("Daily");
  const [date, setDate] = useState<Date>(() => new Date(initialDate));
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center rounded-lg border bg-muted/50 shadow-xs">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="lg" className="rounded-r-none px-3">
            {range}
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup value={range} onValueChange={setRange}>
            {RANGES.map((r) => (
              <DropdownMenuRadioItem key={r} value={r}>
                {r}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="w-px self-stretch bg-border" />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="lg" className="rounded-l-none px-3">
            <HugeiconsIcon icon={Calendar03Icon} size={14} data-icon="inline-start" />
            {formatDate(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) setDate(d);
              setOpen(false);
            }}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
