"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/cards";
import {
  appointments as allAppointments,
  discharges,
  labReports,
  patients,
  prescriptions,
  type Appointment,
} from "@/data/hospital";

export function VisitBriefDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const name = appointment?.patient ?? "";
  const patient = patients.find((p) => p.name === name);
  const history = allAppointments.filter((a) => a.patient === name).slice(0, 5);
  const activeRx = prescriptions.filter((r) => r.patient === name && r.status === "Active");
  const labs = labReports.filter((l) => l.patient === name).slice(0, 4);
  const pastDs = discharges.filter((d) => d.patient === name).slice(0, 3);

  const criticalLabs = labs.filter((l) => l.status === "Critical");
  const readyLabs = labs.filter((l) => l.status === "Ready");
  const hasNoShow = allAppointments.some((a) => a.patient === name && a.status === "No Show");

  const steps: string[] = [];
  if (criticalLabs.length > 0)
    steps.push(`Review critical lab (${criticalLabs[0].test} - ${criticalLabs[0].result}) before consultation`);
  else if (readyLabs.length > 0)
    steps.push(`Review ready lab result (${readyLabs[0].test} - ${readyLabs[0].result}) with patient`);
  if (activeRx.length > 0)
    steps.push(`Check adherence for ${activeRx.length} active prescription(s) - ${activeRx[0].diagnosis}`);
  if (hasNoShow) steps.push("Confirm attendance - No Show history on record");
  if (pastDs.length > 0 && steps.length < 3)
    steps.push(`Review discharge ${pastDs[0].id} (${pastDs[0].diagnosis})`);
  const fallbacks = [
    `Schedule follow-up with ${appointment?.doctor ?? patient?.doctor ?? "attending doctor"} in 7-14 days`,
    `Verify vitals and allergy history at check-in`,
    `Confirm insurance / billing clearance before procedure`,
  ];
  for (const f of fallbacks) {
    if (steps.length >= 3) break;
    if (!steps.includes(f)) steps.push(f);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pre-Visit Brief{appointment ? ` - ${appointment.id}` : ""}</DialogTitle>
          <DialogDescription>
            {name || "No appointment selected"}
            {appointment ? ` - ${appointment.date} ${appointment.time} - ${appointment.doctor}` : ""}
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm font-medium">{name}</p>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
                <span>
                  Age: <span className="font-mono text-foreground">{patient?.age ?? "-"}</span>
                </span>
                <span>
                  Gender: <span className="text-foreground">{patient?.gender ?? "-"}</span>
                </span>
                <span>
                  Blood: <span className="font-mono text-foreground">{patient?.blood ?? "-"}</span>
                </span>
                <span className="col-span-2 sm:col-span-1">
                  Doctor: <span className="text-foreground">{patient?.doctor ?? appointment.doctor}</span>
                </span>
                <span className="col-span-2 sm:col-span-2">
                  Dept: <span className="text-foreground">{patient?.department ?? appointment.department}</span>
                </span>
              </div>
            </div>

            <section className="space-y-1.5">
              <h3 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Visit timeline ({history.length})
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">No prior visits on record</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-7 text-[11px]">Date</TableHead>
                      <TableHead className="h-7 text-[11px]">Type</TableHead>
                      <TableHead className="h-7 text-right text-[11px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.id} className="hover:bg-transparent">
                        <TableCell className="py-1.5 font-mono text-xs">
                          {h.date} {h.time}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-muted-foreground">{h.type}</TableCell>
                        <TableCell className="py-1.5 text-right">
                          <StatusBadge status={h.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </section>

            <section className="space-y-1.5">
              <h3 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Active prescriptions ({activeRx.length})
              </h3>
              {activeRx.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active prescriptions</p>
              ) : (
                <div className="space-y-2">
                  {activeRx.slice(0, 3).map((rx) => (
                    <div key={rx.id} className="rounded-lg border p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{rx.id}</span>
                        <span className="font-mono text-xs text-muted-foreground">{rx.date}</span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium">{rx.diagnosis}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {rx.medicines.map((m) => `${m.name} ${m.dosage} (${m.duration})`).join("; ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-1.5">
              <h3 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Lab reports ({labs.length})
              </h3>
              {labs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No lab reports on record</p>
              ) : (
                <div className="space-y-1">
                  {labs.map((lab) => (
                    <div key={lab.id} className="flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {lab.test} <span className="font-mono font-normal text-muted-foreground">{lab.id}</span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {lab.result} - {lab.date}
                        </p>
                      </div>
                      <StatusBadge status={lab.status} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-1.5">
              <h3 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Past discharges ({pastDs.length})
              </h3>
              {pastDs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No prior discharges</p>
              ) : (
                <div className="space-y-1">
                  {pastDs.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {d.diagnosis} <span className="font-mono font-normal text-muted-foreground">{d.id}</span>
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {d.admitDate} - {d.dischargeDate}
                        </p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-1.5">
              <h3 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Suggested next steps
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {steps.slice(0, 3).map((s) => (
                  <li key={s} className="text-foreground/80">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
