'use client';

import React, { useState } from 'react';
import { Tag, User, Calendar, ShieldCheck, Plus, X, Layers } from 'lucide-react';
import { WikiNote } from './types';

interface PropertiesPanelProps {
  note: WikiNote;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function PropertiesPanel({
  note,
  onAddTag,
  onRemoveTag
}: PropertiesPanelProps) {
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().replace(/^#/, '');
    if (clean && !note.tags.includes(clean)) {
      onAddTag(clean);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  return (
    <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
          <Layers size={12} className="text-temple-gold" /> Propiedades de Obsidian (Frontmatter)
        </span>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          Sincronizado
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        {/* Author / Vault Owner */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
          <User size={13} className="text-temple-gold shrink-0" />
          <div className="truncate">
            <span className="text-[9px] text-gray-500 block uppercase font-bold">Autor / Responsable</span>
            <span className="text-xs font-bold text-white">Paulo (TempleFit)</span>
          </div>
        </div>

        {/* Updated Date */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
          <Calendar size={13} className="text-sky-400 shrink-0" />
          <div className="truncate">
            <span className="text-[9px] text-gray-500 block uppercase font-bold">Última Revisión</span>
            <span className="text-xs font-mono text-gray-200">{note.updatedAt || '05/10/2026'}</span>
          </div>
        </div>

        {/* Vault Status */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
          <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="text-[9px] text-gray-500 block uppercase font-bold">Estado</span>
            <span className="text-xs font-bold text-emerald-300">SOP Operativo Activo</span>
          </div>
        </div>

        {/* File ID */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-xs font-mono text-amber-400 font-bold">ID</span>
          <div className="truncate">
            <span className="text-[9px] text-gray-500 block uppercase font-bold">Identificador</span>
            <span className="text-[11px] font-mono text-gray-300 truncate block">{note.id}</span>
          </div>
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
          <Tag size={11} className="text-temple-gold" /> Etiquetas:
        </span>
        {note.tags.map(tag => (
          <span
            key={tag}
            className="text-[10px] font-mono text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-lg flex items-center gap-1 group"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="text-gray-400 hover:text-red-400 opacity-60 group-hover:opacity-100 transition"
              title={`Eliminar #${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {isAddingTag ? (
          <form onSubmit={handleAddTagSubmit} className="inline-flex items-center gap-1">
            <input
              type="text"
              value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              placeholder="etiqueta..."
              autoFocus
              className="bg-black/60 border border-temple-gold/50 rounded-lg px-2 py-0.5 text-xs text-white placeholder-gray-500 focus:outline-none w-24 font-mono"
            />
            <button
              type="submit"
              className="p-1 bg-temple-gold text-black rounded-lg text-xs font-bold"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => setIsAddingTag(false)}
              className="p-1 text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingTag(true)}
            className="text-[10px] text-gray-400 hover:text-temple-gold border border-white/10 hover:border-temple-gold/40 px-2 py-0.5 rounded-lg flex items-center gap-1 transition"
          >
            <Plus size={10} /> <span>Añadir</span>
          </button>
        )}
      </div>
    </div>
  );
}
