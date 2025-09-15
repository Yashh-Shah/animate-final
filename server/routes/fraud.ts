import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

// Types
type Severity = "low" | "medium" | "high";
export type Channel = "text" | "voice" | "video";
interface Highlight { phrase: string; index: number }
interface AnalysisResult {
  label: string;
  score: number;
  severity: Severity;
  reasons: string[];
  highlights: Highlight[];
  advice: string[];
}
interface Rules { keywords: string[]; urgency: string[]; suspiciousDomains: string[] }

// Load JSON helpers
function loadJSON<T = unknown>(file: string): T {
  const p = path.resolve(process.cwd(), file);
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw) as T;
}

// Rules loader (cached)
let cachedRules: Rules | null = null;
function getRules(): Rules {
  if (!cachedRules) {
    cachedRules = loadJSON<Rules>("server/config/fraud-rules.json");
  }
  return cachedRules;
}

function highlight(text: string, phrases: string[]): Highlight[] {
  const hits: Highlight[] = [];
  const lower = text.toLowerCase();
  phrases.forEach((p) => {
    const i = lower.indexOf(p.toLowerCase());
    if (i !== -1) hits.push({ phrase: p, index: i });
  });
  return hits;
}

function analyzeText(content: string, meta?: Record<string, unknown>): AnalysisResult {
  const { keywords, urgency, suspiciousDomains } = getRules();
  const lc = content.toLowerCase();
  const kwHits = keywords.filter((k) => lc.includes(k));
  const urgHits = urgency.filter((k) => lc.includes(k));
  let domainFlag = false;
  if (typeof meta?.sender === "string") {
    const m = /@([^\s>]+)$/i.exec(meta.sender);
    const dom = m?.[1]?.toLowerCase();
    if (dom) domainFlag = suspiciousDomains.some((d) => dom.includes(d));
  }
  const score = Math.min(1, kwHits.length * 0.25 + urgHits.length * 0.15 + (domainFlag ? 0.2 : 0));
  const severity: Severity = score > 0.75 ? "high" : score > 0.4 ? "medium" : "low";
  const reasons: string[] = [];
  if (kwHits.length) reasons.push(`Keywords detected: ${kwHits.join(", ")}`);
  if (urgHits.length) reasons.push(`Urgency cues: ${urgHits.join(", ")}`);
  if (domainFlag) reasons.push("Suspicious sender domain");

  const highlights = highlight(content, [...kwHits, ...urgHits]);
  const advice = [
    "Do not click links or share OTPs.",
    "Verify caller/sender via official website/app.",
    "Report to cybercrime.gov.in if in India.",
  ];
  return { label: score > 0.5 ? "potential_scam" : "unclear", score, severity, reasons, highlights, advice };
}

function analyzeVoice(transcript: string, meta?: Record<string, unknown>): AnalysisResult {
  const base = analyzeText(transcript, meta);
  const callerId = typeof meta?.callerId === "string" ? meta.callerId : "";
  const spoofed = meta?.spoofedCallerId === true || /140-/.test(callerId);
  const extra = spoofed ? 0.25 : 0;
  const score = Math.min(1, base.score + extra);
  const severity: Severity = score > 0.75 ? "high" : score > 0.4 ? "medium" : "low";
  const reasons = [...base.reasons];
  if (spoofed) reasons.push("Possible caller ID spoofing");
  return { ...base, score, severity, reasons };
}

function analyzeVideo(transcript: string, meta?: Record<string, any>): AnalysisResult {
  const base = analyzeText(transcript, meta);
  const blink = meta?.deepfakeIndicators?.blinkRatePerMin as number | undefined;
  const lip = meta?.deepfakeIndicators?.lipSyncScore as number | undefined;
  const blinkLow = (blink ?? 12) < 6;
  const lipSyncLow = (lip ?? 1) < 0.7;
  const dfFlag = blinkLow || lipSyncLow;
  const extra = dfFlag ? 0.25 : 0;
  const score = Math.min(1, base.score + extra);
  const severity: Severity = score > 0.75 ? "high" : score > 0.4 ? "medium" : "low";
  const reasons = [...base.reasons];
  if (dfFlag) reasons.push("Possible deepfake indicators (blink/lip-sync anomaly)");
  const advice = [
    ...base.advice,
    "Ask for official email confirmation from a .gov.in / official domain.",
    "Do not perform any payment on call/video; independently verify.",
  ];
  return { ...base, score, severity, reasons, advice };
}

export const getSamples: RequestHandler = (req, res) => {
  const type = (req.query.type as string) || "all";
  const basePath = "server/data";
  const texts = loadJSON<any[]>(path.join(basePath, "text_samples.json"));
  const voices = loadJSON<any[]>(path.join(basePath, "voice_samples.json"));
  const videos = loadJSON<any[]>(path.join(basePath, "video_samples.json"));
  const data = { text: texts, voice: voices, video: videos } as const;
  if (type === "text" || type === "voice" || type === "video") {
    return res.json((data as any)[type]);
  }
  res.json(data);
};

async function speechToText(_file: Express.Multer.File): Promise<string> {
  return "This is a mock transcript derived from the uploaded media file for analysis.";
}

export const analyze: RequestHandler = async (req, res) => {
  const started = Date.now();
  const file = (req as any).file as Express.Multer.File | undefined;
  let channel = (req.body?.channel as Channel | undefined) ?? undefined;
  let content = (req.body?.content as string | undefined) ?? undefined;
  let metadata = (req.body?.metadata as Record<string, unknown> | undefined) ?? {};

  let transcript: string | undefined = undefined;

  if (file) {
    const mime = file.mimetype;
    if (!channel) {
      if (mime.startsWith("audio/")) channel = "voice";
      else if (mime.startsWith("video/")) channel = "video";
    }
    // Placeholder STT with a simple retry
    let attempts = 0;
    while (!transcript && attempts < 2) {
      try {
        transcript = await speechToText(file);
      } catch {
        attempts++;
        if (attempts >= 2) return res.status(502).json({ error: "stt_failed" });
      }
    }

    // Attach mock metadata hints for better demo realism
    const samples = getSamplesForChannel(channel ?? "voice");
    const idx = require("crypto").createHash("sha1").update(file.buffer).digest("hex");
    const pick = parseInt(idx.slice(0, 6), 16) % samples.length;
    const sample = samples[pick];
    if (channel === "voice") {
      metadata = { ...(metadata || {}), callerId: sample.callerId, spoofedCallerId: sample.spoofedCallerId };
    } else if (channel === "video") {
      metadata = { ...(metadata || {}), deepfakeIndicators: sample.deepfakeIndicators };
    }
  }

  // Fallback transcript for non-file requests
  if (!transcript) transcript = content;

  if (!channel || !transcript) return res.status(400).json({ error: "channel and content are required" });

  let result: AnalysisResult;
  if (channel === "text") result = analyzeText(transcript, metadata);
  else if (channel === "voice") result = analyzeVoice(transcript, metadata);
  else if (channel === "video") result = analyzeVideo(transcript, metadata);
  else return res.status(400).json({ error: "invalid channel" });

  const elapsed = Date.now() - started;
  console.log("/api/fraud/analyze", { channel, size: file?.size, ms: elapsed });
  res.json({ transcript, analysis: result });
};

export const batchAnalyze: RequestHandler = (req, res) => {
  const { items } = (req.body ?? {}) as { items?: Array<{ id?: string; channel: Channel; content: string }> };
  if (!Array.isArray(items)) return res.status(400).json({ error: "items must be an array" });
  const results = items.map((it) => {
    const { channel, content, ...rest } = it as any;
    try {
      if (channel === "text") return { id: it.id, ...analyzeText(content, rest) };
      if (channel === "voice") return { id: it.id, ...analyzeVoice(content, rest) };
      if (channel === "video") return { id: it.id, ...analyzeVideo(content, rest) };
      return { id: it.id, error: "invalid channel" };
    } catch (e) {
      return { id: it.id, error: "analysis_failed" };
    }
  });
  res.json({ results });
};

export const getIncidents: RequestHandler = (_req, res) => {
  const basePath = "server/data";
  const texts = loadJSON<any[]>(path.join(basePath, "text_samples.json"));
  const voices = loadJSON<any[]>(path.join(basePath, "voice_samples.json"));
  const videos = loadJSON<any[]>(path.join(basePath, "video_samples.json"));
  const items = [
    ...texts.map((t) => ({ id: t.id, channel: "text" as Channel, content: t.content, timestamp: t.timestamp, metadata: { sender: t.sender } })),
    ...voices.map((v) => ({ id: v.id, channel: "voice" as Channel, content: v.transcript, timestamp: v.timestamp, metadata: { callerId: v.callerId, spoofedCallerId: v.spoofedCallerId } })),
    ...videos.map((vd) => ({ id: vd.id, channel: "video" as Channel, content: vd.transcript, timestamp: vd.timestamp, metadata: { deepfakeIndicators: vd.deepfakeIndicators } })),
  ];
  const incidents = items.map((it) => {
    const analysis = it.channel === "text" ? analyzeText(it.content, it.metadata) : it.channel === "voice" ? analyzeVoice(it.content, it.metadata) : analyzeVideo(it.content, it.metadata);
    return { id: it.id, channel: it.channel, content: it.content, timestamp: it.timestamp, severity: analysis.severity, analysis, metadata: it.metadata };
  });
  res.json({ incidents });
};

function getSamplesForChannel(channel: Channel) {
  const basePath = "server/data";
  if (channel === "text") return loadJSON<any[]>(path.join(basePath, "text_samples.json"));
  if (channel === "voice") return loadJSON<any[]>(path.join(basePath, "voice_samples.json"));
  return loadJSON<any[]>(path.join(basePath, "video_samples.json"));
}

// In-memory reports list for demo purposes
export const reportList: Array<{ id: string; content: string; channel: Channel; userId?: string; timestamp: string }> = [];

export const reportScam: RequestHandler = (req, res) => {
  const { content, channel, userId } = (req.body ?? {}) as { content?: string; channel?: Channel; userId?: string };
  if (!content || !channel) return res.status(400).json({ ok: false, error: "content and channel are required" });
  const id = `r_${reportList.length + 1}`;
  const timestamp = new Date().toISOString();
  const item = { id, content, channel, userId, timestamp };
  reportList.push(item);
  res.json({ ok: true, item, total: reportList.length });
};
