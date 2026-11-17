import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

export default function MarkdownRenderer({
  content,
  isCompact = false,
  inline = false,
}: {
  content: string;
  isCompact?: boolean;
  inline?: boolean;
}) {
  return (
    <div className={`${inline ? "inline prose-p:inline prose-p:my-0 prose-p:mr-1" : ""} text-black dark:text-zinc-200 prose dark:prose-invert max-w-none
      prose-headings:font-blur prose-headings:font-normal prose-headings:border-b prose-headings:text-black dark:prose-headings:text-zinc-100 dark:prose-headings:border-zinc-700
      prose-table:bg-gray-400/30 dark:prose-table:bg-zinc-900/70 prose-table:p-5 prose-table:font-special
      prose-th:border-b-2 prose-th:pb-0 prose-th:font-optima-bold prose-th:text-base dark:prose-th:text-emerald-300 dark:prose-th:border-zinc-700
      prose-tr:even:bg-gray-200/90 dark:prose-tr:even:bg-zinc-800/60
      prose-table:border-separate prose-table:border-spacing-0
      prose-ul:[&>li::marker]:text-red-800 dark:prose-ul:[&>li::marker]:text-emerald-400
      prose-ol:[&>li::marker]:text-red-800 dark:prose-ol:[&>li::marker]:text-emerald-400
      prose-p:text-gray-800 dark:prose-p:text-zinc-300 prose-p:text-justify prose-p:leading-relaxed
      prose-strong:text-gray-900 dark:prose-strong:text-zinc-100 prose-strong:font-bold
      prose-blockquote: dark:prose-blockquote:text-zinc-300 dark:prose-blockquote:border-emerald-500/60
      prose-ul:list-disc prose-li:text-gray-800 dark:prose-li:text-zinc-300
      ${isCompact
        ? "prose-sm prose-p:text-sm prose-h1:border-b prose-h1:text-2xl prose-h2:border-b prose-h2:text-xl prose-h2:mt-4"
        : "prose-sm md:prose-base prose-h1:border-b-2 prose-h2:border-b-2 prose-h2:text-3xl prose-h2:mt-10! prose-h1:text-4xl"
      }`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}