import { ReactNode } from "react";

export const inputCls = "w-full px-2 py-1 text-sm outline-none focus:border-gray-900 bg-gray-600/10 border-2 border-dashed border-gray-400/50";
export const textareaCls = "w-full px-2 py-1 text-sm outline-none focus:border-gray-900 bg-gray-600/10 border-2 border-dashed border-gray-400/50 resize-y";

export function Campo({ label, children, span2, spanfull }: { label: string; children: ReactNode; span2?: boolean; spanfull?: boolean }) {
    return (
        <div className={spanfull ? 'col-span-full' : span2 ? "md:col-span-2" : ""}>
            <label className="text-[10px] uppercase tracking-wide text-gray-600 block mb-0.5">
                {label}
            </label>
            {children}
        </div>
    );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-blur uppercase tracking-wider text-white bg-gray-950/90 px-2 border-gray-400 py-1">
                {titulo}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2">{children}</div>
        </div>
    );
}