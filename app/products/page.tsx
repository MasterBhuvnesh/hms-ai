"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/cards";
import { AddDialog, money } from "@/components/dashboard/add-dialog";
import { Shell } from "@/components/dashboard/shell";
import { ProductsTable } from "./products-table";
import { products as productsSeed, type Product } from "@/data/mock";
import data from "@/data/dashboard.json";

export default function Products() {
  const [rows, setRows] = useState<Product[]>(productsSeed);

  return (
    <Shell breadcrumb="Products" active="Products">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight">Products</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="bg-card">
            <HugeiconsIcon icon={FileExportIcon} size={14} data-icon="inline-start" />
            Export CSV
          </Button>
          <AddDialog
            title="Add Product"
            submitLabel="Add Product"
            fields={[
              { name: "name", label: "Product name", placeholder: "Ergo Office Chair" },
              { name: "sku", label: "SKU", placeholder: "EC-1042" },
              {
                name: "category",
                label: "Category",
                options: ["Furniture", "Accessories", "Lighting", "Office Kits"],
              },
              { name: "price", label: "Price", type: "number", placeholder: "345" },
              { name: "stock", label: "Stock", type: "number", placeholder: "100" },
              { name: "sold", label: "Units sold", type: "number", placeholder: "0" },
            ]}
            onSubmit={(v) => {
              const stock = Number(v.stock) || 0;
              const status =
                stock === 0 ? "Out of Stock" : stock <= 15 ? "Low Stock" : "In Stock";
              setRows((r) => [
                {
                  name: v.name,
                  sku: v.sku,
                  category: v.category as Product["category"],
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
                Add Product
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.products.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <ProductsTable rows={rows} />
    </Shell>
  );
}
