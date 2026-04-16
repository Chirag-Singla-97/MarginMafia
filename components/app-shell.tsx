"use client";

import Link from "next/link";
import { ReactNode } from "react";

export function AppShell({
  children,
  title,
  subtitle,
  right,
  eyebrow,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink-50/40 text-ink-900">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-lg shadow-card transition group-hover:scale-105">🌾</div>
            <div className="leading-none">
              <div className="font-display text-base font-bold tracking-tight">
                Margin<span className="text-brand-600">Mafia</span>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-400">
                Agri Fantasy League
              </div>
            </div>
          </Link>
          <div>{right}</div>
        </div>
      </header>
      {(title || subtitle || eyebrow) && (
        <div className="mx-auto max-w-6xl px-4 pt-7 pb-3">
          {eyebrow && <div className="mb-2">{eyebrow}</div>}
          {title && <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>}
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
