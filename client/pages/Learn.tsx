import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mascot, mascotForChannel } from "@/components/app/Mascot";

interface Example {
  id: string;
  channel: "text" | "voice" | "video";
  content: string;
  label: "scam" | "safe";
  keywords: string[];
}

const EXAMPLES: Example[] = [
  {
    id: "t1",
    channel: "text",
    content: "Urgent: Your KYC is pending. Click http://bit.ly/kyc-now to avoid account freeze.",
    label: "scam",
    keywords: ["urgent", "KYC", "click", "account freeze"],
  },
  {
    id: "v1",
    channel: "voice",
    content: "This is the bank. Share your OTP to verify this transaction now or your account will be blocked.",
    label: "scam",
    keywords: ["bank", "OTP", "verify", "blocked"],
  },
  {
    id: "vd1",
    channel: "video",
    content: "Hi, it's your CEO. Please wire 5 lakhs immediately for an urgent vendor payment.",
    label: "scam",
    keywords: ["CEO", "wire", "urgent"],
  },
  {
    id: "t2",
    channel: "text",
    content: "Your package will arrive tomorrow. Track at https://courier.example.com/tracking/1234",
    label: "safe",
    keywords: ["package", "track"],
  },
];

const DB = [
  { name: "KYC/Account Freeze", patterns: ["KYC", "account suspended", "verify now"], keywords: ["urgent", "link", "OTP"] },
  { name: "Impersonation (CEO/Police)", patterns: ["CEO", "police", "digital arrest"], keywords: ["wire", "gift cards", "threat"] },
  { name: "Prize/Lottery", patterns: ["you won", "prize", "lottery"], keywords: ["fees", "tax", "advance"] },
  { name: "Delivery Scam", patterns: ["delivery", "customs", "small fee"], keywords: ["short link", "OTP", "prepayment"] },
];

function highlight(content: string, keys: string[]) {
  const lc = content.toLowerCase();
  const parts: Array<{ text: string; hit: boolean }> = [];
  let i = 0;
  const hits = keys
    .map((k) => k.toLowerCase())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  while (i < content.length) {
    let matched = false;
    for (const k of hits) {
      if (k && lc.slice(i).startsWith(k)) {
        parts.push({ text: content.slice(i, i + k.length), hit: true });
        i += k.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      parts.push({ text: content[i], hit: false });
      i += 1;
    }
  }
  return (
    <span>
      {parts.map((p, idx) =>
        p.hit ? (
          <mark key={idx} className="rounded bg-yellow-200 px-1 py-0.5">
            {p.text}
          </mark>
        ) : (
          <span key={idx}>{p.text}</span>
        ),
      )}
    </span>
  );
}

export default function Learn() {
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<"scam" | "safe" | null>(null);
  const [score, setScore] = useState(0);
  const [query, setQuery] = useState("");

  const QUIZ = [
    { q: "Sharing OTP with a caller from 'the bank' is safe.", a: "False", explain: "Banks never ask for OTPs. Never share OTPs over call or message." },
    { q: "Short links in KYC messages can be risky.", a: "True", explain: "Shortened links can hide malicious destinations. Use official apps/sites." },
    { q: "A video call from your 'CEO' demanding urgent payment could be a deepfake.", a: "True", explain: "Deepfakes exist. Verify by independent channels before acting." },
  ];
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAns, setQuizAns] = useState<string | null>(null);

  const current = EXAMPLES[idx];
  const filteredDB = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DB;
    return DB.filter(
      (r) => r.name.toLowerCase().includes(q) || r.patterns.some((p) => p.toLowerCase().includes(q)) || r.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }, [query]);

  function pick(ans: "scam" | "safe") {
    if (answered) return;
    setAnswered(ans);
    if (ans === current.label) setScore((s) => s + 1);
  }
  function next() {
    setAnswered(null);
    setIdx((i) => (i + 1) % EXAMPLES.length);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container py-16 space-y-8">
        <div className="rounded-lg p-6 bg-gradient-to-r from-indigo-50 to-sky-50 border">
          <h1 className="text-2xl font-bold mb-2">Learn</h1>
          <p className="text-foreground/70">Practice spotting scams and browse common fraud patterns.</p>
        </div>

        <section className="rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mascot kind={mascotForChannel(current.channel)} mood={answered ? (answered === current.label ? 'cheer' : 'wink') : 'neutral'} />
              <h2 className="font-semibold">Scam Spotter</h2>
            </div>
            <div className="text-sm text-foreground/60">Score: {score}</div>
          </div>
          <div className="text-xs mb-2">Channel: <Badge variant="secondary" className="capitalize">{current.channel}</Badge></div>
          <div className="rounded border bg-card p-3 text-sm whitespace-pre-wrap">
            {highlight(current.content, current.keywords)}
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => pick("scam")} variant="destructive" disabled={!!answered} className="transition-transform hover:-translate-y-0.5">Scam</Button>
            <Button onClick={() => pick("safe")} variant="outline" disabled={!!answered} className="transition-transform hover:-translate-y-0.5">Safe</Button>
            {answered && (
              <span className={`ml-2 text-sm ${answered === current.label ? 'text-green-600' : 'text-red-600'}`}>
                {answered === current.label ? 'Correct!' : 'Incorrect.'} This was marked as <b className="capitalize">{current.label}</b>.
              </span>
            )}
            {answered && (
              <Button className="ml-auto" onClick={next}>Next</Button>
            )}
          </div>
          {answered && (
            <div className="mt-3 text-xs text-foreground/80">
              <div className="font-medium mb-1">Why?</div>
              <ul className="list-disc pl-5">
                {current.keywords.map((k) => (
                  <li key={k}>Keyword: {k}</li>
                ))}
                {current.channel !== 'text' && (
                  <li>Media-based scam: be cautious with OTP, wire transfers, and demands over calls/videos.</li>
                )}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-lg border p-6">
          <div className="mb-3">
            <h2 className="font-semibold">Quick Quiz</h2>
            <p className="text-sm text-foreground/70">Instant feedback to build instincts.</p>
          </div>
          <div className="rounded border bg-card p-4">
            <div className="text-sm font-medium">{QUIZ[quizIdx].q}</div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuizAns("True")} disabled={!!quizAns}>True</Button>
              <Button variant="outline" size="sm" onClick={() => setQuizAns("False")} disabled={!!quizAns}>False</Button>
              {quizAns && (
                <span className={`text-sm ${quizAns === QUIZ[quizIdx].a ? 'text-green-600' : 'text-red-600'}`}>
                  {quizAns === QUIZ[quizIdx].a ? 'Correct!' : 'Incorrect.'}
                </span>
              )}
              {quizAns && (
                <Button className="ml-auto" size="sm" onClick={() => { setQuizAns(null); setQuizIdx((i)=> (i+1)%QUIZ.length); }}>Next</Button>
              )}
            </div>
            {quizAns && (
              <div className="mt-2 text-xs text-foreground/70">{QUIZ[quizIdx].explain}</div>
            )}
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Scam Database</h2>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patterns, keywords…" className="w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDB.map((r) => (
              <div key={r.name} className="[perspective:800px]">
                <div className="relative h-32 w-full rounded border [transform-style:preserve-3d] transition-transform duration-500 hover:[transform:rotateY(180deg)]">
                  <div className="absolute inset-0 p-4 [backface-visibility:hidden]">
                    <div className="font-medium mb-1">{r.name}</div>
                    <div className="text-xs text-foreground/70">Patterns: {r.patterns.join(", ")}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.keywords.map((k: string) => (
                        <Badge key={k} variant="secondary">{k}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 p-4 rotate-y-180 [backface-visibility:hidden] bg-card rounded">
                    <div className="text-xs text-foreground/70">Details</div>
                    <ul className="text-xs list-disc pl-5">
                      {r.patterns.map((p: string) => (<li key={p}>{p}</li>))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
