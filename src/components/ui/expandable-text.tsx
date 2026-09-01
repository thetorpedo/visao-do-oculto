import { useState } from "react";
import MarkdownRenderer from "./markdown-renderer";

const capitalizeFirst = (str: string | null | undefined) => {
  if (!str) return "";
  const s = String(str);
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function ExpandableText({ text, limit = 250 }: { text: string; limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  const textoCompleto = capitalizeFirst(text);
  const cabe = textoCompleto.length <= limit;
  const textoExibido = isExpanded || cabe ? textoCompleto : `${textoCompleto.substring(0, limit)}...`;

  return (
    <div className="text-sm text-justify text-gray-800 leading-relaxed [&_.prose]:text-sm [&_p]:mb-2 last:[&_p]:mb-0">
      <MarkdownRenderer content={textoExibido} isCompact />
      {!cabe && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-xs cursor-pointer font-bold text-gray-600 hover:text-black underline uppercase tracking-tighter"
        >
          {isExpanded ? "[ Ler menos ]" : "[ Ler mais ]"}
        </button>
      )}
    </div>
  );
}