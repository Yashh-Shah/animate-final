import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mascot, mascotForChannel } from "@/components/app/Mascot";

type Channel = "text" | "voice" | "video";
type Severity = "low" | "medium" | "high";
interface Incident {
  id: string;
  channel: Channel;
  content: string;
  timestamp: string;
  severity: Severity;
  analysis?: any;
  metadata?: any;
}

export default function Incidents() {
  const [data, setData] = useState<Incident[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [sortKey, setSortKey] = useState<keyof Incident>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/fraud/incidents")
      .then((r) => r.json())
      .then((res: { incidents: any[] }) => {
        const mapped: Incident[] = res.incidents.map((i) => ({
          id: i.id,
          channel: i.channel,
          content: i.content,
          timestamp: i.timestamp,
          severity: i.severity,
          analysis: i.analysis,
          metadata: i.metadata,
        }));
        setData(mapped);
      });
  }, []);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      let cmp = 0;
      if (sortKey === "timestamp")
        cmp =
          new Date(va as string).getTime() - new Date(vb as string).getTime();
      else cmp = (va as string).localeCompare(vb as string);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Incident & { analysis?: any } | null>(null);

  function openDetails(row: Incident) {
    const found = (data.find(d => d.id === row.id) as any) ?? row;
    setSelected(found);
    setOpen(true);
  }

  function setSort(k: keyof Incident) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-16">
        <div className="rounded-lg p-6 mb-6 bg-gradient-to-r from-indigo-50 to-sky-50 border">
          <h1 className="text-2xl font-bold">Incidents</h1>
          <p className="text-foreground/70">All detected communications with severity and quick context.</p>
        </div>
        <div className="flex items-end justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <label className="text-sm">Page size</label>
            <select
              className="border rounded px-2 py-1 bg-background"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[8, 15, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => setSort("channel")}
                >
                  Channel
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => setSort("severity")}
                >
                  Severity
                </TableHead>
                <TableHead>Content</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => setSort("timestamp")}
                >
                  Timestamp
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((row) => (
                <TableRow key={row.id} className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-sm" onClick={()=>openDetails(row)}>
                  <TableCell className="capitalize">{row.channel}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center text-xs px-2 py-1 rounded ${row.severity === "high" ? "bg-red-100 text-red-700" : row.severity === "medium" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {row.severity}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground/80">
                    {row.content.slice(0, 120)}
                    {row.content.length > 120 ? "…" : ""}
                  </TableCell>
                  <TableCell className="text-foreground/70">
                    {new Date(row.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Incident Details</DialogTitle>
            </DialogHeader>
            {!selected ? (
              <div className="text-sm text-foreground/60">No incident selected.</div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center text-xs px-2 py-1 rounded ${selected.severity === 'high' ? 'bg-red-100 text-red-700' : selected.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{selected.severity}</span>
                  <span className="text-xs text-foreground/60">{new Date(selected.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mascot kind={mascotForChannel(selected.channel)} mood={(selected as any).analysis?.severity === 'high' ? 'wink' : 'neutral'} />
                  <div className="rounded border p-3 bg-card text-sm whitespace-pre-wrap flex-1">{selected.content}</div>
                </div>

                {selected.metadata && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {selected.channel === 'voice' && (
                      <div className="rounded border p-2">
                        <div className="font-medium mb-1">Caller Metadata</div>
                        <div>Caller ID: {selected.metadata.callerId ?? 'N/A'}</div>
                        {typeof selected.metadata.spoofedCallerId !== 'undefined' && (
                          <div>Caller ID Spoofing: {selected.metadata.spoofedCallerId ? 'Yes' : 'No'}</div>
                        )}
                      </div>
                    )}
                    {selected.channel === 'video' && (
                      <div className="rounded border p-2">
                        <div className="font-medium mb-1">Deepfake Indicators</div>
                        <div>Blink rate low: {((selected.metadata.deepfakeIndicators?.blinkRatePerMin ?? 12) < 6) ? 'Yes' : 'No'}</div>
                        <div>Lip-sync score low: {((selected.metadata.deepfakeIndicators?.lipSyncScore ?? 1) < 0.7) ? 'Yes' : 'No'}</div>
                      </div>
                    )}
                    {selected.channel === 'text' && (
                      <div className="rounded border p-2">
                        <div className="font-medium mb-1">Sender Metadata</div>
                        <div>Sender: {selected.metadata.sender ?? 'N/A'}</div>
                      </div>
                    )}
                  </div>
                )}

                {selected.analysis?.highlights?.length > 0 && (
                  <div className="text-xs text-foreground/80">
                    <span className="font-medium">Flagged phrases:</span> {selected.analysis.highlights.map((h:any,i:number)=> <code key={i} className="mx-1 rounded bg-secondary px-1.5 py-0.5">{h.phrase}</code>)}
                  </div>
                )}
                {selected.analysis?.reasons?.length > 0 && (
                  <ul className="text-xs list-disc pl-5 text-foreground/80">
                    {selected.analysis.reasons.map((r:string,i:number)=> <li key={i}>{r}</li>)}
                  </ul>
                )}
                {selected.analysis?.advice?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium">Protective Advice</h4>
                    <ul className="text-sm list-disc pl-5 text-foreground/80">
                      {selected.analysis.advice.map((a:string,i:number)=> <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="mt-8">
          <h3 className="font-medium mb-2">Timeline</h3>
          <ol className="relative border-s pl-4">
            {sorted.map((r)=> (
              <li key={r.id} className="mb-4 ms-2">
                <span className={`absolute -start-1.5 mt-1 h-3 w-3 rounded-full ${r.severity==='high'?'bg-red-500': r.severity==='medium'? 'bg-orange-500':'bg-yellow-500'}`}></span>
                <div className="text-xs text-foreground/60">{new Date(r.timestamp).toLocaleString()} • {r.channel}</div>
                <div className="text-sm">{r.content.slice(0,140)}{r.content.length>140?'…':''}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-foreground/60">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
