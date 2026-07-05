"use client";

import { Italiana, Cormorant_Garamond, Manrope, DM_Mono } from "next/font/google";
import { useState } from "react";

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const NOISE_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.84 0 0 0 0 0.70 0 0 0 0 0.44 0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

const SEATS: Array<{
  pos: string;
  label: string;
  x: number;
  y: number;
  hero?: boolean;
  acted?: "fold" | "raise" | "call" | null;
  bet?: string;
  stack: string;
}> = [
  { pos: "UTG", label: "I", x: 110, y: 86, acted: "raise", bet: "2.5", stack: "97.5" },
  { pos: "HJ", label: "II", x: 320, y: 38, acted: "fold", stack: "100" },
  { pos: "CO", label: "III", x: 530, y: 86, acted: "fold", stack: "100" },
  { pos: "BTN", label: "VOUS", x: 560, y: 268, hero: true, stack: "100" },
  { pos: "SB", label: "V", x: 320, y: 332, bet: "0.5", stack: "99.5" },
  { pos: "BB", label: "VI", x: 80, y: 268, bet: "1.0", stack: "99" },
];

const ACTIONS = [
  {
    key: "fold",
    label: "FOLD",
    sub: "se retirer",
    detail: "Surrender. Preserve the stack.",
    tone: "ink",
  },
  {
    key: "call",
    label: "CALL",
    sub: "suivre",
    detail: "Match 2.5 — see a flop.",
    tone: "bone",
    amount: "2.5",
  },
  {
    key: "raise",
    label: "3-BET",
    sub: "relancer",
    detail: "Pressure the opener.",
    tone: "rouge",
    amount: "9.0",
  },
] as const;

export default function CasinoPreview() {
  const [hoverAction, setHoverAction] = useState<string | null>(null);

  return (
    <div
      className={`${italiana.variable} ${cormorant.variable} ${manrope.variable} ${dmMono.variable} relative min-h-screen overflow-hidden bg-[#0a0908] text-[#f3eadc] selection:bg-[#c8a96a]/30 selection:text-[#f3eadc]`}
      style={{ fontFamily: "var(--font-manrope)" }}
    >
      {/* grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.18] mix-blend-soft-light"
        style={{ backgroundImage: NOISE_URL, backgroundSize: "260px 260px" }}
      />
      {/* vignette */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[55]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 35%, transparent 0%, transparent 45%, rgba(0,0,0,0.55) 90%, #000 130%)",
        }}
      />
      {/* room glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 90% at 50% 0%, rgba(200,169,106,0.10) 0%, rgba(200,169,106,0.03) 35%, transparent 70%)",
        }}
      />

      <Frame />

      {/* ---------- HEADER ---------- */}
      <header className="relative z-10 px-10 pt-7 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Lozenge />
            <div className="leading-none">
              <div
                className="text-[34px] tracking-[0.32em] text-[#f3eadc]"
                style={{ fontFamily: "var(--font-italiana)" }}
              >
                MAISON&nbsp;NOIR
              </div>
              <div
                className="mt-2 text-[12px] italic tracking-[0.05em] text-[#c8a96a]/80"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                — un salon privé pour l&apos;étude du Game Theory Optimal —
              </div>
            </div>
          </div>

          <nav
            className="flex items-center gap-6 text-[10.5px] tracking-[0.42em] uppercase text-[#aa9a7b]"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            <Stat label="Session" value="IV" />
            <Pip />
            <Stat label="Hand" value="042" />
            <Pip />
            <Stat label="Accuracy" value="81%" accent />
            <Pip />
            <Stat label="Streak" value="07" />
          </nav>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <RuleGold />
          <span
            className="text-[10px] tracking-[0.45em] uppercase text-[#8b6f3e]"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            Tableau · No. III · 6-max · 100 bb · Late Evening
          </span>
          <RuleGold />
        </div>
      </header>

      {/* ---------- BODY ---------- */}
      <main className="relative z-10 grid grid-cols-[300px_minmax(0,1fr)_300px] gap-0 px-10 pb-44">
        {/* LEFT — Scenario */}
        <aside className="relative pr-8">
          <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#c8a96a]/40 to-transparent" />
          <Eyebrow>La Situation</Eyebrow>
          <h1
            className="mt-4 text-[64px] leading-[0.86] tracking-tight text-[#f3eadc]"
            style={{ fontFamily: "var(--font-italiana)" }}
          >
            The
            <br />
            Button.
          </h1>
          <p
            className="mt-5 text-[19px] italic leading-snug text-[#d9cdb6]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            An early raise from <span className="text-[#efd9a6]">Under-the-Gun</span>.
            All seats between have surrendered. The action falls upon <em>vous</em>.
          </p>

          <OrnamentDivider />

          <DataRow label="Hero" value="Button (BTN)" />
          <DataRow label="Opener" value="UTG · 2.5 bb" />
          <DataRow label="Folded" value="HJ · CO" />
          <DataRow label="Behind" value="SB · BB" />
          <DataRow label="Pot" value="4.0 bb" gold />
          <DataRow label="To call" value="2.5 bb" />
          <DataRow label="Effective" value="97.5 bb" />

          <OrnamentDivider />

          <div
            className="text-[11px] uppercase tracking-[0.36em] text-[#8b6f3e]"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            La Dame murmure
          </div>
          <p
            className="mt-3 text-[17px] italic leading-snug text-[#bfae8a]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            &ldquo;On the button, position is a currency.
            <br />
            Spend it — but not foolishly.&rdquo;
          </p>
        </aside>

        {/* CENTER — Table & Hand */}
        <section className="px-8">
          <PokerTable />

          {/* HERO HAND */}
          <div className="mt-12 flex flex-col items-center">
            <div className="flex items-center gap-3">
              <ThinRule />
              <span
                className="text-[10.5px] tracking-[0.5em] uppercase text-[#8b6f3e]"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                votre main
              </span>
              <ThinRule />
            </div>

            <div className="mt-6 flex items-end gap-5">
              <PlayingCard rank="A" suit="♠" tilt={-4} />
              <PlayingCard rank="K" suit="♦" tilt={3} />
            </div>

            <div className="mt-6 text-center">
              <div
                className="text-[28px] tracking-[0.12em] text-[#f3eadc]"
                style={{ fontFamily: "var(--font-italiana)" }}
              >
                AKo
              </div>
              <div
                className="mt-1 text-[15px] italic text-[#aa9a7b]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Ace-King, offsuit — a duelist&apos;s hand.
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT — Range & Chart */}
        <aside className="relative pl-8">
          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#c8a96a]/40 to-transparent" />
          <Eyebrow>Le Tableau</Eyebrow>
          <h2
            className="mt-4 text-[28px] leading-[1] text-[#f3eadc]"
            style={{ fontFamily: "var(--font-italiana)" }}
          >
            BTN vs UTG
          </h2>
          <p
            className="mt-2 text-[14px] italic text-[#aa9a7b]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            169 cellules, trois couleurs, une vérité.
          </p>

          <RangeGrid />

          <div className="mt-6 grid grid-cols-3 gap-2">
            <Legend swatch="#c8a96a" label="3-BET" />
            <Legend swatch="#7a1f2b" label="CALL" />
            <Legend swatch="#1f1c19" label="FOLD" />
          </div>

          <OrnamentDivider />

          <div className="space-y-2">
            <MicroStat label="Equity vs UTG range" value="63.4%" />
            <MicroStat label="EV (3-bet 9bb)" value="+ 0.84 bb" gold />
            <MicroStat label="EV (call 2.5bb)" value="+ 0.41 bb" />
            <MicroStat label="EV (fold)" value="0.00 bb" />
          </div>
        </aside>
      </main>

      {/* ---------- ACTION BAR ---------- */}
      <footer className="fixed inset-x-0 bottom-0 z-30">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#c8a96a]/60 to-transparent" />
        <div className="relative bg-[#0a0908]/92 backdrop-blur-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: NOISE_URL, backgroundSize: "240px 240px" }}
          />
          <div className="relative px-10 py-6">
            <div className="mb-3 flex items-center justify-between">
              <span
                className="text-[10px] tracking-[0.5em] uppercase text-[#8b6f3e]"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                Faites votre jeu
              </span>
              <span
                className="text-[11px] italic text-[#aa9a7b]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                — rien ne va plus —
              </span>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {ACTIONS.map((a) => (
                <ActionButton
                  key={a.key}
                  action={a}
                  hovered={hoverAction === a.key}
                  onEnter={() => setHoverAction(a.key)}
                  onLeave={() => setHoverAction(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================ */
/*  Decorative & atomic pieces                                   */
/* ============================================================ */

function Frame() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-6 z-[5] border border-[#c8a96a]/20"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-7 z-[5] border border-[#c8a96a]/10"
      />
      {/* corners */}
      {[
        "top-5 left-5",
        "top-5 right-5 rotate-90",
        "bottom-5 right-5 rotate-180",
        "bottom-5 left-5 -rotate-90",
      ].map((c) => (
        <svg
          key={c}
          aria-hidden
          viewBox="0 0 40 40"
          className={`pointer-events-none fixed z-[6] h-8 w-8 text-[#c8a96a]/55 ${c}`}
        >
          <path
            d="M2 14 V2 H14 M2 2 L14 14 M6 6 L10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <circle cx="2" cy="2" r="1.2" fill="currentColor" />
        </svg>
      ))}
    </>
  );
}

function Lozenge() {
  return (
    <svg viewBox="0 0 44 44" className="h-11 w-11 text-[#c8a96a]">
      <g fill="none" stroke="currentColor">
        <path d="M22 2 L42 22 L22 42 L2 22 Z" strokeWidth="0.8" />
        <path d="M22 6 L38 22 L22 38 L6 22 Z" strokeWidth="0.5" opacity="0.6" />
        <path d="M22 12 L32 22 L22 32 L12 22 Z" fill="currentColor" opacity="0.85" />
      </g>
      <text
        x="22"
        y="26"
        textAnchor="middle"
        fill="#0a0908"
        style={{ fontFamily: "var(--font-italiana)", fontSize: 11, letterSpacing: 1.2 }}
      >
        MN
      </text>
    </svg>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[#6a5f4a]">{label}</span>
      <span className={accent ? "text-[#efd9a6]" : "text-[#f3eadc]"}>{value}</span>
    </div>
  );
}

function Pip() {
  return <span className="text-[#c8a96a]/50">◆</span>;
}

function RuleGold() {
  return <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c8a96a]/40 to-transparent" />;
}

function ThinRule() {
  return <span className="block h-px w-20 bg-[#c8a96a]/35" />;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-6 bg-[#c8a96a]/60" />
      <span
        className="text-[10px] tracking-[0.5em] uppercase text-[#8b6f3e]"
        style={{ fontFamily: "var(--font-dm-mono)" }}
      >
        {children}
      </span>
    </div>
  );
}

function OrnamentDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-[#c8a96a]/25" />
      <svg viewBox="0 0 24 12" className="h-3 w-6 text-[#c8a96a]/70">
        <path
          d="M0 6 L8 6 M16 6 L24 6 M12 1 L14 6 L12 11 L10 6 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.6"
        />
      </svg>
      <span className="h-px flex-1 bg-[#c8a96a]/25" />
    </div>
  );
}

function DataRow({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span
        className="text-[10.5px] uppercase tracking-[0.32em] text-[#6a5f4a]"
        style={{ fontFamily: "var(--font-dm-mono)" }}
      >
        {label}
      </span>
      <span
        className={`text-[16px] ${gold ? "text-[#efd9a6]" : "text-[#f3eadc]"}`}
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {value}
      </span>
    </div>
  );
}

function MicroStat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[#c8a96a]/10 pb-1.5">
      <span
        className="text-[10px] uppercase tracking-[0.3em] text-[#6a5f4a]"
        style={{ fontFamily: "var(--font-dm-mono)" }}
      >
        {label}
      </span>
      <span
        className={`text-[15px] tabular-nums ${gold ? "text-[#efd9a6]" : "text-[#d9cdb6]"}`}
        style={{ fontFamily: "var(--font-dm-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-3 w-3 border border-[#c8a96a]/40"
        style={{ background: swatch }}
      />
      <span
        className="text-[9.5px] uppercase tracking-[0.32em] text-[#aa9a7b]"
        style={{ fontFamily: "var(--font-dm-mono)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ============================================================ */
/*  Poker Table                                                  */
/* ============================================================ */

function PokerTable() {
  return (
    <div className="relative mx-auto h-[400px] w-full max-w-[680px]">
      <svg viewBox="0 0 640 380" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="felt" cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="#214a36" />
            <stop offset="55%" stopColor="#143626" />
            <stop offset="100%" stopColor="#08180f" />
          </radialGradient>
          <linearGradient id="goldRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#efd9a6" />
            <stop offset="50%" stopColor="#c8a96a" />
            <stop offset="100%" stopColor="#6b522d" />
          </linearGradient>
          <radialGradient id="spot" cx="50%" cy="38%" r="40%">
            <stop offset="0%" stopColor="rgba(255,236,189,0.18)" />
            <stop offset="100%" stopColor="rgba(255,236,189,0)" />
          </radialGradient>
          <pattern id="feltTex" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 6 L6 0" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* outer rim shadow */}
        <ellipse cx="320" cy="200" rx="296" ry="158" fill="#000" opacity="0.55" filter="blur(8px)" />
        {/* gold rim */}
        <ellipse cx="320" cy="194" rx="294" ry="156" fill="url(#goldRim)" />
        <ellipse cx="320" cy="194" rx="290" ry="152" fill="#0a0908" />
        {/* felt */}
        <ellipse cx="320" cy="194" rx="282" ry="146" fill="url(#felt)" />
        <ellipse cx="320" cy="194" rx="282" ry="146" fill="url(#feltTex)" />
        {/* inner gold double-line */}
        <ellipse cx="320" cy="194" rx="252" ry="124" fill="none" stroke="#c8a96a" strokeOpacity="0.35" strokeWidth="0.8" />
        <ellipse cx="320" cy="194" rx="247" ry="119" fill="none" stroke="#c8a96a" strokeOpacity="0.18" strokeWidth="0.5" />
        {/* spotlight */}
        <ellipse cx="320" cy="160" rx="220" ry="100" fill="url(#spot)" />

        {/* center text */}
        <text
          x="320"
          y="178"
          textAnchor="middle"
          fill="#c8a96a"
          opacity="0.55"
          style={{ fontFamily: "var(--font-italiana)", fontSize: 22, letterSpacing: 14 }}
        >
          MAISON NOIR
        </text>
        <text
          x="320"
          y="200"
          textAnchor="middle"
          fill="#c8a96a"
          opacity="0.35"
          style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: 11, letterSpacing: 2 }}
        >
          tableau III · no limit hold&apos;em
        </text>

        {/* pot pill */}
        <g transform="translate(320 232)">
          <rect x="-44" y="-12" width="88" height="24" rx="12" fill="#0a0908" stroke="#c8a96a" strokeOpacity="0.5" />
          <text
            x="0"
            y="-1"
            textAnchor="middle"
            fill="#8b6f3e"
            style={{ fontFamily: "var(--font-dm-mono)", fontSize: 8, letterSpacing: 2 }}
          >
            POT
          </text>
          <text
            x="0"
            y="10"
            textAnchor="middle"
            fill="#efd9a6"
            style={{ fontFamily: "var(--font-italiana)", fontSize: 12, letterSpacing: 1 }}
          >
            4.0 bb
          </text>
        </g>
      </svg>

      {/* seats */}
      {SEATS.map((s) => (
        <Seat key={s.pos} {...s} />
      ))}
    </div>
  );
}

function Seat({
  pos,
  label,
  x,
  y,
  hero,
  acted,
  bet,
  stack,
}: {
  pos: string;
  label: string;
  x: number;
  y: number;
  hero?: boolean;
  acted?: "fold" | "raise" | "call" | null;
  bet?: string;
  stack: string;
}) {
  const isFolded = acted === "fold";
  const isOpener = acted === "raise";

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(x / 640) * 100}%`, top: `${(y / 380) * 100}%` }}
    >
      <div className="relative flex flex-col items-center">
        {/* avatar */}
        <div
          className={`relative grid h-[58px] w-[58px] place-items-center rounded-full border ${
            hero
              ? "border-[#efd9a6] shadow-[0_0_0_2px_#0a0908,0_0_0_3px_#c8a96a,0_10px_30px_-6px_rgba(200,169,106,0.6)]"
              : isFolded
              ? "border-[#3a342a]"
              : isOpener
              ? "border-[#c8a96a]"
              : "border-[#5a4f3c]"
          }`}
          style={{
            background: hero
              ? "radial-gradient(circle at 30% 30%, #2a2520, #0a0908 70%)"
              : isFolded
              ? "#100e0c"
              : "radial-gradient(circle at 30% 30%, #1c1916, #0a0908 70%)",
          }}
        >
          <span
            className={`text-[18px] tracking-[0.15em] ${
              hero ? "text-[#efd9a6]" : isFolded ? "text-[#3a342a]" : "text-[#aa9a7b]"
            }`}
            style={{ fontFamily: "var(--font-italiana)" }}
          >
            {label}
          </span>
          {isOpener && (
            <span className="absolute -inset-1 animate-pulse rounded-full border border-[#c8a96a]/40" />
          )}
        </div>

        {/* position badge */}
        <div
          className={`mt-2 px-2 py-0.5 text-[9px] tracking-[0.32em] ${
            hero
              ? "bg-[#c8a96a] text-[#0a0908]"
              : isFolded
              ? "border border-[#3a342a] text-[#5a4f3c]"
              : "border border-[#5a4f3c] text-[#aa9a7b]"
          }`}
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          {pos}
        </div>

        {/* stack */}
        <div
          className={`mt-1 text-[11px] tabular-nums ${
            isFolded ? "text-[#3a342a] line-through" : "text-[#bfae8a]"
          }`}
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          {stack}
        </div>

        {/* chip / bet */}
        {bet && !isFolded && (
          <div className="absolute -top-2 left-full ml-2 flex items-center gap-1.5">
            <ChipStack />
            <span
              className="text-[11px] text-[#efd9a6]"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              {bet}
            </span>
          </div>
        )}
        {isOpener && (
          <div className="absolute -top-2 right-full mr-2 flex items-center gap-1.5">
            <span
              className="text-[11px] text-[#efd9a6]"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              2.5
            </span>
            <ChipStack accent />
          </div>
        )}
        {isFolded && (
          <div
            className="absolute -top-1 right-full mr-2 text-[9px] uppercase tracking-[0.3em] text-[#5a4f3c]"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            fold
          </div>
        )}
      </div>
    </div>
  );
}

function ChipStack({ accent }: { accent?: boolean }) {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
      <ellipse cx="7" cy="9" rx="6" ry="2" fill={accent ? "#7a1f2b" : "#c8a96a"} stroke="#0a0908" strokeWidth="0.5" />
      <ellipse cx="7" cy="7" rx="6" ry="2" fill={accent ? "#a02a38" : "#efd9a6"} stroke="#0a0908" strokeWidth="0.5" />
      <ellipse cx="7" cy="5" rx="6" ry="2" fill={accent ? "#c8a96a" : "#f3eadc"} stroke="#0a0908" strokeWidth="0.5" />
    </svg>
  );
}

/* ============================================================ */
/*  Playing Card                                                 */
/* ============================================================ */

function PlayingCard({ rank, suit, tilt = 0 }: { rank: Rank; suit: Suit; tilt?: number }) {
  const isRed = suit === "♥" || suit === "♦";
  const color = isRed ? "#7a1f2b" : "#0a0908";
  return (
    <div
      className="relative h-[178px] w-[126px] select-none"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* drop shadow */}
      <div
        className="absolute inset-0 translate-y-2 rounded-[6px] bg-black/70 blur-[18px]"
        aria-hidden
      />
      {/* card body */}
      <div
        className="relative h-full w-full overflow-hidden rounded-[6px] border border-[#c8a96a]"
        style={{
          background:
            "linear-gradient(180deg, #f7eedd 0%, #efe2c9 55%, #d9cdb6 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 24px 48px -24px rgba(0,0,0,0.08)",
        }}
      >
        {/* inner gold frame */}
        <div className="absolute inset-[6px] rounded-[3px] border border-[#c8a96a]/45" />
        <div className="absolute inset-[9px] rounded-[2px] border border-[#c8a96a]/20" />

        {/* paper grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
          style={{ backgroundImage: NOISE_URL, backgroundSize: "180px 180px" }}
        />

        {/* TL */}
        <div className="absolute left-3 top-3 flex flex-col items-center leading-none">
          <span
            style={{ fontFamily: "var(--font-italiana)", color, fontSize: 28 }}
          >
            {rank}
          </span>
          <span style={{ color, fontSize: 18, marginTop: 2 }}>{suit}</span>
        </div>

        {/* Center suit */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color, fontSize: 78, lineHeight: 1, opacity: 0.92 }}
        >
          {suit}
        </div>

        {/* BR */}
        <div className="absolute bottom-3 right-3 flex rotate-180 flex-col items-center leading-none">
          <span
            style={{ fontFamily: "var(--font-italiana)", color, fontSize: 28 }}
          >
            {rank}
          </span>
          <span style={{ color, fontSize: 18, marginTop: 2 }}>{suit}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Range Grid                                                   */
/* ============================================================ */

const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

// crude visualisation: highlight a believable BTN-vs-UTG response set
function rangeColor(r: Rank, c: Rank, i: number, j: number): string {
  if (i === j) {
    if (["A", "K", "Q", "J", "T"].includes(r)) return "#c8a96a"; // 3-bet pairs
    if (["9", "8"].includes(r)) return "#7a1f2b"; // call mid pairs
    return "#1f1c19"; // fold low pairs (vs UTG)
  }
  const high = RANKS.indexOf(r) < RANKS.indexOf(c) ? r : c;
  const low = RANKS.indexOf(r) < RANKS.indexOf(c) ? c : r;
  const suited = i < j;
  // big suited
  if (high === "A" && suited) return "#c8a96a";
  if (high === "K" && suited && ["A", "K", "Q", "J", "T", "9"].includes(low)) return "#c8a96a";
  if (high === "Q" && suited && ["A", "K", "Q", "J", "T"].includes(low)) return "#c8a96a";
  if (high === "A" && !suited && ["K", "Q", "J"].includes(low)) return "#c8a96a";
  // calls
  if (suited) {
    if (high === "A") return "#7a1f2b";
    if (["K", "Q", "J", "T"].includes(high)) return "#7a1f2b";
    if (high === "9" && ["8", "7"].includes(low)) return "#7a1f2b";
  }
  if (!suited) {
    if (high === "A" && ["T", "9"].includes(low)) return "#7a1f2b";
    if (high === "K" && ["Q", "J"].includes(low)) return "#7a1f2b";
  }
  return "#1f1c19";
}

function RangeGrid() {
  return (
    <div className="mt-5 inline-block border border-[#c8a96a]/40 p-[3px]">
      <div className="grid gap-[1px]" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
        {RANKS.map((r, i) =>
          RANKS.map((c, j) => {
            const color = rangeColor(r, c, i, j);
            const isAKo = r === "A" && c === "K" && i > j;
            return (
              <div
                key={`${r}${c}${i}${j}`}
                className="relative aspect-square"
                style={{
                  background: color,
                  boxShadow: isAKo
                    ? "inset 0 0 0 1.5px #f3eadc, 0 0 12px rgba(243,234,220,0.55)"
                    : "inset 0 0 0 0.5px rgba(0,0,0,0.4)",
                }}
                title={`${r}${c}${i === j ? "" : i < j ? "s" : "o"}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Action Button                                                */
/* ============================================================ */

function ActionButton({
  action,
  hovered,
  onEnter,
  onLeave,
}: {
  action: typeof ACTIONS[number];
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const tone = action.tone;
  return (
    <button
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group relative overflow-hidden border transition-all duration-300"
      style={{
        borderColor:
          tone === "rouge" ? "#c8a96a" : tone === "bone" ? "#c8a96a" : "#c8a96a",
        background:
          tone === "rouge"
            ? hovered
              ? "linear-gradient(180deg,#8b2330,#4a121a)"
              : "linear-gradient(180deg,#5a1822,#2a0a10)"
            : tone === "bone"
            ? hovered
              ? "linear-gradient(180deg,#f3eadc,#d9cdb6)"
              : "linear-gradient(180deg,#d9cdb6,#aa9a7b)"
            : hovered
            ? "linear-gradient(180deg,#1c1916,#0a0908)"
            : "linear-gradient(180deg,#14110f,#0a0908)",
      }}
    >
      {/* inner gold frame */}
      <span className="pointer-events-none absolute inset-[5px] border border-[#c8a96a]/30 group-hover:border-[#c8a96a]/60 transition-colors" />

      {/* corner glyphs */}
      {["top-1.5 left-1.5", "top-1.5 right-1.5 rotate-90", "bottom-1.5 right-1.5 rotate-180", "bottom-1.5 left-1.5 -rotate-90"].map((c) => (
        <svg key={c} viewBox="0 0 10 10" className={`pointer-events-none absolute h-2 w-2 text-[#c8a96a]/70 ${c}`}>
          <path d="M0 3 L0 0 L3 0 M0 0 L5 5" stroke="currentColor" strokeWidth="0.8" fill="none" />
        </svg>
      ))}

      <div className="relative px-6 py-5">
        <div className="flex items-baseline justify-between">
          <span
            className="text-[28px] tracking-[0.28em]"
            style={{
              fontFamily: "var(--font-italiana)",
              color: tone === "bone" ? "#0a0908" : "#f3eadc",
            }}
          >
            {action.label}
          </span>
          {"amount" in action && action.amount && (
            <span
              className="tabular-nums text-[20px]"
              style={{
                fontFamily: "var(--font-italiana)",
                color:
                  tone === "bone" ? "#7a1f2b" : tone === "rouge" ? "#efd9a6" : "#efd9a6",
              }}
            >
              {action.amount}<span className="ml-1 text-[10px] tracking-[0.3em]" style={{ fontFamily: "var(--font-dm-mono)" }}>BB</span>
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span
            className="text-[13px] italic"
            style={{
              fontFamily: "var(--font-cormorant)",
              color:
                tone === "bone" ? "#4a121a" : tone === "rouge" ? "#efd9a6" : "#aa9a7b",
            }}
          >
            — {action.sub}
          </span>
          <span
            className="text-[9.5px] uppercase tracking-[0.3em]"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: tone === "bone" ? "#4a121a99" : "#6a5f4a",
            }}
          >
            {action.detail}
          </span>
        </div>
      </div>
    </button>
  );
}
