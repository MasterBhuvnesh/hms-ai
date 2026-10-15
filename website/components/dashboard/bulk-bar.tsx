"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Row selection state keyed by row id. */
export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string, checked: boolean) {
    setSelected((s) => {
      const next = new Set(s);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(ids: string[], checked: boolean) {
    setSelected((s) => {
      const next = new Set(s);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
  }

  return { selected, toggle, toggleAll, clear };
}

/** Bulk action bar shown when at least one row is selected. */
export function BulkBar({
  count,
  onExport,
  onDelete,
  onClear,
}: {
  count: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2">
      <span className="text-sm text-muted-foreground">
        {count} selected
      </span>
      <Button variant="outline" size="sm" onClick={onExport}>
        Export selected
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        Delete selected
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
