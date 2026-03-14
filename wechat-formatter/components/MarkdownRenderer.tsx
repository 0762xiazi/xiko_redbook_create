'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Theme } from './themes';

interface MarkdownRendererProps {
  markdown: string;
  theme: Theme;
}

export default function MarkdownRenderer({ markdown, theme }: MarkdownRendererProps) {
  const components = {
    h1: ({ children }: any) => (
      <h1 style={{ fontSize: '2em', fontWeight: 'bold', margin: '0.67em 0', color: theme.headingColor, borderBottom: `2px solid ${theme.color}`, paddingBottom: '0.3em' }}>
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0.83em 0', color: theme.headingColor, borderBottom: `1px solid ${theme.color}`, paddingBottom: '0.3em' }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 style={{ fontSize: '1.17em', fontWeight: 'bold', margin: '1em 0', color: theme.headingColor }}>
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 style={{ fontSize: '1em', fontWeight: 'bold', margin: '1.33em 0', color: theme.headingColor }}>
        {children}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 style={{ fontSize: '0.83em', fontWeight: 'bold', margin: '1.67em 0', color: theme.headingColor }}>
        {children}
      </h5>
    ),
    h6: ({ children }: any) => (
      <h6 style={{ fontSize: '0.67em', fontWeight: 'bold', margin: '2.33em 0', color: theme.headingColor }}>
        {children}
      </h6>
    ),
    p: ({ children }: any) => (
      <p style={{ margin: '1em 0', lineHeight: '1.6', color: theme.textColor }}>
        {children}
      </p>
    ),
    a: ({ href, children }: any) => (
      <a href={href} style={{ color: theme.linkColor, textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong style={{ fontWeight: 'bold', color: theme.headingColor }}>
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em style={{ fontStyle: 'italic' }}>
        {children}
      </em>
    ),
    code: ({ inline, className, children }: any) => {
      if (inline) {
        return (
          <code style={{ backgroundColor: theme.codeBgColor, color: theme.codeTextColor, padding: '0.2em 0.4em', borderRadius: '3px', fontFamily: 'monospace', fontSize: '0.9em' }}>
            {children}
          </code>
        );
      }
      const language = className?.replace(/language-/, '') || 'text';
      return (
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            backgroundColor: theme.codeBgColor,
            color: theme.codeTextColor,
            borderRadius: '8px',
            padding: '1em',
            fontSize: '0.9em',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    },
    pre: ({ children }: any) => (
      <pre style={{ backgroundColor: theme.codeBgColor, padding: '1em', borderRadius: '8px', overflow: 'auto', margin: '1em 0' }}>
        {children}
      </pre>
    ),
    blockquote: ({ children }: any) => (
      <blockquote style={{ borderLeft: `4px solid ${theme.quoteColor}`, paddingLeft: '1em', margin: '1em 0', color: theme.textColor, backgroundColor: `${theme.quoteColor}10`, padding: '0.5em 1em' }}>
        {children}
      </blockquote>
    ),
    ul: ({ children }: any) => (
      <ul style={{ margin: '1em 0', paddingLeft: '2em', color: theme.textColor }}>
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol style={{ margin: '1em 0', paddingLeft: '2em', color: theme.textColor }}>
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li style={{ margin: '0.5em 0', lineHeight: '1.6' }}>
        {children}
      </li>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: `1px solid ${theme.tableBorderColor}`, margin: '2em 0' }} />
    ),
    table: ({ children }: any) => (
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1em 0', border: `1px solid ${theme.tableBorderColor}` }}>
        {children}
      </table>
    ),
    thead: ({ children }: any) => (
      <thead style={{ backgroundColor: theme.tableHeaderBg }}>
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children }: any) => (
      <tr style={{ borderBottom: `1px solid ${theme.tableBorderColor}` }}>
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th style={{ padding: '0.75em', textAlign: 'left', fontWeight: 'bold', color: theme.headingColor, borderRight: `1px solid ${theme.tableBorderColor}` }}>
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td style={{ padding: '0.75em', borderRight: `1px solid ${theme.tableBorderColor}` }}>
        {children}
      </td>
    ),
    img: ({ src, alt }: any) => (
      <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto', margin: '1em 0', borderRadius: '8px' }} />
    ),
    del: ({ children }: any) => (
      <del style={{ textDecoration: 'line-through', opacity: 0.7 }}>
        {children}
      </del>
    ),
  };

  return (
    <div style={{ color: theme.textColor, lineHeight: '1.6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <ReactMarkdown components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
