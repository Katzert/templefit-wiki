'use client';

import React, { useMemo } from 'react';
import { ChevronRight, ListTree } from 'lucide-react';

interface OutlinePanelProps {
  content: string;
}

interface HeadingItem {
  id: string;
  level: number;
  text: string;
}

export default function OutlinePanel({ content }: OutlinePanelProps) {
  const headings = useMemo<HeadingItem[]>(() => {
    const list: HeadingItem[] = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      const match = line.trim().match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim();
        const cleanText = rawText.replace(/\[\[(.*?)\]\]/g, '$1').replace(/[*_`]/g, '');
        const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        list.push({ id, level, text: cleanText });
      }
    });

    return list;
  }, [content]);

  const handleScrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) {
    return (
      <div className="p-3 text-[11px] text-gray-500 italic">
        No headings found in document
      </div>
    );
  }

  return (
    <div className="text-xs font-sans space-y-1">
      <div className="flex items-center justify-between text-gray-400 py-1 text-[11px] font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <ListTree size={12} className="text-[#a78bfa]" />
          <span>Outline</span>
        </span>
        <span className="text-[10px] font-mono text-gray-500">{headings.length}</span>
      </div>

      <div className="space-y-0.5 pt-1">
        {headings.map((h, i) => (
          <button
            key={i}
            onClick={() => handleScrollToHeading(h.id)}
            style={{ paddingLeft: `${(h.level - 1) * 12 + 4}px` }}
            className="w-full text-left py-1 px-2 text-[12px] text-gray-300 hover:text-white hover:bg-[#252525] rounded transition flex items-center gap-1.5 truncate group"
          >
            <ChevronRight size={10} className="text-gray-500 group-hover:text-gray-300 shrink-0" />
            <span className={`truncate ${h.level === 1 ? 'font-medium text-gray-100' : 'text-gray-400'}`}>
              {h.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
