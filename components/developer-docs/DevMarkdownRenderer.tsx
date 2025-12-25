'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DevCodeBlock from './DevCodeBlock';

interface DevMarkdownRendererProps {
  content: string;
}

export default function DevMarkdownRenderer({ content }: DevMarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings with anchor IDs
        h1: ({ children }) => {
          const text = String(children);
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return (
            <h1 id={id} className="text-4xl font-bold text-ember-glow mt-0 mb-6 scroll-mt-24">
              {children}
            </h1>
          );
        },
        h2: ({ children }) => {
          const text = String(children);
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return (
            <h2 id={id} className="text-2xl font-bold text-ember-glow mt-12 mb-4 pb-2 border-b border-border scroll-mt-24">
              {children}
            </h2>
          );
        },
        h3: ({ children }) => {
          const text = String(children);
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return (
            <h3 id={id} className="text-xl font-semibold text-text-primary mt-8 mb-3 scroll-mt-24">
              {children}
            </h3>
          );
        },
        h4: ({ children }) => {
          const text = String(children);
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return (
            <h4 id={id} className="text-lg font-semibold text-text-secondary mt-6 mb-2 scroll-mt-24">
              {children}
            </h4>
          );
        },

        // Paragraphs
        p: ({ children }) => (
          <p className="text-text-secondary leading-7 mb-4">
            {children}
          </p>
        ),

        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-ember-glow hover:text-ember underline underline-offset-2 transition-colors"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        ),

        // Code blocks
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !className;
          
          if (isInline) {
            return (
              <code 
                className="bg-shadow px-1.5 py-0.5 rounded text-sm font-mono text-red-400 border border-border"
                {...props}
              >
                {children}
              </code>
            );
          }
          
          return (
            <DevCodeBlock language={match?.[1] || ''}>
              {String(children).replace(/\n$/, '')}
            </DevCodeBlock>
          );
        },

        // Pre (handled by code block)
        pre: ({ children }) => <>{children}</>,

        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-text-secondary">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-text-secondary">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-7 pl-2">
            {children}
          </li>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-ember/50 pl-4 py-2 my-6 italic text-text-muted bg-shadow/50 rounded-r">
            {children}
          </blockquote>
        ),

        // Horizontal rule
        hr: () => <hr className="my-8 border-border" />,

        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-border rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-shadow">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="border border-border px-4 py-3 text-left font-semibold text-ember-glow">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-4 py-3 text-text-secondary">
            {children}
          </td>
        ),

        // Strong and emphasis
        strong: ({ children }) => (
          <strong className="font-bold text-ember-glow">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-text-glow">{children}</em>
        ),

        // Images
        img: ({ src, alt }) => (
          <figure className="my-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={src} 
              alt={alt || ''} 
              className="rounded-lg border border-border max-w-full"
            />
            {alt && (
              <figcaption className="text-sm text-text-muted text-center mt-2">
                {alt}
              </figcaption>
            )}
          </figure>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}




