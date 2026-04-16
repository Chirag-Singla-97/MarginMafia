"use client";

import { useEffect, useState } from "react";
import { X, Crown, Award } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { CATEGORIES, type Product } from "@/lib/types";
import { formatPoints } from "@/lib/utils";

interface PeekData {
  team: { retailerId: string; captainId: string; viceCaptainId: string };
  retailer: { id: string; name: string; shopName: string; avatarSeed: string } | null;
  score: { total: number; breakdown: { productId: string; finalPoints: number; isCaptain: boolean; isViceCaptain: boolean }[] };
  picks: { productId: string; category: string; product: Product | null }[];
}

export function TeamPeekModal({ retailerId, onClose }: { retailerId: string | null; onClose: () => void }) {
  const [data, setData] = useState<PeekData | null>(null);

  useEffect(() => {
    if (!retailerId) { setData(null); return; }
    setData(null);
    fetch(`/api/team/${retailerId}`).then((r) => r.json()).then(setData);
  }, [retailerId]);

  if (!retailerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" role="dialog">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-xl md:rounded-3xl">
        <div className="relative bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-5 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 rounded-lg bg-white/15 p-1.5 text-white hover:bg-white/25"><X className="h-5 w-5" /></button>
          {data?.retailer ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar seed={data.retailer.avatarSeed} name={data.retailer.name} size={56} />
                <div>
                  <div className="font-display text-xl font-bold">{data.retailer.name}</div>
                  <div className="text-xs text-white/60">{data.retailer.shopName}</div>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white/10 p-3 backdrop-blur">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">Total points</div>
                <div className="font-display text-3xl font-bold">{formatPoints(data.score.total)}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-white/70">Loading…</div>
          )}
        </div>

        {data && (
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
            {CATEGORIES.map((cat) => {
              const items = data.picks.filter((p) => p.category === cat.id);
              if (items.length === 0) return null;
              return (
                <section key={cat.id}>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-500">
                    <span className="text-base">{cat.emoji}</span> {cat.name}
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((pk) => {
                      const p = pk.product;
                      if (!p) return null;
                      const isC = p.id === data.team.captainId;
                      const isVC = p.id === data.team.viceCaptainId;
                      const b = data.score.breakdown.find((x) => x.productId === p.id);
                      return (
                        <li key={p.id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${
                          isC ? "border-amber-200 bg-amber-50/50" :
                          isVC ? "border-slate-200 bg-slate-50/50" :
                          "border-ink-100"
                        }`}>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-bold">{p.name}</span>
                              {isC && <span className="chip chip-gold"><Crown className="h-3 w-3" /> C</span>}
                              {isVC && <span className="chip chip-silver"><Award className="h-3 w-3" /> VC</span>}
                            </div>
                            <div className="truncate text-[11px] text-ink-500">{p.subCategory}</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="font-display text-base font-bold">{formatPoints(b?.finalPoints || 0)}</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">pts</div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
