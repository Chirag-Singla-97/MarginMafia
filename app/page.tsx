"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Trophy, Users, Zap, Crown, Award, Sparkles, Flame } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bootstrap")
      .then((r) => r.json())
      .then((data) => {
        if (data.retailer) {
          if (!data.distributor) router.replace("/distributor");
          else if (!data.team) router.replace("/team");
          else router.replace("/live");
        }
      })
      .catch(() => {});
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr("Please enter your name");
    setBusy(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim(), shopName: shopName.trim() }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Login failed");
      setBusy(false);
      return;
    }
    router.push("/distributor");
  }

  return (
    <div className="relative min-h-screen overflow-hidden hero-mesh noise">
      {/* Floating blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl animate-float-slow" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-field-300/40 blur-3xl animate-float-slower" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl animate-float-slow" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-2xl shadow-elev">🌾</div>
          <div className="leading-none">
            <div className="font-display text-lg font-bold tracking-tight">
              Margin<span className="text-brand-600">Mafia</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">
              Agri Fantasy League
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="chip chip-field"><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-field-500 animate-pulse" /> Season 1 is live</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-start gap-10 px-6 py-8 md:grid-cols-[1.3fr_1fr] md:gap-14 md:py-16">
        {/* Hero content */}
        <section>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700 backdrop-blur">
            <Flame className="h-3 w-3" /> Dream11 · but for agri products
          </span>

          <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-7xl">
            Your best-selling
            <br />
            products are
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent">your team.</span>
              <span className="absolute -bottom-1 left-0 right-0 -z-0 h-3 rounded-md bg-brand-200/60"></span>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
            Pick a squad of <b className="text-ink-900">agri products</b>. Earn points every time they sell in your sales territory. Beat fellow retailers on a live leaderboard. <b className="text-ink-900">Win real cash every month.</b>
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Feature icon={<Zap className="h-4 w-4" />} tint="brand" title="3–9 product squad" body="1–3 from each category." />
            <Feature icon={<Crown className="h-4 w-4" />} tint="amber" title="Captain 2×" body="Vice-captain 1.5×." />
            <Feature icon={<Trophy className="h-4 w-4" />} tint="field" title="Monthly cash" body="Podium = ₹5K/₹3K/₹1.5K." />
          </div>

          {/* Mock scoreboard */}
          <div className="mt-10 hidden rounded-2xl border border-ink-100 bg-white/80 p-4 shadow-card backdrop-blur md:block">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-400">Live · North Zone</span>
              <span className="chip chip-field"><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-field-500 animate-pulse" /> 12 playing now</span>
            </div>
            <div className="space-y-2">
              <MockRow rank={1} name="Rajesh Kumar" shop="Kumar Beej Bhandar" pts={18420} gold />
              <MockRow rank={2} name="Ravi Verma" shop="Verma Khaad Bhandar" pts={17102} />
              <MockRow rank={3} name="Amit Yadav" shop="Yadav Kisan Kendra" pts={15980} />
            </div>
          </div>
        </section>

        {/* Login card */}
        <section className="relative">
          <div className="card-elev relative overflow-hidden p-6 sm:p-7">
            <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-200/50 blur-2xl" />
            <div className="relative">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" />
                <h2 className="font-display text-xl font-bold">Start playing in 60 seconds</h2>
              </div>
              <p className="-mt-3 mb-5 text-sm text-ink-500">No signup, no OTP. Just your name.</p>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="label">Your name</label>
                  <input
                    className="input"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Shop name <span className="text-ink-300 font-semibold">(optional)</span></label>
                  <input
                    className="input"
                    placeholder="e.g. Kumar Beej Bhandar"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
                {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{err}</div>}
                <button type="submit" disabled={busy} className="btn btn-brand btn-lg w-full">
                  {busy ? "Setting up your field…" : (
                    <>Enter the League <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
                <p className="text-center text-[11px] text-ink-400">
                  By entering, you agree you're a retailer playing for fun & glory.
                </p>
              </form>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
            <Users className="h-3.5 w-3.5" /> Over <b className="text-ink-900">2,300 retailers</b> in the league
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ icon, title, body, tint }: { icon: React.ReactNode; title: string; body: string; tint: "brand" | "field" | "amber" }) {
  const tints = {
    brand: "bg-brand-100 text-brand-700",
    field: "bg-field-100 text-field-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="rounded-xl border border-ink-100 bg-white/70 p-4 backdrop-blur transition hover:border-ink-200 hover:shadow-card">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tints[tint]}`}>{icon}</div>
      <h3 className="mt-3 text-sm font-bold text-ink-900">{title}</h3>
      <p className="mt-0.5 text-xs text-ink-500">{body}</p>
    </div>
  );
}

function MockRow({ rank, name, shop, pts, gold }: { rank: number; name: string; shop: string; pts: number; gold?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
        gold ? "bg-amber-400 text-white" : "bg-ink-100 text-ink-600"
      }`}>#{rank}</div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-semibold text-ink-900">{name}</div>
        <div className="truncate text-[11px] text-ink-400">{shop}</div>
      </div>
      <div className="text-right">
        <div className="font-display text-base font-bold tabular-nums">{pts.toLocaleString()}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">pts</div>
      </div>
    </div>
  );
}
