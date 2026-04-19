"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Sparkles, RefreshCw, Share2, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { StageSwitcher } from "@/components/stage-switcher";
import { formatCurrency, formatPoints } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/types";

function RewardsInner() {
  const router = useRouter();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [retailer, setRetailer] = useState<any>(null);
  const [territory, setTerritory] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/bootstrap").then((r) => r.json()).then(async (boot) => {
      if (!boot.retailer) return router.replace("/");
      if (!boot.confirmed) return router.replace("/confirm");
      if (!boot.team) return router.replace("/team");
      setRetailer(boot.retailer);
      setTerritory(boot.territory);
      const lb = await fetch(`/api/leaderboard?stId=${boot.territory.id}`).then((r) => r.json());
      setRows(lb.rows);
      setLoaded(true);
    });
  }, [router]);

  useEffect(() => {
    if (!loaded) return;
    const run = () => {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.3 }, colors: ["#f97316", "#fbbf24", "#22c55e", "#f59e0b"] });
    };
    run();
    const t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, [loaded]);

  if (!loaded) return <AppShell><div className="p-10 text-center text-ink-400">Finalizing month…</div></AppShell>;

  const me = rows.find((r) => r.isYou);
  const rank = me?.rank ?? 0;
  const total = rows.length;
  const reward = computeReward(rank, total);

  return (
    <AppShell
      eyebrow={<span className="chip chip-gold"><Trophy className="h-3 w-3" /> Month complete · Final results</span>}
      title="Season wrap-up"
      subtitle={territory ? `${territory.name} · Final standings for this month` : "Final standings"}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* Podium */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-brand-50 to-white p-6 shadow-card">
            <div aria-hidden className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-amber-200/50 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-brand-200/50 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="chip chip-gold"><Trophy className="h-3 w-3" /> Top performers</span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold">🏆 This month's champions</h2>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[1, 0, 2].map((i) => {
                  const row = rows[i];
                  if (!row) return <div key={i} />;
                  const heights = { 0: "h-36", 1: "h-28", 2: "h-20" } as Record<number, string>;
                  const colors: Record<number, string> = {
                    0: "from-amber-400 to-amber-600",
                    1: "from-slate-300 to-slate-500",
                    2: "from-orange-500 to-amber-800",
                  };
                  const money = computeReward(i + 1, rows.length).amount;
                  return (
                    <div key={row.retailerId} className="flex flex-col items-center">
                      <Avatar seed={row.avatarSeed} name={row.name} size={56} />
                      <div className="mt-2 font-display font-bold text-center truncate w-full text-ink-900">{row.name.split(" ")[0]}</div>
                      <div className="text-[11px] text-ink-500">{formatPoints(row.totalPoints)} pts</div>
                      <div className={`mt-2 w-full rounded-t-xl ${heights[i]} bg-gradient-to-br ${colors[i]} flex flex-col items-center justify-start pt-3 text-white shadow-md`}>
                        <div className="font-display text-xl font-bold">#{i + 1}</div>
                        <div className="text-[11px] font-bold">{formatCurrency(money)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full standings */}
          <div>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-500">Complete standings</h3>
            <div className="card-elev overflow-hidden">
              <ul className="divide-y divide-ink-100">
                {rows.map((r) => {
                  const money = computeReward(r.rank, rows.length).amount;
                  return (
                    <li key={r.retailerId} className={`flex items-center gap-3 px-5 py-3 ${r.isYou ? "bg-gradient-to-r from-brand-50 to-white" : ""}`}>
                      <div className="w-10 text-center font-display text-base font-bold text-ink-500">#{r.rank}</div>
                      <Avatar seed={r.avatarSeed} name={r.name} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-bold">{r.name}</span>
                          {r.isYou && <span className="chip chip-brand">You</span>}
                        </div>
                        <div className="truncate text-[11px] text-ink-500">{r.shopName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-base font-bold tabular-nums">{formatPoints(r.totalPoints)}</div>
                        <div className="text-[10px] font-bold text-field-600">{formatCurrency(money)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Your result */}
        <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
          <div className="card-elev overflow-hidden">
            <div className={`relative p-6 text-white ${reward.bg}`}>
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(at_top_right,rgba(255,255,255,0.3),transparent_60%)]" />
              <div className="relative flex items-center gap-3">
                {retailer && <Avatar seed={retailer.avatarSeed} name={retailer.name} size={56} />}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">Your final rank</div>
                  <div className="font-display text-4xl font-bold">#{rank}</div>
                  <div className="text-xs text-white/80">out of {total} retailers</div>
                </div>
              </div>
              <div className="relative mt-5 rounded-xl bg-white/15 p-4 backdrop-blur">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">You earned</div>
                <div className="flex items-baseline gap-2">
                  <div className="font-display text-4xl font-bold">{formatCurrency(reward.amount)}</div>
                  <Sparkles className="h-4 w-4 text-white/80" />
                </div>
                <div className="mt-1 text-xs text-white/80">{reward.tier}</div>
              </div>
            </div>
            <div className="p-4 text-xs text-ink-500">
              Rewards will be credited to your registered bank account within 7 working days.
            </div>
          </div>

          <button onClick={() => router.push("/team")} className="btn btn-brand btn-lg w-full">
            <RefreshCw className="h-4 w-4" /> Start next month's team
          </button>
          <button className="btn btn-outline w-full">
            <Share2 className="h-4 w-4" /> Share my result
          </button>
        </aside>
      </div>

      <StageSwitcher />
    </AppShell>
  );
}

function computeReward(rank: number, total: number) {
  if (rank === 1) return { amount: 5000, tier: "🥇 Champion of your territory!", bg: "bg-gradient-to-br from-amber-400 to-amber-600" };
  if (rank === 2) return { amount: 3000, tier: "🥈 Podium finish!", bg: "bg-gradient-to-br from-slate-400 to-slate-600" };
  if (rank === 3) return { amount: 1500, tier: "🥉 Podium finish!", bg: "bg-gradient-to-br from-orange-500 to-amber-800" };
  if (rank <= Math.max(5, Math.ceil(total * 0.3))) return { amount: 500, tier: "💪 Top 30% — nice!", bg: "bg-gradient-to-br from-field-500 to-field-700" };
  return { amount: 100, tier: "Participation reward. Try again next month!", bg: "bg-gradient-to-br from-ink-700 to-ink-900" };
}

export default function RewardsPage() {
  return (
    <Suspense fallback={<AppShell><div className="p-10 text-center text-ink-400">Loading…</div></AppShell>}>
      <RewardsInner />
    </Suspense>
  );
}
