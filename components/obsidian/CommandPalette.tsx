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
  onToggleEditMode?: () => void;
  onExportCurrentNote?: () => void;
  onExportVaultBackup?: () => void;
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
      title: 'Open graph view',
      subtitle: 'Show all notes and relationships',
      icon: <Network size={14} className="text-[#a78bfa]" />,
      execute: onOpenGlobalGraph
    },
    {
      id: 'cmd-local-graph',
      title: 'Open local graph',
      subtitle: 'Show neighborhood of active note',
      icon: <Compass size={14} className="text-[#38bdf8]" />,
      execute: onOpenLocalGraph
    },
    {
      id: 'cmd-new-note',
      title: 'Create new note',
      subtitle: 'Add a new markdown note to the vault',
      icon: <Plus size={14} className="text-[#34d399]" />,
      execute: onCreateNewNote
    }
  ];

  if (onToggleEditMode) {
    baseCommands.push({
      id: 'cmd-toggle-edit',
      title: 'Toggle reading / editing view',
      subtitle: 'Switch between rendered markdown and source',
      icon: <Edit3 size={14} className="text-[#f59e0b]" />,
      execute: onToggleEditMode
    });
  }

  if (onExportCurrentNote) {
    baseCommands.push({
      id: 'cmd-export-note',
      title: 'Export current note to Markdown (.md)',
      subtitle: 'Download note with YAML frontmatter',
      icon: <Download size={14} className="text-gray-400" />,
      execute: onExportCurrentNote
    });
  }

  if (onExportVaultBackup) {
    baseCommands.push({
      id: 'cmd-backup-vault',
      title: 'Export vault backup (JSON)',
      subtitle: 'Full backup of all notes and metadata',
      icon: <Layers size={14} className="text-gray-400" />,
      execute: onExportVaultBackup
    });
  }

  // Note Navigation Items
  const noteItems: PaletteAction[] = notes.map(n => ({
    id: `note-${n.id}`,
    title: n.title,
    subtitle: `Note • #${n.tags.slice(0, 3).join(' #')}`,
    icon: <FileText size={14} className="text-gray-400" />,
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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredActions.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
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
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#1e1e1e] border border-[#333333] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[65vh] font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#2d2d2d] bg-[#181818]">
          <Search size={14} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or note name..."
            className="w-full bg-transparent text-[13px] text-[#dcddde] placeholder-gray-500 outline-none font-sans"
          />
          <kbd className="text-[10px] font-mono text-gray-500 bg-[#252525] px-1.5 py-0.5 rounded border border-[#333333]">
            esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-1 space-y-0.5">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              No matching files or commands found for "{query}".
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
                  className={`w-full text-left px-2.5 py-2 rounded text-xs flex items-center justify-between transition ${
                    isSelected ? 'bg-[#2a2a2a] text-white border-l-2 border-[#705dcf]' : 'text-gray-300 hover:bg-[#222222]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="shrink-0">
                      {action.icon}
                    </div>
                    <div className="truncate">
                      <p className={`text-[12px] font-medium truncate ${isSelected ? 'text-white' : 'text-[#d0d0d0]'}`}>
                        {action.title}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate font-mono">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight size={12} className="text-gray-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 bg-[#141414] border-t border-[#262626] flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ navigate</span>
            <span>•</span>
            <span>↵ select</span>
            <span>•</span>
            <span>esc close</span>
          </div>
          <span>TempleFit Vault</span>
        </div>
      </div>
    </div>
  );
}
