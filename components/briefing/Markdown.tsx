// Minimal markdown renderer for briefing output. Supports: #/##/### headings,
// - bullets, **bold**, _italic_, `inline code`, blockquotes and horizontal rules.
// Not safe for untrusted HTML-bearing input. We only render model output that
// never contains raw HTML because we control the prompt format.

import React from "react";

function inline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) nodes.push(<strong key={key++} className="text-fg">{token.slice(2, -2)}</strong>);
    else if (token.startsWith("_")) nodes.push(<em key={key++} className="text-fg">{token.slice(1, -1)}</em>);
    else if (token.startsWith("`")) nodes.push(<code key={key++} className="px-1 py-0.5 bg-surface-2 text-pos rounded text-[11px] font-mono">{token.slice(1, -1)}</code>);
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listKey = 0;

  function flushList() {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${listKey++}`} className="list-disc pl-5 space-y-1 text-xs text-fg-dim">
        {listBuffer.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuffer.push(line.slice(2));
      return;
    }
    flushList();
    if (line.startsWith("### ")) {
      blocks.push(<h3 key={idx} className="text-sm font-semibold text-fg mt-4 mb-1">{inline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      blocks.push(<h2 key={idx} className="text-base font-semibold text-fg mt-5 mb-1.5">{inline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      blocks.push(<h1 key={idx} className="text-lg font-semibold text-fg mt-5 mb-2">{inline(line.slice(2))}</h1>);
    } else if (line.startsWith("> ")) {
      blocks.push(<blockquote key={idx} className="border-l-2 border-pos/40 pl-3 text-xs text-fg-dim italic">{inline(line.slice(2))}</blockquote>);
    } else if (line === "---" || line === "***") {
      blocks.push(<hr key={idx} className="border-border/60 my-3" />);
    } else if (line.length === 0) {
      blocks.push(<div key={idx} className="h-2" />);
    } else {
      blocks.push(<p key={idx} className="text-xs text-fg-dim leading-relaxed">{inline(line)}</p>);
    }
  });
  flushList();

  return <div className="space-y-1">{blocks}</div>;
}
