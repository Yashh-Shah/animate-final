import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@/hooks/use-live-feed";
import { Mascot, mascotForChannel } from "@/components/app/Mascot";

export default function AnalyzerForm() {
  const [channel, setChannel] = useState<"text" | "voice" | "video">("text");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [transcript, setTranscript] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isText = channel === "text";
  const accept = useMemo(() => (channel === "voice" ? ".mp3" : channel === "video" ? ".mp4" : undefined), [channel]);

  function resetOutputs() {
    setResult(null);
    setTranscript("");
    setError(null);
    setProgress(0);
  }

  async function analyzeText() {
    setLoading(true);
    resetOutputs();
    try {
      const res = await fetch("/api/fraud/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "text", content, metadata: {} }),
      }).then((r) => r.json() as Promise<{ transcript?: string; analysis: AnalysisResult }>);
      setTranscript(res.transcript ?? content);
      setResult(res.analysis);
    } catch (e) {
      setError("Failed to analyze text.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeFileXHR(f: File) {
    setLoading(true);
    resetOutputs();
    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/fraud/analyze");
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            const res = JSON.parse(xhr.responseText || "{}") as { transcript?: string; analysis: AnalysisResult };
            setTranscript(res.transcript ?? "");
            setResult(res.analysis);
          } catch {
            setError("Failed to analyze file.");
          } finally {
            setLoading(false);
            resolve();
          }
        }
      };
      const fd = new FormData();
      fd.append("channel", channel);
      fd.append("file", f);
      xhr.send(fd);
    });
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (isText) return;
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const ok = (channel === "voice" && f.name.toLowerCase().endsWith(".mp3")) || (channel === "video" && f.name.toLowerCase().endsWith(".mp4"));
    if (!ok) {
      setError(channel === "voice" ? "Please upload an .mp3 file" : "Please upload an .mp4 file");
      return;
    }
    setFile(f);
    void analyzeFileXHR(f);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) void analyzeFileXHR(f);
  }

  function onChannelChange(c: "text" | "voice" | "video") {
    setChannel(c);
    setFile(null);
    if (c === "text") setContent("");
    resetOutputs();
  }

  function renderHighlighted(text: string, highlights?: { index: number; phrase: string }[]) {
    if (!text) return null;
    const hs = (highlights ?? []).slice().sort((a, b) => a.index - b.index);
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    for (const h of hs) {
      if (h.index > cursor) parts.push(<span key={cursor}>{text.slice(cursor, h.index)}</span>);
      const end = h.index + h.phrase.length;
      parts.push(
        <mark key={h.index} className="rounded bg-yellow-200 px-1 py-0.5">
          {text.slice(h.index, end)}
        </mark>,
      );
      cursor = end;
    }
    if (cursor < text.length) parts.push(<span key={cursor + 1}>{text.slice(cursor)}</span>);
    return <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>;
  }

  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Manual Reporting & Instant Scan</h2>
          <div className="mb-4 flex items-center gap-6">
            <div>
              <Label className="text-sm">Channel</Label>
              <div className="mt-2 flex gap-2">
                {(["text", "voice", "video"] as const).map((c) => (
                  <Button
                    key={c}
                    type="button"
                    variant={channel === c ? "default" : "outline"}
                    onClick={() => onChannelChange(c)}
                    className="capitalize"
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
            <div className="ms-auto flex items-center gap-2">
              <Mascot kind={mascotForChannel(channel)} mood={loading ? 'think' : result ? 'cheer' : 'neutral'} />
              <div className="text-xs text-foreground/60 hidden sm:block">
                {loading ? 'Analyzing…' : result ? 'Here is what I found!' : 'Choose a channel to begin.'}
              </div>
            </div>
          </div>

          {isText ? (
            <div className="mb-4">
              <Label htmlFor="content" className="text-sm">
                Paste content
              </Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste SMS/email text here…"
                className="mt-2 w-full h-40 rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ) : (
            <div className="mb-4">
              <Label className="text-sm">Upload {channel === "voice" ? "audio (.mp3)" : "video (.mp4)"}</Label>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md text-sm cursor-pointer bg-background hover:bg-muted"
              >
                <input id="file" type="file" accept={accept} onChange={onFileChange} className="hidden" />
                <span className="text-foreground/70">Drag & drop or click to choose a file</span>
                {file && <span className="mt-1 text-xs text-foreground/60">Selected: {file.name}</span>}
              </label>
            </div>
          )}

          {progress > 0 && loading && (
            <div className="mb-3">
              <Progress value={progress} />
              <div className="mt-1 text-xs text-foreground/60">Uploading… {progress}%</div>
            </div>
          )}

          {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

          <Button
            onClick={() => (isText ? analyzeText() : undefined)}
            disabled={(isText && !content) || (!isText && !file) || loading}
            className="transition-transform hover:-translate-y-0.5 hover:scale-[1.02]"
          >
            {loading && (
              <span
                className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            )}
            {isText ? (loading ? "Analyzing…" : "Analyze") : "Upload to analyze"}
          </Button>
        </div>

        <div className="rounded-lg border p-6 bg-card">
          <h3 className="font-medium mb-3">Result</h3>
          {!result && <div className="text-sm text-foreground/60">No analysis yet.</div>}
          {result && (
            <div className="space-y-4">
              <div
                className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded ${
                  result.severity === "high"
                    ? "bg-red-100 text-red-700"
                    : result.severity === "medium"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <span>Severity: {result.severity}</span>
                <span>Confidence: {(result.score * 100).toFixed(0)}%</span>
              </div>

              {transcript && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Transcript</h4>
                  {renderHighlighted(transcript, (result as any).highlights)}
                </div>
              )}

              {result.reasons?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Why flagged</h4>
                  <ul className="text-sm list-disc pl-5 text-foreground/80">
                    {result.reasons.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded border p-3 bg-secondary/30 text-sm">
                <span className="font-medium">Mascot says:</span> {result.severity === 'high' ? 'This looks risky. Do not share OTPs or click links. Verify via official channels.' : result.severity === 'medium' ? 'Be cautious. Verify sender identity and avoid urgent actions.' : 'Looks okay, but stay alert for unusual requests.'}
              </div>

              {result.advice?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Protective advice</h4>
                  <ul className="text-sm list-disc pl-5 text-foreground/80">
                    {result.advice.map((a: string, i: number) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
