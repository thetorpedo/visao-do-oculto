import type { ReactNode } from "react";

export default function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative h-full border border-black/40 bg-black/5 p-4 sm:p-6">
      <div className="absolute top-0 left-4 flex -translate-y-1/2 items-center bg-gray-900 px-2 py-0.5 font-special text-xs tracking-widest text-white uppercase sm:text-sm">
        {title}
      </div>
      <div className="scrollbar-thin scrollbar-thumb-slate-900/60 scrollbar-track-slate-900/10 mt-3 max-h-50 overflow-y-auto pr-1">
        {children}
      </div>
    </div>
  );
}