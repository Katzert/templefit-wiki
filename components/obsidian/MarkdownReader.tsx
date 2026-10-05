'use client';

import React from 'react';
import { CheckSquare, Square, Info, AlertTriangle, Lightbulb } from 'lucide-react';
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
      const withoutEmoji = n.title.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim().toLowerCase();
      if (withoutEmoji) map.set(withoutEmoji, n);
      // Also match without numbers e.g. "Modelo Bicéfalo y Espacios"
      const withoutNumber = withoutEmoji.replace(/^\d+\.\s*/, '').trim().toLowerCase();
      if (withoutNumber) map.set(withoutNumber, n);
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
        parts.push(renderInlineFormatting(text.slice(lastIndex, match.index)));
      }

      const rawLink = match[1].trim();
      const [linkTarget, linkAlias] = rawLink.split('|').map(s => s.trim());
      const normalized = linkTarget.toLowerCase();
      const targetNote = noteLookup.get(normalized) || 
        noteLookup.get(normalized.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim()) ||
        notes.find(n => n.title.toLowerCase().includes(normalized) || normalized.includes(n.title.toLowerCase()));

      if (targetNote) {
        parts.push(
          <span
            key={`wiki-${match.index}`}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(targetNote.id);
            }}
            className="text-[#a78bfa] hover:text-[#c4b5fd] hover:underline cursor-pointer font-medium"
            title={`Abrir nota: ${targetNote.title}`}
          >
            {linkAlias || targetNote.title}
          </span>
        );
      } else {
        parts.push(
          <span
            key={`wiki-create-${match.index}`}
            onClick={(e) => {
              e.stopPropagation();
              onCreateMissingNote(linkTarget);
            }}
            className="text-[#a78bfa]/60 hover:text-[#a78bfa] hover:underline cursor-pointer font-medium italic"
            title={`Crear nota: [[${linkTarget}]]`}
          >
            {linkAlias || linkTarget}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderInlineFormatting(text.slice(lastIndex)));
    }

    return parts;
  };

  // Helper to parse bold, italic and code
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Basic bold and code parsing
    const codeSplit = text.split(/(`[^`]+`)/g);
    return codeSplit.map((chunk, ci) => {
      if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length >= 2) {
        return (
          <code key={ci} className="bg-[#262626] text-[#e5e5e5] px-1.5 py-0.5 rounded font-mono text-[11px]">
            {chunk.slice(1, -1)}
          </code>
        );
      }
      const boldSplit = chunk.split(/(\*\*[^*]+\*\*)/g);
      return boldSplit.map((bChunk, bi) => {
        if (bChunk.startsWith('**') && bChunk.endsWith('**') && bChunk.length >= 4) {
          return (
            <strong key={`${ci}-${bi}`} className="font-semibold text-[#f1f1f1]">
              {bChunk.slice(2, -2)}
            </strong>
          );
        }
        return bChunk;
      });
    });
  };

  return (
    <div className="text-[#dcddde] text-[13px] leading-relaxed space-y-2.5 font-sans select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Headings (#, ##, ###)
        if (trimmed.startsWith('# ')) {
          const headingText = trimmed.replace(/^#\s+/, '');
          const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <h1 key={idx} id={id} className="text-xl sm:text-2xl font-bold text-[#f5f5f5] pt-4 pb-2 border-b border-[#2d2d2d]">
              {renderTextWithWikilinks(headingText)}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^##\s+/, '');
          const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <h2 key={idx} id={id} className="text-lg font-bold text-[#e5e5e5] pt-3 pb-1 border-b border-[#262626]">
              {renderTextWithWikilinks(headingText)}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <h3 key={idx} id={id} className="text-sm font-semibold text-[#d4d4d4] pt-2">
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
              className="flex items-start gap-2 py-0.5 px-1 rounded hover:bg-[#252525] cursor-pointer transition"
            >
              <button
                type="button"
                className="mt-0.5 text-gray-400 hover:text-gray-200 transition shrink-0"
              >
                {isChecked ? (
                  <CheckSquare size={14} className="text-[#a78bfa]" />
                ) : (
                  <Square size={14} className="text-gray-500" />
                )}
              </button>
              <span className={`text-[13px] leading-snug ${isChecked ? 'line-through text-gray-500' : 'text-[#dcddde]'}`}>
                {renderTextWithWikilinks(taskText)}
              </span>
            </div>
          );
        }

        // 3. Obsidian Callouts (> [!NOTE], > [!TIP], etc.)
        if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!INFO]')) {
          return (
            <div key={idx} className="my-2 p-3 bg-[#705dcf]/10 border-l-[3px] border-[#705dcf] rounded-r text-xs text-[#d8d3f7] flex items-start gap-2">
              <Info size={14} className="shrink-0 text-[#a78bfa] mt-0.5" />
              <div>{renderTextWithWikilinks(trimmed.replace(/^>\s*\[!(NOTE|INFO)\]\s*/, ''))}</div>
            </div>
          );
        }
        if (trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!IDEA]')) {
          return (
            <div key={idx} className="my-2 p-3 bg-[#10b981]/10 border-l-[3px] border-[#10b981] rounded-r text-xs text-[#a7f3d0] flex items-start gap-2">
              <Lightbulb size={14} className="shrink-0 text-[#10b981] mt-0.5" />
              <div>{renderTextWithWikilinks(trimmed.replace(/^>\s*\[!(TIP|IDEA)\]\s*/, ''))}</div>
            </div>
          );
        }
        if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!CAUTION]')) {
          return (
            <div key={idx} className="my-2 p-3 bg-[#f59e0b]/10 border-l-[3px] border-[#f59e0b] rounded-r text-xs text-[#fde68a] flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 text-[#f59e0b] mt-0.5" />
              <div>{renderTextWithWikilinks(trimmed.replace(/^>\s*\[!(WARNING|CAUTION)\]\s*/, ''))}</div>
            </div>
          );
        }

        // 4. Horizontal Rule (---)
        if (trimmed === '---') {
          return <hr key={idx} className="border-[#2d2d2d] my-3" />;
        }

        // 5. Unordered List Items (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <li key={idx} className="list-disc ml-5 text-[13px] text-[#cccccc] py-0.5">
              {renderTextWithWikilinks(trimmed.replace(/^[-*]\s+/, ''))}
            </li>
          );
        }

        // 6. Numbered List Items (1., 2., etc.)
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={idx} className="ml-5 text-[13px] text-[#cccccc] py-0.5 flex gap-1.5">
              <span className="text-gray-400 font-mono text-xs">{trimmed.match(/^\d+\./)?.[0]}</span>
              <span>{renderTextWithWikilinks(trimmed.replace(/^\d+\.\s*/, ''))}</span>
            </div>
          );
        }

        // 7. Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // 8. Regular paragraph with wikilink parser
        return (
          <p key={idx} className="text-[13px] leading-relaxed text-[#dcddde]">
            {renderTextWithWikilinks(line)}
          </p>
        );
      })}
    </div>
  );
}
