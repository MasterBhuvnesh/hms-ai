"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { ProductsTable } from "./products-table";
import { StewardshipReview } from "./stewardship-review";
import { medicines as medicinesSeed, type Medicine } from "@/data/hospital";

const kpis = [
  { label: "Total Medicines", value: "248", suffix: "SKUs", delta: "+12", deltaLabel: "this month", spark: [5, 6, 4, 7, 6, 8, 7, 9, 8, 12] },
  { label: "Units Dispensed", value: "12,480", suffix: "", delta: "+8,2%", deltaLabel: "this month", spark: [4, 6, 5, 8, 6, 9, 7, 10, 8, 12] },
  { label: "Low Stock", value: "16", suffix: "items", delta: "-4", deltaLabel: "vs last month", spark: [9, 8, 10, 7, 8, 6, 7, 5, 6, 12] },
];

export default function Products() {
  const [rows, setRows] = useState<Medicine[]>(medicinesSeed);

  return (
    <Shell breadcrumb="Pharmacy" active="Pharmacy">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Pharmacy</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export CSV
          </Button>
          <AddDialog
            title="Add Medicine"
            submitLabel="Add Medicine"
            fields={[
              { name: "name", label: "Medicine name", placeholder: "Paracetamol 500mg" },
              { name: "sku", label: "SKU", placeholder: "MED-3100" },
              {
                name: "category",
                label: "Category",
                options: ["Tablets", "Injections", "Syrups", "Surgical", "IV Fluids"],
              },
              { name: "price", label: "Price", type: "number", placeholder: "120" },
              { name: "stock", label: "Stock", type: "number", placeholder: "100" },
              { name: "sold", label: "Units dispensed", type: "number", placeholder: "0" },
            ]}
            onSubmit={(v) => {
              const stock = Number(v.stock) || 0;
              const status =
                stock === 0 ? "Out of Stock" : stock <= 15 ? "Low Stock" : "In Stock";
              setRows((r) => [
                {
                  name: v.name,
                  sku: v.sku,
                  category: v.category as Medicine["category"],
                  price: money(v.price),
                  stock,
                  status,
                  sold: (Number(v.sold) || 0).toLocaleString("en-US"),
                },
                ...r,
              ]);
            }}
            trigger={
              <Button size="lg">
                <HugeiconsIcon icon={PlusSignIcon} size={14} data-icon="inline-start" />
                Add Medicine
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <ProductsTable rows={rows} onChange={setRows} />

      <StewardshipReview />
    </Shell>
  );
}
