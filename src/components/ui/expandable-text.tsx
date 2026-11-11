import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MarkdownRenderer from "./markdown-renderer";

const capitalizeFirst = (str: string | null | undefined) => {
  if (!str) return "";
  const s = String(str);
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function ExpandableTextToggle({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className="inline-flex cursor-pointer items-center bg-black/5 gap-0.5 px-1 py-0 font-special text-[11px] text-black/80 transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
    >
      {expanded ? "Recolher" : "Expandir"}
      <ChevronDown className={`size-2.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
    </button>
  );
}

export default function ExpandableText({ text, limit = 160 }: { text: string; limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const textoCompleto = capitalizeFirst(text);
  const cabe = textoCompleto.length <= limit;
  const isCollapsedExcerpt = !isExpanded && !cabe;
  const textoExibido = isCollapsedExcerpt ? `${textoCompleto.substring(0, limit)}...` : textoCompleto;

  if (!text) return null;

  return (
    <div className="text-sm text-justify text-gray-800 leading-relaxed [&_.prose]:text-sm [&_p]:mb-2 last:[&_p]:mb-0">
      <MarkdownRenderer content={textoExibido} isCompact inline={isCollapsedExcerpt} />
      {!cabe && (
        <div className={isCollapsedExcerpt ? "inline" : "mt-1"}>
          <ExpandableTextToggle
            expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      )}
    </div>
  );
}