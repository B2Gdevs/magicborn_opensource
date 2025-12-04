// Markdown parser utilities for TOC generation and design token injection

import { getColorValue } from "./design-tokens";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface TocItem {
  id: string;
  title: string;
  level: number;
  children?: TocItem[];
}

// Generate table of contents from markdown text
export function generateTableOfContents(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const lines = markdown.split('\n');
  let stack: TocItem[] = [];

  lines.forEach((line) => {
    const h1Match = line.match(/^# (.*)$/);
    const h2Match = line.match(/^## (.*)$/);
    const h3Match = line.match(/^### (.*)$/);
    const h4Match = line.match(/^#### (.*)$/);

    if (h1Match) {
      const item: TocItem = {
        id: slugify(h1Match[1]),
        title: h1Match[1],
        level: 1,
        children: [],
      };
      toc.push(item);
      stack = [];
      stack.push(item);
    } else if (h2Match) {
      const title = h2Match[1];
      const item: TocItem = {
        id: slugify(title),
        title: title,
        level: 2,
        children: [],
      };
      if (stack.length > 0 && stack[stack.length - 1].level < 2) {
        stack[stack.length - 1].children?.push(item);
      } else {
        toc.push(item);
      }
      stack = stack.filter(s => s.level < 2);
      stack.push(item);
    } else if (h3Match) {
      const title = h3Match[1];
      const item: TocItem = {
        id: slugify(title),
        title: title,
        level: 3,
      };
      if (stack.length > 0 && stack[stack.length - 1].level < 3) {
        if (!stack[stack.length - 1].children) {
          stack[stack.length - 1].children = [];
        }
        stack[stack.length - 1].children?.push(item);
      } else {
        toc.push(item);
      }
      stack = stack.filter(s => s.level < 3);
      stack.push(item);
    } else if (h4Match) {
      const title = h4Match[1];
      const item: TocItem = {
        id: slugify(title),
        title: title,
        level: 4,
      };
      if (stack.length > 0 && stack[stack.length - 1].level < 4) {
        if (!stack[stack.length - 1].children) {
          stack[stack.length - 1].children = [];
        }
        stack[stack.length - 1].children?.push(item);
      }
    }
  });

  return toc;
}

// Process markdown content to inject design tokens
export function processMarkdownContent(markdown: string): string {
  // Replace design token placeholders like {{color:ember}} with actual color values
  return markdown.replace(/\{\{color:([\w-]+)\}\}/g, (match, colorName) => {
    const colorValue = getColorValue(colorName);
    if (colorValue) {
      return `\`${colorName}\` (${colorValue})`;
    }
    return match;
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
