"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { CATEGORIES, CATEGORY_ACCENTS, type Product, type CategoryId } from "@/lib/types";
import { POINTS_PER_100_POG } from "@/lib/scoring";
import { formatCurrency, formatPoints } from "@/lib/utils";
import { Plus, TrendingUp, CheckCircle2, AlertCircle, Trophy, ArrowRight } from "lucide-react";

interface POGItem {
  productId: string;
  category: CategoryId;
  product: Product | null;
  salesRs: number;
  combinedPogRs: number;
  remainingRs: number;
  myPogRs: number;
}

export default function PogPage() {
  const router = useRouter();
  const [retailer, setRetailer] = useState<any>(null);
  const [territory, setTerritory] = useState<any>(null);
  const [items, setItems] = useState<POGItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const reload = useCallback(async () => {
    const pog = await fetch("/api/pog").then((r) => r.json());
    setItems(pog.items || []);
  }, []);

  useEffect(() => {
    fetch("/api/bootstrap").then((r) => r.json()).then(async (boot) => {
      if (!boot.retailer) return router.replace("/");
      if (!boot.confirmed) return router.replace("/confirm");
      if (!boot.team) return router.replace("/team");
      setRetailer(boot.retailer);
      setTerritory(boot.territory);
      await reload();
      setLoaded(true);
    });
  }, [router, reload]);

  const grouped = useMemo(() => {
    const m: Record<CategoryId, POGItem[]> = {
      "spec-plant-nutrition": [],
      "crop-protection": [],
      "veg-seeds": [],
      "hybrid-seeds": [],
      "research-seeds": [],
    };
    for (const it of items) m[it.category].push(it);
    return m;
  }, [items]);

  const myTotalPog = useMemo(() => items.reduce((s, x) => s + x.myPogRs, 0), [items]);
  const myTotalPoints = useMemo(
    () => items.reduce((s, x) => s + Math.floor(x.myPogRs / 100) * POINTS_PER_100_POG, 0),
    [items],
  );

  async function submitEntry(productId: string, addRs: number) {
    setFlash(null);
    const res = await fetch("/api/pog", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, addRs }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFlash({ kind: "err", msg: body.error || "Failed to add POG." });
      return false;
    }
    setFlash({ kind: "ok", msg: `Added ${formatCurrency(addRs)}. +${formatPoints(Math.floor(addRs / 100) * POINTS_PER_100_POG)} pts.` });
    await reload();
    return true;
  }

  if (!loaded) return <AppShell><div className="p-10 text-center text-ink-400">Loading…</div></AppShell>;

  return (
    <AppShell
      eyebrow={
        <div className="flex items-center gap-2 flex-wrap">
          <span className="chip chip-field"><span className="dot-live h-1.5 w-1.5" /> Live POG</span>
          {territory && <span className="chip">{territory.name}</span>}
          <span className="chip chip-brand"><TrendingUp className="h-3 w-3" /> +{POINTS_PER_100_POG} pts / ₹100 sold</span>
        </div>
      }
      title="Product on Ground"
      subtitle="Log how much of each of your picks your shop sold this period. Entries are additive — your points update immediately."
      right={retailer && (
        <div className="flex items-center gap-3">
          <Link href="/live" className="hidden sm:inline-flex btn btn-outline"><Trophy className="h-4 w-4" /> Leaderboard</Link>
          <Avatar seed={retailer.avatarSeed} name={retailer.name} size={40} />
        </div>
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {flash && (
            <div className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm ${
              flash.kind === "ok" ? "border-field-200 bg-field-50 text-field-800" : "border-rose-200 bg-rose-50 text-rose-800"
            }`}>
              {flash.kind === "ok" ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
              <div>{flash.msg}</div>
            </div>
          )}

          {CATEGORIES.map((cat) => {
            const list = grouped[cat.id];
            if (list.length === 0) return null;
            const accent = CATEGORY_ACCENTS[cat.id];
            return (
              <section key={cat.id}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`chip ${accent.chip}`}>{cat.emoji} {cat.name}</span>
                  <span className="text-[11px] font-semibold text-ink-500">{list.length} pick{list.length === 1 ? "" : "s"}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {list.map((it) => (
                    <PogRow key={it.productId} item={it} onSubmit={(rs) => submitEntry(it.productId, rs)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-20 h-fit space-y-3">
          <div className="card-elev overflow-hidden">
            <div className="bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-5 text-white">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">Your POG this month</div>
              <div className="mt-1 font-display text-3xl font-bold">{formatCurrency(myTotalPog)}</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold">
                <TrendingUp className="h-3 w-3" /> +{formatPoints(myTotalPoints)} pts from POG
              </div>
            </div>
            <div className="p-5 text-xs text-ink-500 space-y-2">
              <p>Each ₹100 of POG you log adds <b className="text-ink-900">+{POINTS_PER_100_POG} pts</b> per product, multiplied by your Captain / Vice-Captain bonus.</p>
              <p>POG for each product is capped by combined territory sales — if a product is nearing its ceiling, other retailers will block further entries.</p>
            </div>
            <div className="border-t border-ink-100 p-4">
              <Link href="/live" className="btn btn-brand btn-lg w-full">See leaderboard <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function PogRow({ item, onSubmit }: { item: POGItem; onSubmit: (rs: number) => Promise<boolean> }) {
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    const n = Number(val.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    setBusy(true);
    const ok = await onSubmit(n);
    setBusy(false);
    if (ok) setVal("");
  }

  const myPts = Math.floor(item.myPogRs / 100) * POINTS_PER_100_POG;
  const pctCombined = item.salesRs > 0 ? Math.min(100, (item.combinedPogRs / item.salesRs) * 100) : 0;

  return (
    <div className="card-elev p-4 space-y-3">
      <div>
        <div className="truncate text-sm font-bold text-ink-900">{item.product?.name ?? item.productId}</div>
        <div className="truncate text-[11px] text-ink-500">{item.product?.subCategory || "—"}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="My POG" value={formatCurrency(item.myPogRs)} tint="brand" />
        <Stat label="Combined" value={formatCurrency(item.combinedPogRs)} />
        <Stat label="Ceiling" value={formatCurrency(item.salesRs)} />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ink-400">
          <span>Territory fill</span>
          <span>{pctCombined.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${pctCombined}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-ink-500">
          Remaining headroom: <b className="text-ink-900">{formatCurrency(item.remainingRs)}</b>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="input flex-1"
          placeholder="₹ sold this time"
          inputMode="numeric"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          disabled={busy || item.remainingRs <= 0}
        />
        <button
          onClick={add}
          disabled={busy || item.remainingRs <= 0 || !val}
          className="btn btn-brand"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {myPts > 0 && (
        <div className="inline-flex items-center gap-1 rounded-full bg-field-50 px-2 py-0.5 text-[11px] font-bold text-field-700">
          <TrendingUp className="h-3 w-3" /> +{formatPoints(myPts)} pts from your POG
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint?: "brand" }) {
  return (
    <div className={`rounded-lg px-2 py-1.5 ${tint === "brand" ? "bg-brand-50 text-brand-800" : "bg-ink-50 text-ink-700"}`}>
      <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="font-display text-sm font-bold tabular-nums">{value}</div>
    </div>
  );
}
