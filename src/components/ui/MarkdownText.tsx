"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  children: string;
  className?: string;
}

export default function MarkdownText({ children, className = "" }: Props) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children: codeChildren, ...props }) {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code
                  className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-indigo-700"
                  {...props}
                >
                  {codeChildren}
                </code>
              );
            }
            return (
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                <code className={codeClassName} {...props}>
                  {codeChildren}
                </code>
              </pre>
            );
          },
          pre({ children: preChildren }) {
            // Just pass through - code block handles rendering
            return <>{preChildren}</>;
          },
          p({ children: pChildren }) {
            return <p className="mb-2 last:mb-0">{pChildren}</p>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
