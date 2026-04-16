"use client";

import { X, Sparkles, Plus, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

export function ProductDetailSheet({
  product,
  picked,
  disabledAdd,
  onClose,
  onToggle,
}: {
  product: Product | null;
  picked: boolean;
  disabledAdd: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  if (!product) return null;
  const cat = CATEGORIES.find((c) => c.id === product.category)!;

  const heroAccent =
    cat.id === "plant-nutrition" ? "from-field-500 to-field-700" :
    cat.id === "crop-protection" ? "from-brand-500 to-brand-700" :
    "from-ink-700 to-ink-900";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" role="dialog">
      <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-xl md:rounded-3xl">
        {/* Hero */}
        <div className={`relative bg-gradient-to-br ${heroAccent} p-5 text-white`}>
          <button onClick={onClose} className="absolute top-4 right-4 rounded-lg bg-white/15 p-1.5 text-white hover:bg-white/25" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
            {cat.emoji} {cat.name} · {product.subCategory}
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold leading-tight">{product.name}</h2>
          {product.composition && (
            <div className="mt-1 text-sm text-white/80">{product.composition}</div>
          )}
          <div className="mt-4 flex gap-2">
            <div className="rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur">
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/60">Base points</div>
              <div className="font-display text-lg font-bold">{Math.round(product.basePoints)}</div>
            </div>
            <div className="rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur">
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/60">Velocity</div>
              <div className="font-display text-lg font-bold">{product.saleVelocity.toFixed(2)}×</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
          {product.shortDesc && (
            <section>
              <div className="label">What it does</div>
              <p className="text-sm text-ink-700 leading-relaxed">{product.shortDesc}</p>
            </section>
          )}

          {product.usp.length > 0 && (
            <section>
              <div className="label flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-brand-500" /> Why it wins</div>
              <ul className="space-y-2 rounded-xl bg-gradient-to-br from-brand-50 to-amber-50 p-4">
                {product.usp.map((u, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-ink-800">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span className="leading-relaxed">{u}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {product.cropTarget && <Row label="Target crops" value={product.cropTarget} />}
            {product.dosage && <Row label="Dosage" value={product.dosage} />}
            {product.applicationMethod && <Row label="Application" value={product.applicationMethod} />}
            {product.applicationTime && <Row label="Timing" value={product.applicationTime} />}
            {product.season && <Row label="Season" value={product.season} />}
            {product.geographies && <Row label="Geographies" value={product.geographies} />}
            {product.sku && <Row label="SKU" value={product.sku} />}
          </div>

          {product.disclaimer && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
              <b>Disclaimer:</b> {product.disclaimer}
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="border-t border-ink-100 bg-white p-4">
          <button
            onClick={onToggle}
            disabled={!picked && disabledAdd}
            className={`btn btn-lg w-full ${picked ? "btn-primary" : "btn-brand"}`}
          >
            {picked ? <><Check className="h-4 w-4" /> Remove from team</> : <><Plus className="h-4 w-4" /> Add to my team</>}
          </button>
          {!picked && disabledAdd && (
            <p className="mt-2 text-center text-xs font-semibold text-rose-600">Already picked max 3 from this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-ink-800 leading-snug">{value}</div>
    </div>
  );
}
