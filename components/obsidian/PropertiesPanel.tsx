'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Tag, Plus, X, User, Calendar, ShieldCheck } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(true);
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
    <div className="mb-4 text-xs font-sans border-b border-[#2d2d2d] pb-3">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition py-1 text-[11px] font-medium tracking-wide"
      >
        {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <span>Properties</span>
        <span className="text-[10px] text-gray-500 font-mono">({note.tags.length + 3})</span>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1.5 pl-3 border-l border-[#2d2d2d]/60">
          {/* Tags Property */}
          <div className="flex items-center gap-4 py-0.5">
            <span className="w-20 text-[11px] text-gray-500 flex items-center gap-1.5 shrink-0">
              <Tag size={11} className="text-gray-400" />
              <span>tags</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {note.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-[#262626] hover:bg-[#303030] text-[#a78bfa] text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 transition"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="text-gray-400 hover:text-red-400 transition"
                    title={`Quitar #${tag}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}

              {isAddingTag ? (
                <form onSubmit={handleAddTagSubmit} className="inline-flex items-center">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    placeholder="etiqueta..."
                    autoFocus
                    onBlur={() => {
                      if (!newTagInput.trim()) setIsAddingTag(false);
                    }}
                    className="bg-[#262626] border border-[#a78bfa]/60 text-gray-200 text-[11px] px-2 py-0.5 rounded-full outline-none w-24"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="text-gray-400 hover:text-gray-200 hover:bg-[#262626] p-0.5 rounded transition"
                  title="Añadir etiqueta"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Author Property */}
          <div className="flex items-center gap-4 py-0.5">
            <span className="w-20 text-[11px] text-gray-500 flex items-center gap-1.5 shrink-0">
              <User size={11} className="text-gray-400" />
              <span>author</span>
            </span>
            <span className="text-[12px] text-gray-300 font-medium">Paulo</span>
          </div>

          {/* Status Property */}
          <div className="flex items-center gap-4 py-0.5">
            <span className="w-20 text-[11px] text-gray-500 flex items-center gap-1.5 shrink-0">
              <ShieldCheck size={11} className="text-gray-400" />
              <span>status</span>
            </span>
            <span className="text-[11px] text-[#34d399] bg-[#34d399]/10 px-2 py-0.5 rounded font-mono">activo</span>
          </div>

          {/* Updated Date Property */}
          <div className="flex items-center gap-4 py-0.5">
            <span className="w-20 text-[11px] text-gray-500 flex items-center gap-1.5 shrink-0">
              <Calendar size={11} className="text-gray-400" />
              <span>updated</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono">{note.updatedAt || '2026-10-05'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
