import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function RegraRenderer({ content }: { content: string }) {
  return (
    <div className="text-black prose prose-sm md:prose-base max-w-none 
      prose-headings:font-special prose-headings:underline prose-headings:text-gray-900
      prose-p:text-gray-800 prose-p:text-justify prose-p:leading-relaxed
      prose-strong:text-gray-900 prose-strong:font-bold
      prose-ul:list-disc prose-li:text-gray-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}