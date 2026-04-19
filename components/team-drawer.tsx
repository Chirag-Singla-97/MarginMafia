"use client";

import { useMemo, useState } from "react";
import { Crown, Award, ChevronUp, ChevronDown, X, AlertCircle, ShieldCheck, Lock } from "lucide-react";
import { useTeamStore } from "@/store/team-store";
import { validateTeam, TOTAL_PICKS } from "@/lib/team-rules";
import { CATEGORIES, type Product } from "@/lib/types";

export function TeamDrawer({
  productsById,
  onSubmit,
  busy,
}: {
  productsById: Map<string, Product>;
  onSubmit: () => void;
  busy: boolean;
}) {
  const { picks, captainId, viceCaptainId, remove, setCaptain, setViceCaptain } = useTeamStore();
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => validateTeam({ picks, captainId, viceCaptainId }), [picks, captainId, viceCaptainId]);

  const groupedPicks = CATEGORIES.map((c) => ({
    cat: c,
    items: picks.filter((p) => p.category === c.id),
  }));

  const contents = (
    <TeamContents
      captainId={captainId}
      viceCaptainId={viceCaptainId}
      productsById={productsById}
      groupedPicks={groupedPicks}
      picks={picks}
      remove={remove}
      setCaptain={setCaptain}
      setViceCaptain={setViceCaptain}
      result={result}
      onSubmit={onSubmit}
      busy={busy}
    />
  );

  return (
    <>
      {/* Mobile bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white shadow-2xl lg:hidden">
        <button
          className="flex w-full items-center justify-between px-5 py-3.5"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">My team</div>
            <div className="font-display text-base font-bold">{picks.length}/{TOTAL_PICKS} picks</div>
          </div>
          <div className="flex items-center gap-2">
            {result.valid ? (
              <span className="chip chip-field"><ShieldCheck className="h-3 w-3" /> Valid</span>
            ) : picks.length === 0 ? (
              <span className="chip">Empty</span>
            ) : (
              <span className="chip" style={{ color: "#b91c1c", borderColor: "#fecaca", background: "#fef2f2" }}>
                <AlertCircle className="h-3 w-3" /> {result.errors.length}
              </span>
            )}
            {expanded ? <ChevronDown className="h-5 w-5 text-ink-500" /> : <ChevronUp className="h-5 w-5 text-ink-500" />}
          </div>
        </button>

        {expanded && (
          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin border-t border-ink-100 p-5">
            {contents}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
        <div className="card-elev flex h-full flex-col overflow-hidden">
          <div className="border-b border-ink-100 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Your team</div>
                <div className="font-display text-2xl font-bold">{picks.length}<span className="text-sm text-white/50 font-normal">/{TOTAL_PICKS} picks</span></div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="chip chip-dark">{picks.length}/{TOTAL_PICKS}</span>
                {result.valid ? (
                  <span className="chip chip-field"><ShieldCheck className="h-3 w-3" /> Ready</span>
                ) : picks.length > 0 && (
                  <span className="chip" style={{ color: "#fecaca", borderColor: "rgba(220,38,38,0.5)", background: "rgba(220,38,38,0.2)" }}>
                    <AlertCircle className="h-3 w-3" /> Invalid
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
            {contents}
          </div>
        </div>
      </aside>
    </>
  );
}

function TeamContents({
  picks,
  captainId,
  viceCaptainId,
  productsById,
  groupedPicks,
  remove,
  setCaptain,
  setViceCaptain,
  result,
  onSubmit,
  busy,
}: any) {
  return (
    <div className="flex flex-col h-full gap-4">
      {picks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center py-10">
          <div className="text-5xl">🌾</div>
          <div className="mt-3 font-display text-base font-bold text-ink-900">Your squad is empty</div>
          <div className="mt-1 text-xs text-ink-500 max-w-[220px]">Pick 1–3 from each of the 5 categories. Total = {TOTAL_PICKS}.</div>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          {groupedPicks.map(({ cat, items }: any) => (
            <section key={cat.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-600">
                  <span className="text-sm">{cat.emoji}</span> {cat.name}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${items.length === 0 ? "text-rose-500" : "text-ink-400"}`}>
                  {items.length}/3
                </span>
              </div>
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-3 text-center text-[11px] font-semibold text-ink-400">
                  Pick at least 1
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((pick: any) => {
                    const p: Product | undefined = productsById.get(pick.productId);
                    if (!p) return null;
                    const isCap = captainId === p.id;
                    const isVC = viceCaptainId === p.id;
                    return (
                      <li key={p.id} className={`rounded-xl border p-3 transition ${
                        isCap ? "border-amber-300 bg-amber-50/50" :
                        isVC ? "border-slate-300 bg-slate-50" :
                        "border-ink-100 bg-white"
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-ink-900">{p.name}</div>
                            <div className="truncate text-[11px] text-ink-500">{p.subCategory}</div>
                          </div>
                          <button
                            onClick={() => remove(p.id)}
                            className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-rose-600"
                            aria-label="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => setCaptain(p.id)}
                            className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
                              isCap
                                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow"
                                : "bg-amber-100/60 text-amber-800 hover:bg-amber-200/60"
                            }`}
                          >
                            <Crown className="h-3 w-3" /> C · 2×
                          </button>
                          <button
                            onClick={() => setViceCaptain(p.id)}
                            className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
                              isVC
                                ? "bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            <Award className="h-3 w-3" /> VC · 1.5×
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {picks.length > 0 && (
        <div className="mt-4 shrink-0 border-t border-ink-100 pt-4">
          {!result.valid && (
            <ul className="mb-3 space-y-1 rounded-xl bg-rose-50 border border-rose-100 p-3">
              {result.errors.map((e: string, i: number) => (
                <li key={i} className="flex gap-1.5 text-[11px] text-rose-700">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" /> <span>{e}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={onSubmit}
            disabled={!result.valid || busy}
            className="btn btn-brand btn-lg w-full"
          >
            {busy ? "Locking…" : <><Lock className="h-4 w-4" /> Lock my team</>}
          </button>
        </div>
      )}
    </div>
  );
}
