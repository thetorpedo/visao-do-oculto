import { useState } from "react";

const capitalizeFirst = (str: string | null | undefined) => {
  if (!str) return "";
  const s = String(str);
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function ExpandableText({ text, limit = 250 }: { text: string; limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  const textoExibido = isExpanded ? text : `${text.substring(0, limit)}...`;

  if (text.length <= limit) {
    return <p className="text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed">{capitalizeFirst(text)}</p>;
  }

  return (
    <span className="text-sm text-justify whitespace-pre-wrap text-gray-800 leading-relaxed">
        {capitalizeFirst(textoExibido)}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-xs cursor-pointer whitespace-pre-wrap font-bold text-gray-600 hover:text-black underline uppercase tracking-tighter"
        >
          {isExpanded ? "[ Ler menos ]" : "[ Ler mais ]"}
        </button>
    </span>
  );
}