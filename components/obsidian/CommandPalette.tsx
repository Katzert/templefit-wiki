'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Network, Compass, Plus, Edit3, Download, Layers, ArrowRight } from 'lucide-react';
import { WikiNote } from './types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: WikiNote[];
  onSelectNote: (id: string) => void;
  onOpenGlobalGraph: () => void;
  onOpenLocalGraph: () => void;
  onCreateNewNote: () => void;
  onToggleEditMode: () => void;
  onExportCurrentNote: () => void;
  onExportVaultBackup: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  execute: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onOpenGlobalGraph,
  onOpenLocalGraph,
  onCreateNewNote,
  onToggleEditMode,
  onExportCurrentNote,
  onExportVaultBackup
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Base Obsidian Commands
  const baseCommands: PaletteAction[] = [
    {
      id: 'cmd-global-graph',
      title: 'Abrir Grafo Global',
      subtitle: 'Visualizar red completa de notas y relaciones',
      icon: <Network size={16} className="text-temple-gold" />,
      execute: onOpenGlobalGraph
    },
    {
      id: 'cmd-local-graph',
      title: 'Abrir Grafo Local',
      subtitle: 'Visualizar conexiones inmediatas de la nota activa',
      icon: <Compass size={16} className="text-sky-400" />,
      execute: onOpenLocalGraph
    },
    {
      id: 'cmd-new-note',
      title: 'Crear nueva nota en la Bóveda',
      subtitle: 'Añadir un nuevo documento Markdown',
      icon: <Plus size={16} className="text-emerald-400" />,
      execute: onCreateNewNote
    },
    {
      id: 'cmd-toggle-edit',
      title: 'Alternar Modo Lectura / Edición',
      subtitle: 'Cambiar entre Markdown puro y vista formateada',
      icon: <Edit3 size={16} className="text-amber-300" />,
      execute: onToggleEditMode
    },
    {
      id: 'cmd-export-note',
      title: 'Descargar nota actual como .md',
      subtitle: 'Exportar archivo Markdown con Frontmatter',
      icon: <Download size={16} className="text-purple-400" />,
      execute: onExportCurrentNote
    },
    {
      id: 'cmd-backup-vault',
      title: 'Exportar Bóveda de Paulo (JSON Backup)',
      subtitle: 'Copia de seguridad completa de todas las notas y configuraciones',
      icon: <Layers size={16} className="text-blue-400" />,
      execute: onExportVaultBackup
    }
  ];

  // Note Navigation Items
  const noteItems: PaletteAction[] = notes.map(n => ({
    id: `note-${n.id}`,
    title: n.title,
    subtitle: `Nota • Tags: #${n.tags.slice(0, 3).join(' #')}`,
    icon: <FileText size={16} className="text-gray-400" />,
    execute: () => onSelectNote(n.id)
  }));

  // Filter combined actions based on search query
  const filteredActions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...baseCommands, ...noteItems];
    }
    const all = [...baseCommands, ...noteItems];
    return all.filter(
      a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    );
  }, [query, baseCommands, noteItems]);

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(filteredActions.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % Math.max(filteredActions.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].execute();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-xl bg-[#0B0F19] border border-temple-gold/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/40">
          <Search size={18} className="text-temple-gold shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar nota o comando (Ctrl+P / Ctrl+O)..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 rounded">
            ESC para salir
          </kbd>
        </div>

        {/* Results list */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No se encontraron notas ni comandos para "{query}".
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    action.execute();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition ${
                    isSelected ? 'bg-temple-gold/20 border border-temple-gold/40 text-white' : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
                      {action.icon}
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-200' : 'text-white'}`}>
                        {action.title}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight size={14} className="text-temple-gold shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="p-2.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <span>↑↓ Navegar</span>
            <span>•</span>
            <span>↵ Abrir</span>
          </div>
          <span>Bóveda Paulo • TempleFit</span>
        </div>
      </div>
    </div>
  );
}
