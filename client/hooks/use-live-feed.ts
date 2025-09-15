import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Channel = "text" | "voice" | "video";
export type Severity = "low" | "medium" | "high";

export interface AnalysisResult {
  label: string;
  score: number;
  severity: Severity;
  reasons: string[];
  highlights: { phrase: string; index: number }[];
  advice: string[];
}

export interface Item {
  id: string;
  channel: Channel;
  content: string;
  metadata?: Record<string, unknown>;
}

export function useLiveFeed() {
  const [queue, setQueue] = useState<Item[]>([]);
  const [events, setEvents] = useState<(Item & { analysis: AnalysisResult })[]>(
    [],
  );
  const [running, setRunning] = useState<boolean>(true);
  const [filterChannels, setFilterChannels] = useState<
    Record<Channel, boolean>
  >({ text: true, voice: true, video: true });
  const [filterSeverity, setFilterSeverity] = useState<
    Record<Severity, boolean>
  >({ low: true, medium: true, high: true });
  const timer = useRef<number | null>(null);

  // Load initial samples
  useEffect(() => {
    async function load() {
      type TextSample = {
        id: string;
        content: string;
        sender?: string;
        subject?: string;
        source?: string;
      };
      type VoiceSample = {
        id: string;
        transcript: string;
        callerId?: string;
        spoofedCallerId?: boolean;
      };
      type VideoSample = {
        id: string;
        transcript: string;
        platform?: string;
        deepfakeIndicators?: Record<string, unknown>;
      };
      const [text, voice, video] = await Promise.all([
        fetch("/api/fraud/samples?type=text").then(
          (r) => r.json() as Promise<TextSample[]>,
        ),
        fetch("/api/fraud/samples?type=voice").then(
          (r) => r.json() as Promise<VoiceSample[]>,
        ),
        fetch("/api/fraud/samples?type=video").then(
          (r) => r.json() as Promise<VideoSample[]>,
        ),
      ]);
      const norm: Item[] = [
        ...text.map((t) => ({
          id: t.id,
          channel: "text" as const,
          content: t.content,
          metadata: { sender: t.sender, subject: t.subject, source: t.source },
        })),
        ...voice.map((v) => ({
          id: v.id,
          channel: "voice" as const,
          content: v.transcript,
          metadata: {
            callerId: v.callerId,
            spoofedCallerId: v.spoofedCallerId,
          },
        })),
        ...video.map((vd) => ({
          id: vd.id,
          channel: "video" as const,
          content: vd.transcript,
          metadata: {
            deepfakeIndicators: vd.deepfakeIndicators,
            platform: vd.platform,
          },
        })),
      ];
      setQueue(norm);
    }
    load();
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(async () => {
      setQueue((q) => {
        if (q.length === 0) return q;
        const [next, ...rest] = q;
        analyze(next);
        return rest;
      });
      return undefined as unknown as number;
    }, 2500);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [running]);

  const analyze = useCallback(async (item: Item) => {
    const res = await fetch("/api/fraud/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: item.channel,
        content: item.content,
        metadata: item.metadata,
      }),
    }).then((r) => r.json() as Promise<{ analysis: AnalysisResult }>);
    setEvents((ev) =>
      [{ ...item, analysis: res.analysis }, ...ev].slice(0, 100),
    );
  }, []);

  // Filtering
  const filtered = useMemo(() => {
    return events.filter(
      (e) => filterChannels[e.channel] && filterSeverity[e.analysis.severity],
    );
  }, [events, filterChannels, filterSeverity]);

  const counts = useMemo(() => {
    const bySeverity: Record<Severity, number> = { low: 0, medium: 0, high: 0 };
    const byChannel: Record<Channel, number> = { text: 0, voice: 0, video: 0 };
    filtered.forEach((e) => {
      bySeverity[e.analysis.severity]++;
      byChannel[e.channel]++;
    });
    return { bySeverity, byChannel };
  }, [filtered]);

  function toggleChannel(c: Channel) {
    setFilterChannels((f) => ({ ...f, [c]: !f[c] }));
  }
  function toggleSeverity(s: Severity) {
    setFilterSeverity((f) => ({ ...f, [s]: !f[s] }));
  }
  function resetFilters() {
    setFilterChannels({ text: true, voice: true, video: true });
    setFilterSeverity({ low: true, medium: true, high: true });
  }

  return {
    running,
    setRunning,
    queueSize: queue.length,
    events: filtered,
    counts,
    filters: { channels: filterChannels, severities: filterSeverity },
    toggleChannel,
    toggleSeverity,
    resetFilters,
  } as const;
}
