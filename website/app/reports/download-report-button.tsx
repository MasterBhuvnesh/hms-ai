"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export-csv";
import { monthlyRevenue, products } from "@/data/mock";
import data from "@/data/dashboard.json";

export function DownloadReportButton() {
  function download() {
    const months = monthlyRevenue["2025"] ?? [];
    downloadCsv("reports-analytics", [
      ["Section", "Label", "Value", "Detail"],
      ...data.reports.kpis.map((k) => ["KPI", k.label, k.value, `${k.delta} ${k.deltaLabel}`]),
      ...months.map((m) => ["Monthly revenue", m.month, m.revenue, `Last year ${m.lastYear}`]),
      ...data.reports.categories.map((c) => ["Department share", c.name, c.value, `${c.share}%`]),
      ...[...products]
        .sort((a, b) => Number(b.sold.replace(/,/g, "")) - Number(a.sold.replace(/,/g, "")))
        .slice(0, 5)
        .map((p) => ["Top medicine", p.name, p.price, `Dispensed ${p.sold}`]),
    ]);
  }

  return (
    <Button size="lg" onClick={download}>
      <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
      Download Report
    </Button>
  );
}
