import React from "react";

export type MascotMood = "neutral" | "think" | "wink" | "cheer";
export type MascotKind = "elderly" | "adult" | "teen";

function Face({ mood, color, accent }: { mood: MascotMood; color: string; accent: string }) {
  const eyeOpen = (
    <>
      <circle cx="28" cy="30" r="3" fill="#0f172a" />
      <circle cx="52" cy="30" r="3" fill="#0f172a" />
    </>
  );
  const eyeWink = (
    <>
      <rect x="24" y="30" width="8" height="2" rx="1" fill="#0f172a" />
      <circle cx="52" cy="30" r="3" fill="#0f172a" />
    </>
  );
  const mouthNeutral = <rect x="34" y="44" width="12" height="3" rx="1.5" fill="#0f172a" />;
  const mouthCheer = <path d="M32 44c4 6 20 6 24 0" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />;
  const mouthThink = <path d="M34 46c6 -4 16 -4 20 0" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />;

  return (
    <svg viewBox="0 0 80 80" width="64" height="64" className="drop-shadow-sm">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
      <g>
        <rect x="8" y="10" width="64" height="56" rx="18" fill="url(#g1)" />
        {/* cheeks */}
        <circle cx="20" cy="42" r="5" fill="#fecaca" opacity="0.7" />
        <circle cx="60" cy="42" r="5" fill="#fecaca" opacity="0.7" />
        {/* eyes */}
        {mood === "wink" ? eyeWink : eyeOpen}
        {/* eyebrows (adult/elderly look) */}
        {mood !== "cheer" && (
          <>
            <rect x="22" y="22" width="14" height="3" rx="1.5" fill="#0f172a" opacity="0.7" />
            <rect x="44" y="22" width="14" height="3" rx="1.5" fill="#0f172a" opacity="0.7" />
          </>
        )}
        {/* mouth */}
        {mood === "cheer" ? mouthCheer : mood === "think" ? mouthThink : mouthNeutral}
      </g>
    </svg>
  );
}

export function Mascot({ kind, mood = "neutral", className = "" }: { kind: MascotKind; mood?: MascotMood; className?: string }) {
  const palette =
    kind === "elderly"
      ? { color: "#93c5fd", accent: "#60a5fa" }
      : kind === "adult"
        ? { color: "#fbcfe8", accent: "#f9a8d4" }
        : { color: "#c7d2fe", accent: "#a5b4fc" };
  return (
    <div className={className}>
      <Face mood={mood} color={palette.color} accent={palette.accent} />
    </div>
  );
}

export function mascotForChannel(channel: "text" | "voice" | "video"): MascotKind {
  if (channel === "text") return "elderly";
  if (channel === "voice") return "adult";
  return "teen";
}
