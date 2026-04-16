"use client";

import { Trophy, Medal, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { LeaderboardRow } from "@/lib/types";
import { formatPoints } from "@/lib/utils";

export function LeaderboardTable({
  rows,
  onPeek,
}: {
  rows: LeaderboardRow[];
  onPeek: (retailerId: string) => void;
}) {
  return (
    <div className="card-elev overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Leaderboard</span>
          <span className="chip chip-field"><span className="dot-live h-1.5 w-1.5" /> Live</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Tap any row to peek their team</span>
      </div>
      <ul className="divide-y divide-ink-100">
        {rows.map((row) => (
          <li
            key={row.retailerId}
            onClick={() => onPeek(row.retailerId)}
            className={`group flex cursor-pointer items-center gap-3 px-5 py-3.5 transition ${
              row.isYou ? "bg-gradient-to-r from-brand-50 via-amber-50 to-white" : "hover:bg-ink-50/60"
            }`}
          >
            <RankBadge rank={row.rank} />
            <Avatar seed={row.avatarSeed} name={row.name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-bold text-ink-900">{row.name}</span>
                {row.isYou && <span className="chip chip-brand">You</span>}
              </div>
              <div className="truncate text-xs text-ink-500">{row.shopName}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg font-bold tabular-nums text-ink-900">{formatPoints(row.totalPoints)}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">pts</div>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-300 opacity-0 transition group-hover:opacity-100" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md"><Trophy className="h-5 w-5" /></div>;
  if (rank === 2) return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-md"><Medal className="h-5 w-5" /></div>;
  if (rank === 3) return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-800 text-white shadow-md"><Medal className="h-5 w-5" /></div>;
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-sm font-bold text-ink-700">#{rank}</div>;
}
