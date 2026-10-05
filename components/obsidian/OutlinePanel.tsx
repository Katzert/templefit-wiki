'use client';

import React, { useMemo } from 'react';
import { ListTree, ChevronRight } from 'lucide-react';

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
        // Remove markdown formatting from text
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
    return null;
  }

  return (
    <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-temple-gold flex items-center gap-1.5">
          <ListTree size={14} /> Esquema / Tabla de Contenidos
        </h4>
        <span className="text-[10px] text-gray-400 font-mono">
          {headings.length} secciones
        </span>
      </div>

      <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
        {headings.map((h, i) => (
          <button
            key={i}
            onClick={() => handleScrollToHeading(h.id)}
            style={{ paddingLeft: `${(h.level - 1) * 12 + 6}px` }}
            className="w-full text-left py-1 text-xs text-gray-300 hover:text-amber-300 hover:bg-white/5 rounded-lg transition flex items-center gap-1.5 group truncate"
          >
            <ChevronRight size={11} className="text-gray-500 group-hover:text-amber-400 shrink-0" />
            <span className={`truncate ${h.level === 1 ? 'font-bold text-white' : h.level === 2 ? 'font-medium' : 'text-gray-400'}`}>
              {h.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
