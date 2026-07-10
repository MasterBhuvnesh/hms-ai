"use client";

import { useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number";
  options?: readonly string[];
  /** render `options` as a searchable combobox instead of a plain select */
  searchable?: boolean;
  placeholder?: string;
};

/** Searchable single-select. Inline (not a Popover) so it works inside a Dialog. */
function Combobox({
  id,
  value,
  options,
  placeholder,
  onChange,
}: {
  id: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matches = options.filter((o) => o.toLowerCase().includes(q)).slice(0, 60);

  return (
    <div className="relative">
      <Input
        id={id}
        autoComplete="off"
        value={open ? query : value}
        placeholder={open ? value || placeholder : placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className="bg-muted/40 pr-8 shadow-none"
      />
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        size={14}
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
      />
      {open && (
        <div className="scrollbar-hidden absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg bg-popover p-1 shadow-md ring-1 ring-foreground/10">
          {matches.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No matches</p>
          )}
          {matches.map((o) => (
            <button
              key={o}
              type="button"
              // keep focus so onBlur doesn't close the list before the click lands
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(o);
                setQuery("");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${
                o === value ? "bg-muted" : ""
              }`}
            >
              <span className="truncate">{o}</span>
              {o === value && <HugeiconsIcon icon={Tick02Icon} size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddDialog({
  title,
  trigger,
  fields,
  onSubmit,
  submitLabel = "Add",
}: {
  title: string;
  trigger: ReactNode;
  fields: Field[];
  onSubmit: (values: Record<string, string>) => void;
  submitLabel?: string;
}) {
  const initial = () =>
    Object.fromEntries(
      fields.map((f) => [f.name, f.options && !f.searchable ? f.options[0] : ""]),
    );
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(initial);

  const set = (name: string, v: string) => setValues((s) => ({ ...s, [name]: v }));

  function submit() {
    // text and combobox fields are required; plain selects always have a value
    for (const f of fields) {
      if ((!f.options || f.searchable) && !values[f.name]?.trim()) return;
    }
    onSubmit(values);
    setValues(initial());
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setValues(initial());
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label
                htmlFor={f.name}
                className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase"
              >
                {f.label}
              </Label>
              {f.options && f.searchable ? (
                <Combobox
                  id={f.name}
                  value={values[f.name]}
                  options={f.options}
                  placeholder={f.placeholder}
                  onChange={(v) => set(f.name, v)}
                />
              ) : f.options ? (
                <Select value={values[f.name]} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger id={f.name} className="w-full bg-muted/40 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={f.name}
                  type={f.type === "number" ? "number" : "text"}
                  placeholder={f.placeholder}
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="bg-muted/40 shadow-none"
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// format a raw numeric string as "$1,234"
export function money(raw: string) {
  const n = Math.round(Number(raw.replace(/[^0-9.]/g, "")) || 0);
  return `$${n.toLocaleString("en-US")}`;
}
