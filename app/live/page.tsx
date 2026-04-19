"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Crown, Award, ArrowRight, RadioTower, TrendingUp, Users, PackagePlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { TeamPeekModal } from "@/components/team-peek-modal";
import { StageSwitcher } from "@/components/stage-switcher";
import { CATEGORIES, type LeaderboardRow, type Product } from "@/lib/types";
import { formatPoints } from "@/lib/utils";

interface MyTeamDetail {
  team: { retailerId: string; captainId: string; viceCaptainId: string };
  retailer: any;
  score: {
    total: number;
    breakdown: {
      productId: string;
      finalPoints: number;
      rawPts: number;
      salesPts: number;
      brPts: number;
      repeatPts: number;
      pogPts: number;
      multiplier: number;
      isCaptain: boolean;
      isViceCaptain: boolean;
    }[];
  };
  picks: { productId: string; category: string; product: Product | null }[];
}

function LivePageInner() {
  const router = useRouter();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [retailer, setRetailer] = useState<any>(null);
  const [territory, setTerritory] = useState<any>(null);
  const [myTeam, setMyTeam] = useState<MyTeamDetail | null>(null);
  const [peek, setPeek] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async (stId: string, myId: string) => {
    const [lb, mine] = await Promise.all([
      fetch(`/api/leaderboard?stId=${stId}`).then((r) => r.json()),
      fetch(`/api/team/${myId}`).then((r) => r.json()),
    ]);
    setRows(lb.rows || []);
    setMyTeam(mine);
  }, []);

  useEffect(() => {
    let stopped = false;
    let timer: any;
    fetch("/api/bootstrap").then((r) => r.json()).then(async (boot) => {
      if (!boot.retailer) return router.replace("/");
      if (!boot.confirmed) return router.replace("/confirm");
      if (!boot.team) return router.replace("/team");
      setRetailer(boot.retailer);
      setTerritory(boot.territory);
      await reload(boot.territory.id, boot.retailer.id);
      setLoaded(true);
      const tick = async () => {
        if (stopped) return;
        await reload(boot.territory.id, boot.retailer.id);
        timer = setTimeout(tick, 15000);
      };
      timer = setTimeout(tick, 15000);
    });
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [router, reload]);

  const myRank = useMemo(() => rows.find((r) => r.isYou)?.rank ?? null, [rows]);
  const myPoints = useMemo(() => rows.find((r) => r.isYou)?.totalPoints ?? 0, [rows]);
  const leader = rows[0];

  if (!loaded) return <AppShell><div className="p-10 text-center text-ink-400">Loading leaderboard…</div></AppShell>;

  return (
    <AppShell
      eyebrow={
        <div className="flex items-center gap-2 flex-wrap">
          <span className="chip chip-field"><span className="dot-live h-1.5 w-1.5" /> Month in progress</span>
          {territory && <span className="chip">{territory.name}</span>}
          <span className="chip"><Users className="h-3 w-3" /> {rows.length} retailers</span>
        </div>
      }
      title="Live Leaderboard"
      subtitle="Points update as your picks sell in your territory. Add POG for extra points. Captain scores 2×, Vice-Captain 1.5×."
      right={retailer && (
        <div className="flex items-center gap-2">
          <Link href="/pog" className="inline-flex btn btn-outline"><PackagePlus className="h-4 w-4" /> POG</Link>
          <Link href="/rewards" className="hidden sm:inline-flex btn btn-outline"><Trophy className="h-4 w-4" /> Rewards</Link>
        </div>
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Your rank" value={myRank ? `#${myRank}` : "—"} sub={`of ${rows.length} retailers`} />
            <StatCard label="Your points" value={formatPoints(myPoints)} sub="this month" tint="brand" />
            <StatCard
              label={leader?.isYou ? "You're leading 👑" : `Leader · #1`}
              value={leader ? leader.name.split(" ")[0] : "—"}
              sub={leader ? `${formatPoints(leader.totalPoints)} pts` : ""}
              tint={leader?.isYou ? "field" : "ink"}
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-field-200 bg-field-50 px-4 py-3">
            <RadioTower className="h-4 w-4 text-field-700" />
            <span className="flex-1 text-sm font-semibold text-field-800">
              Refreshing every 15s · points = sales + BR + repeat + your POG (× C/VC)
            </span>
            <span className="dot-live h-2 w-2" />
          </div>

          <LeaderboardTable rows={rows} onPeek={setPeek} />
        </div>

        {myTeam && (
          <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
            <div className="card-elev overflow-hidden">
              <div className="relative bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-5 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(at_top_right,rgba(249,115,22,0.25),transparent_50%)]" />
                <div className="relative flex items-center gap-3">
                  <Avatar seed={retailer.avatarSeed} name={retailer.name} size={52} />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">Your squad</div>
                    <div className="font-display text-xl font-bold">{retailer.name.split(" ")[0]}'s XI</div>
                  </div>
                </div>
                <div className="relative mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Rank</div>
                    <div className="font-display text-3xl font-bold">{myRank ? `#${myRank}` : "—"}</div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Points</div>
                    <div className="font-display text-3xl font-bold">{formatPoints(myPoints)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {CATEGORIES.map((cat) => {
                  const items = myTeam.picks.filter((p) => p.category === cat.id);
                  if (items.length === 0) return null;
                  return (
                    <section key={cat.id}>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">
                        <span className="text-sm">{cat.emoji}</span> {cat.name}
                      </div>
                      <ul className="space-y-1.5">
                        {items.map((pk) => {
                          const p = pk.product;
                          if (!p) return null;
                          const isC = p.id === myTeam.team.captainId;
                          const isVC = p.id === myTeam.team.viceCaptainId;
                          const b = myTeam.score.breakdown.find((x) => x.productId === p.id);
                          return (
                            <li key={p.id} className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 ${
                              isC ? "border-amber-200 bg-amber-50/50" :
                              isVC ? "border-slate-200 bg-slate-50/50" :
                              "border-ink-100"
                            }`}>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate text-sm font-bold text-ink-900">{p.name}</span>
                                  {isC && <span className="chip chip-gold"><Crown className="h-2.5 w-2.5" /> C</span>}
                                  {isVC && <span className="chip chip-silver"><Award className="h-2.5 w-2.5" /> VC</span>}
                                </div>
                                {b && (
                                  <div className="truncate text-[10px] text-ink-500">
                                    S {formatPoints(b.salesPts)} · BR {formatPoints(b.brPts)} · R {formatPoints(b.repeatPts)}
                                    {b.pogPts > 0 && <> · <span className="text-field-700 font-bold">POG {formatPoints(b.pogPts)}</span></>}
                                  </div>
                                )}
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="font-display text-base font-bold tabular-nums">{formatPoints(b?.finalPoints || 0)}</div>
                                <div className="flex items-center justify-end gap-0.5 text-[9px] font-bold text-field-600">
                                  <TrendingUp className="h-2.5 w-2.5" /> live
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>

            <Link href="/pog" className="btn btn-brand btn-lg w-full">
              <PackagePlus className="h-4 w-4" /> Log POG for bonus points <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        )}
      </div>

      <TeamPeekModal retailerId={peek} onClose={() => setPeek(null)} />
      <StageSwitcher />
    </AppShell>
  );
}

function StatCard({ label, value, sub, tint }: { label: string; value: string; sub: string; tint?: "brand" | "field" | "ink" }) {
  const tints = {
    brand: "bg-gradient-to-br from-brand-500 via-brand-500 to-brand-600 text-white shadow-glow-brand",
    field: "bg-gradient-to-br from-field-500 via-field-600 to-field-700 text-white shadow-glow-field",
    ink: "bg-white",
  } as const;
  const sublabel = tint ? "text-white/70" : "text-ink-400";
  const labelCls = tint ? "text-white/70" : "text-ink-500";
  return (
    <div className={`card-elev flex flex-col gap-0.5 p-4 ${tint ? tints[tint] : "bg-white"}`}>
      <div className={`text-[10px] font-bold uppercase tracking-[0.12em] ${labelCls}`}>{label}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className={`text-[11px] font-semibold ${sublabel}`}>{sub}</div>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={<AppShell><div className="p-10 text-center text-ink-400">Loading…</div></AppShell>}>
      <LivePageInner />
    </Suspense>
  );
}
