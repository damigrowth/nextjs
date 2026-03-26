import { sanitizeRichText } from '@/lib/utils/text/sanitize';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const sanitized = sanitizeRichText(content);

  return (
    <div
      className="article-prose
        [&>h2]:text-3xl [&>h2]:font-medium [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-5
        [&>h3]:text-2xl [&>h3]:font-medium [&>h3]:text-gray-900 [&>h3]:mt-10 [&>h3]:mb-4
        [&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-gray-700 [&>p]:mb-5
        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ul]:space-y-2
        [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5 [&>ol]:space-y-2
        [&_li]:text-lg [&_li]:leading-relaxed [&_li]:text-gray-700
        [&_strong]:font-semibold [&_strong]:text-gray-900
        [&_em]:italic
        [&>p:first-child]:text-xl [&>p:first-child]:leading-relaxed [&>p:first-child]:text-gray-800
      "
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
