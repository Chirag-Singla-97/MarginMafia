"use client";

import { Info, Plus, Check, Sparkles, Crown, Award } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

export function ProductCard({
  product,
  picked,
  disabledAdd,
  onToggle,
  onInfo,
  isCaptain,
  isViceCaptain,
}: {
  product: Product;
  picked: boolean;
  disabledAdd: boolean;
  onToggle: () => void;
  onInfo: () => void;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}) {
  const cat = CATEGORIES.find((c) => c.id === product.category)!;
  const accent =
    cat.id === "plant-nutrition" ? "chip-field" :
    cat.id === "crop-protection" ? "chip-brand" :
    "chip-dark";

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
        picked
          ? "border-ink-900 shadow-elev"
          : "border-ink-100 hover:border-ink-200 hover:shadow-card"
      }`}
    >
      {/* Top color strip by category */}
      <div className={`h-1 w-full ${
        cat.id === "plant-nutrition" ? "bg-gradient-to-r from-field-400 to-field-600" :
        cat.id === "crop-protection" ? "bg-gradient-to-r from-brand-400 to-brand-600" :
        "bg-gradient-to-r from-ink-600 to-ink-900"
      }`} />

      {(isCaptain || isViceCaptain) && (
        <div className={`absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-white shadow-md ${
          isCaptain ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-gradient-to-br from-slate-400 to-slate-600"
        }`}>
          {isCaptain ? <><Crown className="h-3 w-3" /> C · 2×</> : <><Award className="h-3 w-3" /> VC · 1.5×</>}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className={`chip ${accent}`}>
            <span className="text-[10px]">{cat.emoji}</span>
            <span className="truncate max-w-[140px]">{product.subCategory || cat.name}</span>
          </span>
        </div>

        <h3 className="font-display text-base font-bold leading-snug text-ink-900 line-clamp-2">
          {product.name}
        </h3>

        {product.shortDesc && (
          <p className="mt-2 text-xs leading-relaxed text-ink-500 line-clamp-3">{product.shortDesc}</p>
        )}

        <div className="mt-3 space-y-1">
          {product.composition && <InfoLine label="Composition" value={product.composition} />}
          {product.cropTarget && <InfoLine label="Crops" value={product.cropTarget} />}
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-center justify-between border-t border-dashed border-ink-100 pt-3">
            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-600">
              <Sparkles className="h-3 w-3" />
              <span>{Math.round(product.basePoints)} base pts</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              {product.saleVelocity.toFixed(2)}× velocity
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onInfo}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 transition hover:border-ink-400 hover:bg-ink-50"
            >
              <Info className="h-3.5 w-3.5" /> Learn
            </button>
            <button
              onClick={onToggle}
              disabled={!picked && disabledAdd}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                picked
                  ? "bg-ink-900 text-white hover:bg-ink-800"
                  : "bg-brand-500 text-white hover:bg-brand-600 shadow-sm disabled:bg-ink-100 disabled:text-ink-400 disabled:shadow-none disabled:cursor-not-allowed"
              }`}
            >
              {picked ? <><Check className="h-3.5 w-3.5" /> Picked</> : <><Plus className="h-3.5 w-3.5" /> Add</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5 text-[11px]">
      <span className="font-bold uppercase tracking-[0.08em] text-[9px] text-ink-400 shrink-0 mt-0.5 w-[65px]">{label}</span>
      <span className="text-ink-600 line-clamp-1 flex-1">{value}</span>
    </div>
  );
}
