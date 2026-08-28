import { ReactNode } from "react";

export default function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative p-6 border border-gray-400 bg-gray-300/30">
      <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center">
        {title}
      </div>
      <div className="mt-3 max-h-50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900/60 scrollbar-track-slate-900/10">
        {children}
      </div>
    </div>
  );
}