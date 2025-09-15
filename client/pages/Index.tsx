import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import LiveFeed from "@/components/app/LiveFeed";
import AnalyzerForm from "@/components/app/AnalyzerForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShieldAlert,
  ScanLine,
  Sparkles,
  BookOpen,
  PlayCircle,
  MessagesSquare,
  Phone,
  Video,
  BellRing,
} from "lucide-react";

export default function Index() {
  const [liveRunning, setLiveRunning] = useState(true);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="container py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-foreground/70">
              <ShieldAlert className="text-primary" /> Multi-Channel Digital
              Fraud Detection
            </div>
            <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Stop Digital Arrest Scams in Real Time
            </h1>
            <p className="mt-4 text-foreground/70 max-w-prose">
              Sentinel Guard analyzes SMS, email, voice transcripts, and video
              calls to detect scam patterns, deepfake indicators, and urgent
              coercion tactics—then alerts users instantly with clear guidance.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => {
                  const next = !liveRunning;
                  setLiveRunning(next);
                  window.dispatchEvent(new CustomEvent<boolean>("livefeed:setRunning", { detail: next }));
                }}
                className="transition-transform hover:-translate-y-0.5 hover:scale-[1.02]"
              >
                <ScanLine className="mr-2" />
                {liveRunning ? "Pause Live Scan" : "Start Live Scan"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="inline-flex items-center gap-2">
                    <PlayCircle /> Watch how it works
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>How Sentinel Guard Works</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video rounded overflow-hidden border">
                    <img
                      src="https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
                      alt="Tutorial"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border p-4 bg-card">
                SMS / Email NLP
              </div>
              <div className="rounded-lg border p-4 bg-card">
                Voice spoof detection
              </div>
              <div className="rounded-lg border p-4 bg-card">
                Video deepfake cues
              </div>
              <div className="rounded-lg border p-4 bg-card">
                Instant alerts
              </div>
            </div>
          </div>
          <div className="relative rounded-xl border bg-gradient-to-br from-indigo-50 to-sky-50 p-6">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
            <div className="relative">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm font-medium">Incoming message</div>
                <p className="mt-2 text-sm">
                  This is Inspector Arjun from the Cyber Cell... digital arrest
                  ... verify now.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                  High risk detected
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded bg-secondary p-3">
                  <div className="text-2xl font-bold">92%</div>
                  <div className="uppercase text-foreground/60">
                    Scam Likelihood
                  </div>
                </div>
                <div className="rounded bg-secondary p-3">
                  <div className="text-2xl font-bold">6</div>
                  <div className="uppercase text-foreground/60">Keywords</div>
                </div>
                <div className="rounded bg-secondary p-3">
                  <div className="text-2xl font-bold">2</div>
                  <div className="uppercase text-foreground/60">
                    Urgency Cues
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live feed */}
      <LiveFeed />

      {/* Analyzer */}
      <AnalyzerForm />

      {/* Capability Cards */}
      <section className="container py-14">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Capabilities</h2>
          <p className="text-sm text-foreground/70">
            Key modules that power Sentinel Guard.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card interactive tone="default" elevation="sm" className="bg-gradient-to-br from-sky-50 to-white hover:shadow-md transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessagesSquare className="text-sky-500" />
                <CardTitle className="font-extrabold">Text NLP</CardTitle>
              </div>
              <CardDescription>Emails, SMS, chats</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-foreground/80">
              Detects coercion, urgency, and scam phrases with highlights and
              explanations.
            </CardContent>
          </Card>
          <Card interactive tone="warning" elevation="sm" className="bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="text-amber-500" />
                <CardTitle className="font-extrabold">Voice Spoofing</CardTitle>
              </div>
              <CardDescription>Caller ID & transcript</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-foreground/80">
              Flags suspicious caller IDs and threat language in call
              transcripts.
            </CardContent>
          </Card>
          <Card interactive tone="danger" elevation="sm" className="bg-gradient-to-br from-violet-50 to-white hover:shadow-md transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Video className="text-violet-500" />
                <CardTitle className="font-extrabold">Deepfake Signals</CardTitle>
              </div>
              <CardDescription>Blink & lip‑sync cues</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-foreground/80">
              Surfaces possible video manipulation indicators for quick
              verification.
            </CardContent>
          </Card>
          <Card interactive tone="success" elevation="sm" className="bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BellRing className="text-green-600" />
                <CardTitle className="font-extrabold">Real‑time Alerts</CardTitle>
              </div>
              <CardDescription>Protective guidance</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-foreground/80">
              Instant, actionable do/don’t advice to prevent loss before it
              happens.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section id="learn" className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            className="rounded-lg border p-6 hover:shadow-sm transition"
            href="#"
          >
            <BookOpen className="text-primary" />
            <h3 className="mt-3 font-semibold">How to spot scams</h3>
            <p className="mt-1 text-sm text-foreground/70">
              Common phrases and tactics used by scammers.
            </p>
          </a>
          <a
            className="rounded-lg border p-6 hover:shadow-sm transition"
            href="#"
          >
            <BookOpen className="text-primary" />
            <h3 className="mt-3 font-semibold">Verify officials safely</h3>
            <p className="mt-1 text-sm text-foreground/70">
              Steps to confirm police/bank communication legitimacy.
            </p>
          </a>
          <a
            className="rounded-lg border p-6 hover:shadow-sm transition"
            href="#"
          >
            <BookOpen className="text-primary" />
            <h3 className="mt-3 font-semibold">Report and recover</h3>
            <p className="mt-1 text-sm text-foreground/70">
              Where to report incidents and protect your accounts.
            </p>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
