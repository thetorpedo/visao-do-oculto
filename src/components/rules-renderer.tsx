import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function RulesRenderer({ content }: { content: string }) {
  return (
    <div className="text-black prose prose-sm md:prose-base max-w-none 

      prose-headings:font-blur prose-headings:font-normal prose-headings:border-b prose-headings:text-black

      prose-h1:border-b-2 prose-h2:border-b-2 prose-h2:text-3xl prose-h2:mt-10! prose-h1:text-4xl

      prose-table:bg-gray-400/30 prose-table:p-5  prose-table:font-special
      prose-th:border-b-2 prose-th:pb-0 prose-th:font-optima-bold prose-th:text-base
      prose-tr:even:bg-gray-200/90 

      prose-table:border-separate prose-table:border-spacing-0

    prose-ul:[&>li::marker]:text-red-800
    prose-ol:[&>li::marker]:text-red-800   

      prose-p:text-gray-800 prose-p:text-justify prose-p:leading-relaxed
      prose-strong:text-gray-900 prose-strong:font-bold
      prose-ul:list-disc prose-li:text-gray-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}