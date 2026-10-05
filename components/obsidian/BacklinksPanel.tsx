'use client';

import React, { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, Link2, ExternalLink, Hash, FileText } from 'lucide-react';
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
  // 1. Linked Mentions (Notes referencing this note via [[Title]] or [[ID]])
  const linkedMentions = useMemo(() => {
    const activeTitle = activeNote.title.toLowerCase();
    const activeId = activeNote.id.toLowerCase();
    const activeWithoutEmoji = activeNote.title.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim().toLowerCase();

    return allNotes.filter(n => {
      if (n.id === activeNote.id) return false;
      const contentLower = n.content.toLowerCase();
      // Check for [[activeTitle]] or [[activeId]] or [[activeWithoutEmoji]]
      const matchesWikilink = 
        contentLower.includes(`[[${activeTitle}`) ||
        contentLower.includes(`[[${activeId}`) ||
        (activeWithoutEmoji && contentLower.includes(`[[${activeWithoutEmoji}`));
      return matchesWikilink;
    });
  }, [activeNote, allNotes]);

  // 2. Outgoing Links (Notes referenced by this note)
  const outgoingLinks = useMemo(() => {
    const links: WikiNote[] = [];
    const matches = activeNote.content.matchAll(/\[\[(.*?)\]\]/g);

    for (const m of matches) {
      const targetQuery = m[1].split('|')[0].trim().toLowerCase();
      const targetNote = allNotes.find(
        other => other.id.toLowerCase() === targetQuery || other.title.toLowerCase().includes(targetQuery)
      );
      if (targetNote && targetNote.id !== activeNote.id && !links.some(l => l.id === targetNote.id)) {
        links.push(targetNote);
      }
    }
    return links;
  }, [activeNote, allNotes]);

  // 3. Thematic Related Notes (Shared specialized tags)
  const relatedNotes = useMemo(() => {
    const GENERIC = new Set(['sops', 'control', 'orden', 'organizacion', 'checklist']);
    const activeTags = activeNote.tags.filter(t => !GENERIC.has(t.toLowerCase()));

    return allNotes.filter(n => {
      if (n.id === activeNote.id) return false;
      const sharesTag = n.tags.some(t => activeTags.includes(t.toLowerCase()));
      const isAlreadyLinked = linkedMentions.some(l => l.id === n.id) || outgoingLinks.some(o => o.id === n.id);
      return sharesTag && !isAlreadyLinked;
    });
  }, [activeNote, allNotes, linkedMentions, outgoingLinks]);

  return (
    <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-temple-gold flex items-center gap-1.5">
          <Link2 size={14} /> Conexiones de Obsidian
        </h4>
        <span className="text-[10px] text-gray-400 font-mono">
          {linkedMentions.length} entrantes • {outgoingLinks.length} salientes
        </span>
      </div>

      {/* Linked Mentions (Backlinks) */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 flex items-center gap-1">
          <ArrowDownLeft size={12} /> Menciones Enlazadas ({linkedMentions.length})
        </span>

        {linkedMentions.length === 0 ? (
          <p className="text-[11px] text-gray-500 italic pl-3">
            Ninguna otra nota enlaza directamente a esta nota con [[Wikilinks]].
          </p>
        ) : (
          <div className="space-y-1.5">
            {linkedMentions.map(note => (
              <button
                key={note.id}
                onClick={() => onNavigate(note.id)}
                className="w-full text-left p-2 rounded-xl bg-black/40 hover:bg-temple-gold/15 border border-white/5 hover:border-temple-gold/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText size={13} className="text-temple-gold shrink-0" />
                  <span className="text-xs font-bold text-gray-200 group-hover:text-white truncate">
                    {note.title}
                  </span>
                </div>
                <ExternalLink size={12} className="text-gray-500 group-hover:text-temple-gold shrink-0 opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Links */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300 flex items-center gap-1">
          <ArrowUpRight size={12} /> Enlaces Salientes ({outgoingLinks.length})
        </span>

        {outgoingLinks.length === 0 ? (
          <p className="text-[11px] text-gray-500 italic pl-3">
            Esta nota no tiene enlaces salientes a otras notas. Escribe [[NombreNota]] para conectar.
          </p>
        ) : (
          <div className="space-y-1.5">
            {outgoingLinks.map(note => (
              <button
                key={note.id}
                onClick={() => onNavigate(note.id)}
                className="w-full text-left p-2 rounded-xl bg-black/40 hover:bg-sky-500/15 border border-white/5 hover:border-sky-400/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText size={13} className="text-sky-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-200 group-hover:text-white truncate">
                    {note.title}
                  </span>
                </div>
                <ExternalLink size={12} className="text-gray-500 group-hover:text-sky-400 shrink-0 opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thematic Neighbors */}
      {relatedNotes.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 flex items-center gap-1">
            <Hash size={12} /> Notas Temáticamente Afines ({relatedNotes.length})
          </span>
          <div className="space-y-1.5">
            {relatedNotes.map(note => (
              <button
                key={note.id}
                onClick={() => onNavigate(note.id)}
                className="w-full text-left p-2 rounded-xl bg-black/30 hover:bg-purple-500/15 border border-white/5 hover:border-purple-400/30 transition flex items-center justify-between group"
              >
                <span className="text-xs font-medium text-gray-400 group-hover:text-purple-200 truncate">
                  {note.title}
                </span>
                <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1 rounded">
                  #{note.tags[0] || 'rel'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
