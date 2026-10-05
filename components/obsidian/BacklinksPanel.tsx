'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Link2, ArrowUpRight, FileText } from 'lucide-react';
import { WikiNote } from './types';

interface BacklinksPanelProps {
  activeNote: WikiNote;
  allNotes: WikiNote[];
  onNavigate: (noteId: string) => void;
}

export default function BacklinksPanel({
  activeNote,
  allNotes,
  onNavigate
}: BacklinksPanelProps) {
  const [showLinked, setShowLinked] = useState(true);
  const [showOutgoing, setShowOutgoing] = useState(true);

  // 1. Linked Mentions (Notes referencing this note via [[Title]] or [[ID]])
  const linkedMentions = useMemo(() => {
    const activeTitle = activeNote.title.toLowerCase();
    const activeId = activeNote.id.toLowerCase();
    const activeClean = activeNote.title.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim().toLowerCase();
    const activeWithoutNum = activeClean.replace(/^\d+\.\s*/, '').trim().toLowerCase();

    const results: { note: WikiNote; snippet: string }[] = [];

    allNotes.forEach(n => {
      if (n.id === activeNote.id) return;
      const lines = n.content.split('\n');
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (
          lower.includes(`[[${activeTitle}`) ||
          lower.includes(`[[${activeId}`) ||
          (activeClean && lower.includes(`[[${activeClean}`)) ||
          (activeWithoutNum && lower.includes(`[[${activeWithoutNum}`))
        ) {
          results.push({
            note: n,
            snippet: line.trim()
          });
          break; // One match per note for clean listing
        }
      }
    });

    return results;
  }, [activeNote, allNotes]);

  // 2. Outgoing Links (Notes referenced by this note)
  const outgoingLinks = useMemo(() => {
    const links: WikiNote[] = [];
    const matches = activeNote.content.matchAll(/\[\[(.*?)\]\]/g);

    for (const m of matches) {
      const targetQuery = m[1].split('|')[0].trim().toLowerCase();
      const targetClean = targetQuery.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim();
      const targetWithoutNum = targetClean.replace(/^\d+\.\s*/, '').trim();

      const targetNote = allNotes.find(other => {
        const oTitle = other.title.toLowerCase();
        const oId = other.id.toLowerCase();
        return (
          oId === targetQuery ||
          oTitle.includes(targetQuery) ||
          (targetClean && oTitle.includes(targetClean)) ||
          (targetWithoutNum && oTitle.includes(targetWithoutNum))
        );
      });

      if (targetNote && targetNote.id !== activeNote.id && !links.some(l => l.id === targetNote.id)) {
        links.push(targetNote);
      }
    }
    return links;
  }, [activeNote, allNotes]);

  return (
    <div className="text-xs font-sans space-y-4">
      {/* 1. Linked Mentions Section */}
      <div>
        <button
          type="button"
          onClick={() => setShowLinked(!showLinked)}
          className="w-full flex items-center justify-between text-gray-400 hover:text-gray-200 py-1 text-[11px] font-semibold uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5">
            {showLinked ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <Link2 size={12} className="text-[#a78bfa]" />
            <span>Linked mentions</span>
          </span>
          <span className="text-[10px] font-mono text-gray-500">{linkedMentions.length}</span>
        </button>

        {showLinked && (
          <div className="mt-1 space-y-1.5 pl-2">
            {linkedMentions.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic py-1 pl-2">No linked mentions</p>
            ) : (
              linkedMentions.map(({ note, snippet }) => (
                <div
                  key={note.id}
                  onClick={() => onNavigate(note.id)}
                  className="p-2 rounded bg-[#202020] hover:bg-[#282828] border border-[#2d2d2d] cursor-pointer transition space-y-1 group"
                >
                  <div className="flex items-center gap-1.5 text-gray-200 group-hover:text-[#a78bfa] font-medium text-[12px] truncate">
                    <FileText size={12} className="text-gray-400 group-hover:text-[#a78bfa] shrink-0" />
                    <span className="truncate">{note.title}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate pl-4 font-mono">
                    {snippet}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 2. Outgoing Links Section */}
      <div>
        <button
          type="button"
          onClick={() => setShowOutgoing(!showOutgoing)}
          className="w-full flex items-center justify-between text-gray-400 hover:text-gray-200 py-1 text-[11px] font-semibold uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5">
            {showOutgoing ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <ArrowUpRight size={12} className="text-[#38bdf8]" />
            <span>Outgoing links</span>
          </span>
          <span className="text-[10px] font-mono text-gray-500">{outgoingLinks.length}</span>
        </button>

        {showOutgoing && (
          <div className="mt-1 space-y-1 pl-2">
            {outgoingLinks.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic py-1 pl-2">No outgoing links</p>
            ) : (
              outgoingLinks.map(note => (
                <div
                  key={note.id}
                  onClick={() => onNavigate(note.id)}
                  className="px-2 py-1.5 rounded hover:bg-[#252525] cursor-pointer transition flex items-center gap-2 group"
                >
                  <FileText size={12} className="text-gray-400 group-hover:text-[#38bdf8] shrink-0" />
                  <span className="text-[12px] text-gray-300 group-hover:text-white truncate">
                    {note.title}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
