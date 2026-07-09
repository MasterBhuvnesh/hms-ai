"use client";

import { useState, type ReactNode } from "react";
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
  placeholder?: string;
};

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
    Object.fromEntries(fields.map((f) => [f.name, f.options ? f.options[0] : ""]));
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(initial);

  const set = (name: string, v: string) => setValues((s) => ({ ...s, [name]: v }));

  function submit() {
    // every text field is required; selects always have a value
    for (const f of fields) {
      if (!f.options && !values[f.name]?.trim()) return;
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
              {f.options ? (
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
