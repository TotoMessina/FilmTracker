import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const INLINE_REGEX =
  /(\*\*\*[^*]+\*\*\*|___[^_]+___|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/;

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(INLINE_REGEX);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold + Italic
    if (
      (part.startsWith("***") && part.endsWith("***") && part.length >= 6) ||
      (part.startsWith("___") && part.endsWith("___") && part.length >= 6)
    ) {
      return (
        <strong key={idx} className="font-bold text-white">
          <em className="italic">{part.slice(3, -3)}</em>
        </strong>
      );
    }

    // Bold
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      return (
        <em key={idx} className="italic text-zinc-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline code
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-black/40 text-pink-300 font-mono text-xs border border-white/5"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Markdown link
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        return (
          <a
            key={idx}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 underline font-medium"
          >
            {match[1]}
          </a>
        );
      }
    }

    return <span key={idx}>{part}</span>;
  });
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const elements: React.ReactNode[] = [];

  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentQuote: string[] = [];

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === "ul") {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-zinc-200 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
              <div className="flex-1 leading-relaxed">{parseInline(item)}</div>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 space-y-1.5">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-zinc-200 text-sm">
              <span className="font-bold text-red-400 text-xs mt-0.5 shrink-0 min-w-4">
                {idx + 1}.
              </span>
              <div className="flex-1 leading-relaxed">{parseInline(item)}</div>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  const flushQuote = () => {
    if (currentQuote.length === 0) return;
    elements.push(
      <blockquote
        key={`quote-${elements.length}`}
        className="border-l-2 border-red-500/70 pl-3 my-2.5 text-zinc-300 italic bg-white/5 py-1.5 pr-2.5 rounded-r-xl text-sm"
      >
        {currentQuote.map((qLine, qIdx) => (
          <p key={qIdx} className="my-0.5 leading-relaxed">
            {parseInline(qLine)}
          </p>
        ))}
      </blockquote>
    );
    currentQuote = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check Blockquote
    if (trimmed.startsWith(">")) {
      flushList();
      currentQuote.push(trimmed.replace(/^>\s?/, ""));
      continue;
    } else {
      flushQuote();
    }

    // Check Bullet List item: starts with '- ' or '* '
    const ulMatch = rawLine.match(/^(\s*)([-*])\s+(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[3]);
      continue;
    }

    // Check Numbered List item: starts with '1. ', '2. ', etc.
    const olMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[3]);
      continue;
    }

    // If it was in a list and this line is not a list item, flush list
    flushList();

    // Empty line
    if (!trimmed) {
      continue;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      elements.push(
        <hr key={`hr-${elements.length}`} className="border-t border-white/10 my-3" />
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4
          key={`h4-${elements.length}`}
          className="text-sm font-bold text-zinc-200 mt-2.5 mb-1"
        >
          {parseInline(trimmed.slice(5))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="text-base font-bold text-red-400 mt-3 mb-1"
        >
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="text-lg font-extrabold text-white mt-3.5 mb-1.5"
        >
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${elements.length}`}
          className="text-xl font-black text-white mt-4 mb-2 pb-1 border-b border-white/10"
        >
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${elements.length}`} className="my-1.5 leading-relaxed text-sm">
        {parseInline(rawLine)}
      </p>
    );
  }

  flushList();
  flushQuote();

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
}

export default MarkdownRenderer;
