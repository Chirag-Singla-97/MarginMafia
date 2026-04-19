"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Trophy, Users, Zap, Crown, Award, Sparkles, Flame, Phone, MapPin, LogOut } from "lucide-react";

type ResumeState = {
  retailer: { name: string; shopName: string; phone: string; avatarSeed: string };
  nextPath: string;
  nextLabel: string;
} | null;

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);
  const [resume, setResume] = useState<ResumeState>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetch("/api/bootstrap")
      .then((r) => r.json())
      .then((data) => {
        if (!data.retailer) return;
        const nextPath = !data.confirmed ? "/confirm" : !data.team ? "/team" : "/live";
        const nextLabel = !data.confirmed ? "Confirm your details" : !data.team ? "Pick your team" : "View leaderboard";
        setResume({ retailer: data.retailer, nextPath, nextLabel });
      })
      .catch(() => {});
  }, []);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    setResume(null);
    setSigningOut(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotRegistered(false);
    if (!/^\d{10}$/.test(phone)) return setErr("Enter a 10-digit phone number.");
    if (!/^\d{6}$/.test(pincode)) return setErr("Enter a 6-digit pincode.");
    setBusy(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, pincode }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (body.registered === false) setNotRegistered(true);
      else setErr(body.error || "Login failed");
      setBusy(false);
      return;
    }
    router.push("/confirm");
  }

  return (
    <div className="relative min-h-screen overflow-hidden hero-mesh noise">
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
            Pick a squad of <b className="text-ink-900">11 agri products</b>. Earn points every time they sell in your sales territory, plus bonuses for your own shop's POG. Beat fellow retailers on a live leaderboard. <b className="text-ink-900">Win real cash every month.</b>
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Feature icon={<Zap className="h-4 w-4" />} tint="brand" title="11-product squad" body="1–3 from each of 5 categories." />
            <Feature icon={<Crown className="h-4 w-4" />} tint="amber" title="Captain 2×" body="Vice-captain 1.5×." />
            <Feature icon={<Trophy className="h-4 w-4" />} tint="field" title="Monthly cash" body="Podium = ₹5K/₹3K/₹1.5K." />
          </div>
        </section>

        <section className="relative">
          <div className="card-elev relative overflow-hidden p-6 sm:p-7">
            <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-200/50 blur-2xl" />
            <div className="relative">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" />
                <h2 className="font-display text-xl font-bold">Sign in with your retailer phone</h2>
              </div>
              <p className="-mt-3 mb-5 text-sm text-ink-500">We'll match your number to the retailer database and auto-fill your distributor, territory & town.</p>

              {resume && (
                <div className="mb-5 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-amber-50 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">Already signed in</div>
                  <div className="mt-1 font-display text-base font-bold text-ink-900">{resume.retailer.name}</div>
                  <div className="text-xs text-ink-500">{resume.retailer.shopName} · {resume.retailer.phone}</div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => router.push(resume.nextPath)}
                      className="btn btn-brand flex-1"
                    >
                      {resume.nextLabel} <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={signOut}
                      disabled={signingOut}
                      className="btn btn-outline"
                    >
                      <LogOut className="h-4 w-4" /> Switch retailer
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="label">Phone number</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-10"
                      placeholder="10-digit mobile"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Shop pincode</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-10"
                      placeholder="6-digit pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </div>
                </div>
                {notRegistered && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
                    <b>This number isn't onboarded yet.</b>
                    <div className="mt-0.5">Please complete retailer onboarding on the company platform first, then come back and sign in.</div>
                  </div>
                )}
                {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{err}</div>}
                <button type="submit" disabled={busy} className="btn btn-brand btn-lg w-full">
                  {busy ? "Looking you up…" : (
                    <>Continue <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
                <p className="text-center text-[11px] text-ink-400">
                  We only use your phone to identify your retailer record. No OTP for this demo.
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
