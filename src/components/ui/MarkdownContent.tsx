import React from "react";
import { marked } from "marked";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const html = marked.parse(content);
  return (
    <div
      className="markdown-content text-[13px] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
