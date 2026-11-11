import { useRef, useState, type ReactNode } from "react";
import { Bold, Code, Eye, Heading, Italic, List, Link, Pencil } from "lucide-react";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { textareaCls } from "./form-layout";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 6,
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after = before, fallback = "texto") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const prefixLines = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "texto";
    const formatted = selected
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
    const nextValue = `${value.slice(0, start)}${formatted}${value.slice(end)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    });
  };

  const toolbarButton = (
    label: string,
    icon: ReactNode,
    onClick: () => void,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-7 cursor-pointer items-center justify-center border border-gray-400/70 bg-white/50 text-gray-700 transition-colors hover:bg-gray-900 hover:text-white"
    >
      {icon}
    </button>
  );

  return (
    <div className="border-2 border-dashed border-gray-400/50 bg-gray-600/10">
      <div className="flex flex-wrap items-center gap-1 border-dashed border-gray-400/70 p-1">
        {toolbarButton("Negrito", <Bold className="size-3.5" />, () => wrapSelection("**"))}
        {toolbarButton("Itálico", <Italic className="size-3.5" />, () => wrapSelection("*"))}
        {toolbarButton("Código", <Code className="size-3.5" />, () => wrapSelection("`"))}
        {toolbarButton("Título", <Heading className="size-3.5" />, () => prefixLines("## "))}
        {toolbarButton("Lista", <List className="size-3.5" />, () => prefixLines("- "))}
        {toolbarButton("Link", <Link className="size-3.5" />, () => wrapSelection("[", "](url)", "texto"))}
        <button
          type="button"
          onClick={() => setPreview((current) => !current)}
          className="ml-auto inline-flex h-7 cursor-pointer border font-special items-center gap-1 border-gray-400/70 bg-white/50 px-2 text-[10px] uppercase tracking-wide text-gray-700 transition-colors hover:bg-gray-900 hover:text-white"
        >
          {preview ? <Pencil className="size-3" /> : <Eye className="size-3" />}
          {preview ? "Editar" : "Prévia"}
        </button>
      </div>

      {preview ? (
        <div className="min-h-36 bg-white/30 p-2 text-sm">
          {value ? (
            <MarkdownRenderer content={value} isCompact />
          ) : (
            <span className="text-gray-500 italic">A prévia aparecerá aqui.</span>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={`${textareaCls} min-h-36 resize-y border-0! bg-transparent`}
        />
      )}
    </div>
  );
}
