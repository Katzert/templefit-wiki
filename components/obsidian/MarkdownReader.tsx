'use client';

import React from 'react';
import { FileText, Plus, CheckSquare, Square, AlertCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { WikiNote } from './types';

interface MarkdownReaderProps {
  content: string;
  notes: WikiNote[];
  onNavigate: (noteId: string) => void;
  onCreateMissingNote: (title: string) => void;
  onToggleCheckbox?: (lineIndex: number, newChecked: boolean) => void;
}

export default function MarkdownReader({
  content,
  notes,
  onNavigate,
  onCreateMissingNote,
  onToggleCheckbox
}: MarkdownReaderProps) {
  // Normalize notes for case-insensitive title and ID lookup
  const noteLookup = React.useMemo(() => {
    const map = new Map<string, WikiNote>();
    notes.forEach(n => {
      map.set(n.id.toLowerCase(), n);
      map.set(n.title.toLowerCase(), n);
      // Also match without emoji
      const withoutEmoji = n.title.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim().toLowerCase();
      if (withoutEmoji) map.set(withoutEmoji, n);
    });
    return map;
  }, [notes]);

  const lines = content.split('\n');

  // Helper to parse wikilinks inside text
  const renderTextWithWikilinks = (text: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /\[\[(.*?)\]\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const rawLink = match[1].trim();
      const [linkTarget, linkAlias] = rawLink.split('|').map(s => s.trim());
      const normalized = linkTarget.toLowerCase();
      const targetNote = noteLookup.get(normalized);

      if (targetNote) {
        parts.push(
          <button
            key={`wiki-${match.index}`}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(targetNote.id);
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-amber-300 bg-temple-gold/15 hover:bg-temple-gold/30 hover:text-white border border-temple-gold/40 text-xs font-semibold mx-1 transition cursor-pointer"
            title={`Abrir nota: ${targetNote.title}`}
          >
            <FileText size={11} className="text-temple-gold shrink-0" />
            <span>{linkAlias || targetNote.title}</span>
          </button>
        );
      } else {
        parts.push(
          <button
            key={`wiki-create-${match.index}`}
            onClick={(e) => {
              e.stopPropagation();
              onCreateMissingNote(linkTarget);
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-purple-300 bg-purple-500/15 hover:bg-purple-500/30 hover:text-white border border-purple-400/30 text-xs font-semibold mx-1 transition cursor-pointer"
            title={`Crear nota: [[${linkTarget}]]`}
          >
            <Plus size={11} className="text-purple-400 shrink-0" />
            <span className="italic">{linkAlias || linkTarget} (crear)</span>
          </button>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="prose prose-invert max-w-none text-gray-200 text-sm leading-relaxed space-y-3 font-sans select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Headings (#, ##, ###)
        if (trimmed.startsWith('# ')) {
          const headingText = trimmed.replace(/^#\s+/, '');
          const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <h1 key={idx} id={id} className="text-xl sm:text-2xl font-serif font-black text-white pt-4 pb-2 border-b border-white/10">
              {renderTextWithWikilinks(headingText)}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^##\s+/, '');
          const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <h2 key={idx} id={id} className="text-lg sm:text-xl font-serif font-extrabold text-amber-200 pt-3 pb-1 border-b border-white/5">
              {renderTextWithWikilinks(headingText)}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <h3 key={idx} id={id} className="text-base font-serif font-bold text-temple-gold pt-2">
              {renderTextWithWikilinks(headingText)}
            </h3>
          );
        }

        // 2. Interactive Obsidian Checklists (- [ ] or - [x])
        if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
          const isChecked = trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ');
          const taskText = trimmed.replace(/^-\s*\[[ xX]\]\s*/, '');
          return (
            <div
              key={idx}
              onClick={() => onToggleCheckbox?.(idx, !isChecked)}
              className="flex items-start gap-2.5 py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer transition group"
            >
              <button
                type="button"
                className="mt-0.5 text-temple-gold group-hover:scale-110 transition shrink-0"
              >
                {isChecked ? (
                  <CheckSquare size={16} className="text-emerald-400 fill-emerald-500/20" />
                ) : (
                  <Square size={16} className="text-gray-400" />
                )}
              </button>
              <span className={`text-xs sm:text-sm leading-snug ${isChecked ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                {renderTextWithWikilinks(taskText)}
              </span>
            </div>
          );
        }

        // 3. Obsidian Callouts (> [!NOTE], > [!TIP], etc.)
        if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!INFO]')) {
          return (
            <div key={idx} className="my-2 p-3.5 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl flex items-start gap-2.5 text-xs text-blue-200">
              <Info size={16} className="shrink-0 text-blue-400 mt-0.5" />
              <div>{renderTextWithWikilinks(trimmed.replace(/^>\s*\[!(NOTE|INFO)\]\s*/, ''))}</div>
            </div>
          );
        }
        if (trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!IDEA]')) {
          return (
            <div key={idx} className="my-2 p-3.5 bg-amber-500/10 border-l-4 border-temple-gold rounded-r-xl flex items-start gap-2.5 text-xs text-amber-200">
              <Lightbulb size={16} className="shrink-0 text-temple-gold mt-0.5" />
              <div>{renderTextWithWikilinks(trimmed.replace(/^>\s*\[!(TIP|IDEA)\]\s*/, ''))}</div>
            </div>
          );
        }
        if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!CAUTION]')) {
          return (
            <div key={idx} className="my-2 p-3.5 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl flex items-start gap-2.5 text-xs text-red-200">
              <AlertTriangle size={16} className="shrink-0 text-red-400 mt-0.5" />
              <div>{renderTextWithWikilinks(trimmed.replace(/^>\s*\[!(WARNING|CAUTION)\]\s*/, ''))}</div>
            </div>
          );
        }

        // 4. Horizontal Rule (---)
        if (trimmed === '---') {
          return <hr key={idx} className="border-white/10 my-4" />;
        }

        // 5. Unordered List Items (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <li key={idx} className="list-disc ml-5 text-xs sm:text-sm text-gray-300 py-0.5">
              {renderTextWithWikilinks(trimmed.replace(/^[-*]\s+/, ''))}
            </li>
          );
        }

        // 6. Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // 7. Regular paragraph with wikilink parser
        return (
          <p key={idx} className="text-xs sm:text-sm leading-relaxed text-gray-300">
            {renderTextWithWikilinks(line)}
          </p>
        );
      })}
    </div>
  );
}
