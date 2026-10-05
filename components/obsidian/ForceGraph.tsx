'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  RotateCcw, ZoomIn, ZoomOut, Settings2, Sliders, Eye, EyeOff, 
  ChevronDown, ChevronRight, X, Maximize2
} from 'lucide-react';
import { WikiNote, GraphNode, GraphLink, ForceSettings, OBSIDIAN_COLOR_GROUPS, getNoteColorGroup } from './types';

interface ForceGraphProps {
  notes: WikiNote[];
  activeNoteId: string;
  onSelectNote: (id: string) => void;
  onOpenEditor?: () => void;
  mode?: 'global' | 'local';
  onToggleMode?: (mode: 'global' | 'local') => void;
  getNodeEmoji?: (title: string) => string;
  getNodeDisplayTitle?: (title: string) => string;
  height?: string | number;
}

const DEFAULT_SETTINGS: ForceSettings = {
  repelStrength: 320,
  linkDistance: 130,
  centerStrength: 0.02,
  showLabels: true,
  showOrphans: true,
  showArrows: false,
  depth: 1
};

export default function ForceGraph({
  notes,
  activeNoteId,
  onSelectNote,
  onOpenEditor,
  mode = 'global',
  onToggleMode,
  height = '100%'
}: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<ForceSettings>(DEFAULT_SETTINGS);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<'filters' | 'forces' | 'display'>('forces');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  // Hover & Drag state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragInfoRef = useRef<{ startX: number; startY: number; hasMoved: boolean } | null>(null);

  // Simulation state
  const [simNodes, setSimNodes] = useState<GraphNode[]>([]);
  const simNodesRef = useRef<GraphNode[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const alphaRef = useRef<number>(1);

  // 1. Build Base Links from Wikilinks and tags
  const allLinks = useMemo<GraphLink[]>(() => {
    const linkSet = new Set<string>();
    const links: GraphLink[] = [];

    const addLink = (src: string, tgt: string) => {
      if (!src || !tgt || src === tgt) return;
      const key = src < tgt ? `${src}---${tgt}` : `${tgt}---${src}`;
      if (!linkSet.has(key)) {
        linkSet.add(key);
        links.push({ source: src, target: tgt });
      }
    };

    const noteMap = new Map<string, WikiNote>();
    notes.forEach(n => noteMap.set(n.id, n));

    // A. Structural relationships
    const STRUCTURAL: [string, string][] = [
      ['note-manual-orden', 'note-sops-1'],
      ['note-manual-orden', 'note-sops-3'],
      ['note-manual-orden', 'note-sops-5'],
      ['note-manual-orden', 'note-sops-6'],
      ['note-sops-1', 'note-sops-2'],
      ['note-sops-1', 'note-sops-6'],
      ['note-sops-2', 'note-sops-3'],
      ['note-sops-2', 'note-sops-4'],
      ['note-sops-3', 'note-sops-4'],
      ['note-sops-4', 'note-sops-5'],
      ['note-sops-5', 'note-sops-6'],
      ['note-sops-7', 'note-sops-1'],
      ['note-sops-7', 'note-sops-5']
    ];
    STRUCTURAL.forEach(([s, t]) => {
      if (noteMap.has(s) && noteMap.has(t)) addLink(s, t);
    });

    // B. Explicit Markdown Wikilinks [[Title]] or [[ID]]
    notes.forEach(note => {
      const matches = note.content.matchAll(/\[\[(.*?)\]\]/g);
      for (const m of matches) {
        const query = m[1].split('|')[0].trim().toLowerCase();
        const cleanQuery = query.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim();
        const withoutNum = cleanQuery.replace(/^\d+\.\s*/, '').trim();

        const target = notes.find(other => {
          const oTitle = other.title.toLowerCase();
          const oId = other.id.toLowerCase();
          return (
            oId === query ||
            oTitle.includes(query) ||
            (cleanQuery && oTitle.includes(cleanQuery)) ||
            (withoutNum && oTitle.includes(withoutNum))
          );
        });

        if (target && target.id !== note.id) {
          addLink(note.id, target.id);
        }
      }
    });

    // C. Thematic domain tags (excluding generic tags)
    const GENERIC = new Set(['sops', 'control', 'orden', 'organizacion', 'checklist']);
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const noteA = notes[i];
        const noteB = notes[j];
        const hasSpecificTag = noteA.tags.some(
          t => !GENERIC.has(t.toLowerCase()) && noteB.tags.includes(t)
        );
        if (hasSpecificTag) {
          addLink(noteA.id, noteB.id);
        }
      }
    }

    return links;
  }, [notes]);

  // 2. Filter Nodes based on Global vs Local Mode, Search & Tags
  const { visibleNotes, visibleLinks } = useMemo(() => {
    let candidateNotes = notes;

    // Local Graph Filter: 1-hop or 2-hop neighborhood of activeNoteId
    if (mode === 'local' && activeNoteId) {
      const hop1 = new Set<string>([activeNoteId]);
      allLinks.forEach(l => {
        if (l.source === activeNoteId) hop1.add(l.target);
        if (l.target === activeNoteId) hop1.add(l.source);
      });

      if (settings.depth >= 2) {
        const hop2 = new Set<string>(hop1);
        allLinks.forEach(l => {
          if (hop1.has(l.source)) hop2.add(l.target);
          if (hop1.has(l.target)) hop2.add(l.source);
        });
        candidateNotes = notes.filter(n => hop2.has(n.id));
      } else {
        candidateNotes = notes.filter(n => hop1.has(n.id));
      }
    }

    // Search filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      candidateNotes = candidateNotes.filter(
        n => n.title.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (selectedTagFilter) {
      candidateNotes = candidateNotes.filter(n => n.tags.includes(selectedTagFilter));
    }

    // Filter links between visible notes
    const visibleIds = new Set(candidateNotes.map(n => n.id));
    let filteredLinks = allLinks.filter(l => visibleIds.has(l.source) && visibleIds.has(l.target));

    // Handle orphans toggle
    if (!settings.showOrphans) {
      const connectedIds = new Set<string>();
      filteredLinks.forEach(l => {
        connectedIds.add(l.source);
        connectedIds.add(l.target);
      });
      candidateNotes = candidateNotes.filter(n => connectedIds.has(n.id));
    }

    return { visibleNotes: candidateNotes, visibleLinks: filteredLinks };
  }, [notes, allLinks, mode, activeNoteId, settings.depth, searchFilter, selectedTagFilter, settings.showOrphans]);

  // Connection count per node
  const connectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    visibleNotes.forEach(n => counts.set(n.id, 0));
    visibleLinks.forEach(l => {
      counts.set(l.source, (counts.get(l.source) || 0) + 1);
      counts.set(l.target, (counts.get(l.target) || 0) + 1);
    });
    return counts;
  }, [visibleNotes, visibleLinks]);

  // 3. Initialize nodes on canvas
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const existingMap = new Map<string, GraphNode>();
    simNodesRef.current.forEach(n => existingMap.set(n.id, n));

    const newNodes: GraphNode[] = visibleNotes.map((n, idx) => {
      const existing = existingMap.get(n.id);
      const connections = connectionCounts.get(n.id) || 0;
      const group = getNoteColorGroup(n.tags);

      // Clean Obsidian Node radius: 4px base + connections scaling
      const radius = Math.min(10, Math.max(4, 4 + connections * 0.8));

      if (existing) {
        return {
          ...existing,
          title: n.title,
          tags: n.tags,
          connections,
          radius,
          groupColor: group.color,
          groupName: group.name
        };
      }

      // Arrange around center
      const angle = (idx / Math.max(1, visibleNotes.length)) * 2 * Math.PI;
      const dist = 80 + (idx % 3) * 50;

      return {
        id: n.id,
        title: n.title,
        tags: n.tags,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius,
        connections,
        groupColor: group.color,
        groupName: group.name
      };
    });

    simNodesRef.current = newNodes;
    setSimNodes(newNodes);
    alphaRef.current = 1.0;
  }, [visibleNotes, connectionCounts]);

  // 4. Physics Simulation Loop (Velocity Verlet)
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const runPhysicsTick = () => {
      const currentNodes = simNodesRef.current;
      const n = currentNodes.length;
      if (n === 0) return;

      const alpha = alphaRef.current;
      if (alpha < 0.002) {
        animFrameRef.current = requestAnimationFrame(runPhysicsTick);
        return;
      }

      // Repulsion force (N-body)
      const k = settings.repelStrength;
      for (let i = 0; i < n; i++) {
        const nodeA = currentNodes[i];
        for (let j = i + 1; j < n; j++) {
          const nodeB = currentNodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          // Coulomb repulsion
          const force = (k * alpha) / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (nodeA.fx === undefined || nodeA.fx === null) {
            nodeA.vx -= fx;
            nodeA.vy -= fy;
          }
          if (nodeB.fx === undefined || nodeB.fx === null) {
            nodeB.vx += fx;
            nodeB.vy += fy;
          }
        }
      }

      // Link attraction forces
      const nodeIndex = new Map<string, GraphNode>();
      currentNodes.forEach(node => nodeIndex.set(node.id, node));

      const targetDist = settings.linkDistance;
      const linkStrength = 0.06 * alpha;

      visibleLinks.forEach(link => {
        const src = nodeIndex.get(link.source);
        const tgt = nodeIndex.get(link.target);
        if (!src || !tgt) return;

        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - targetDist;

        const fx = (dx / dist) * displacement * linkStrength;
        const fy = (dy / dist) * displacement * linkStrength;

        if (src.fx === undefined || src.fx === null) {
          src.vx += fx;
          src.vy += fy;
        }
        if (tgt.fx === undefined || tgt.fx === null) {
          tgt.vx -= fx;
          tgt.vy -= fy;
        }
      });

      // Center gravity & Collision padding
      const centerForce = settings.centerStrength * alpha;
      const minPadding = 30;

      for (let i = 0; i < n; i++) {
        const node = currentNodes[i];

        // Center gravity
        if (node.fx != null && node.fy != null) {
          node.x = node.fx;
          node.y = node.fy;
          node.vx = 0;
          node.vy = 0;
        } else {
          node.vx += (centerX - node.x) * centerForce;
          node.vy += (centerY - node.y) * centerForce;

          // Velocity decay (friction)
          node.vx *= 0.65;
          node.vy *= 0.65;

          node.x += node.vx;
          node.y += node.vy;
        }

        // Collision avoidance
        for (let j = i + 1; j < n; j++) {
          const other = currentNodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minSep = node.radius + other.radius + minPadding;

          if (dist < minSep) {
            const overlap = (minSep - dist) * 0.45;
            const ox = (dx / dist) * overlap;
            const oy = (dy / dist) * overlap;

            if (node.fx === undefined || node.fx === null) {
              node.x -= ox;
              node.y -= oy;
            }
            if (other.fx === undefined || other.fx === null) {
              other.x += ox;
              other.y += oy;
            }
          }
        }
      }

      alphaRef.current *= 0.985;
      setSimNodes([...currentNodes]);
      animFrameRef.current = requestAnimationFrame(runPhysicsTick);
    };

    animFrameRef.current = requestAnimationFrame(runPhysicsTick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [visibleLinks, settings]);

  // Restart physics on demand
  const handleResetLayout = () => {
    alphaRef.current = 1.0;
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node Drag handlers
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDraggingNodeId(nodeId);
    dragInfoRef.current = { startX: e.clientX, startY: e.clientY, hasMoved: false };

    const node = simNodesRef.current.find(n => n.id === nodeId);
    if (node) {
      node.fx = node.x;
      node.fy = node.y;
      alphaRef.current = 0.5; // Re-heat simulation gently
    }
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      const dx = (e.clientX - (dragInfoRef.current?.startX || e.clientX)) / zoom;
      const dy = (e.clientY - (dragInfoRef.current?.startY || e.clientY)) / zoom;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        if (dragInfoRef.current) dragInfoRef.current.hasMoved = true;
      }

      const node = simNodesRef.current.find(n => n.id === draggingNodeId);
      if (node && node.fx !== undefined && node.fx !== null && node.fy !== undefined && node.fy !== null) {
        node.fx = node.fx + dx;
        node.fy = node.fy + dy;
        alphaRef.current = Math.max(alphaRef.current, 0.3);
      }

      if (dragInfoRef.current) {
        dragInfoRef.current.startX = e.clientX;
        dragInfoRef.current.startY = e.clientY;
      }
    } else if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.startPanX + dx,
        y: panStartRef.current.startPanY + dy
      });
    }
  };

  const handleContainerPointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      const hasMoved = dragInfoRef.current?.hasMoved;
      const node = simNodesRef.current.find(n => n.id === draggingNodeId);
      if (node) {
        node.fx = null;
        node.fy = null;
      }

      // If it was just a click (not a drag), select the note and open it!
      if (!hasMoved) {
        onSelectNote(draggingNodeId);
        onOpenEditor?.();
      }

      setDraggingNodeId(null);
      dragInfoRef.current = null;
    }

    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  };

  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y
      };
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(3, Math.max(0.3, prev * zoomFactor)));
  };

  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>();
    simNodes.forEach(n => m.set(n.id, n));
    return m;
  }, [simNodes]);

  const focusedNodeId = hoveredNodeId || activeNoteId;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerLeave={handleContainerPointerUp}
      style={{ height }}
      className="relative w-full bg-[#161616] overflow-hidden select-none cursor-grab active:cursor-grabbing font-sans"
    >
      {/* Subtle Dot Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* SVG Canvas for Links, Nodes and Text */}
      <svg 
        className="w-full h-full absolute inset-0 overflow-visible"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Links Layer */}
        <g className="links">
          {visibleLinks.map(link => {
            const src = nodeMap.get(link.source);
            const tgt = nodeMap.get(link.target);
            if (!src || !tgt) return null;

            const isConnectedToFocus = 
              focusedNodeId && (src.id === focusedNodeId || tgt.id === focusedNodeId);

            const isDimmed = focusedNodeId && !isConnectedToFocus;

            return (
              <line
                key={`link-${link.source}-${link.target}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={isConnectedToFocus ? '#a78bfa' : '#383838'}
                strokeWidth={isConnectedToFocus ? 1.5 : 1}
                opacity={isDimmed ? 0.08 : isConnectedToFocus ? 0.9 : 0.45}
                className="transition-opacity duration-150"
              />
            );
          })}
        </g>

        {/* Nodes Layer */}
        <g className="nodes">
          {simNodes.map(node => {
            const isActive = node.id === activeNoteId;
            const isHovered = node.id === hoveredNodeId;
            const isConnectedToFocus = visibleLinks.some(
              l => (l.source === node.id && (l.target === focusedNodeId)) ||
                   (l.target === node.id && (l.source === focusedNodeId))
            );

            const isDimmed = focusedNodeId && !isActive && !isHovered && !isConnectedToFocus;
            const cleanTitle = node.title.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim();

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onPointerDown={e => handleNodePointerDown(e, node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer"
                opacity={isDimmed ? 0.15 : 1}
              >
                {/* Active Halo */}
                {isActive && (
                  <circle
                    r={node.radius + 4}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={isHovered ? node.radius + 2 : node.radius}
                  fill={isActive ? '#ffffff' : node.groupColor || '#705dcf'}
                  stroke={isActive ? '#a78bfa' : '#1e1e1e'}
                  strokeWidth={1.5}
                  className="transition-all duration-150"
                />

                {/* Clean SVG Label */}
                {(settings.showLabels || isHovered || isActive) && (
                  <text
                    x={0}
                    y={node.radius + 12}
                    textAnchor="middle"
                    fill={isActive ? '#ffffff' : isHovered ? '#f1f1f1' : '#888888'}
                    fontSize="10px"
                    fontWeight={isActive || isHovered ? '600' : '400'}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    className="pointer-events-none select-none transition-colors duration-150"
                  >
                    {cleanTitle}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Top Left: Graph Title & Mode Switcher */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
        {onToggleMode && (
          <div className="bg-[#202020]/90 border border-[#333333] rounded p-0.5 flex items-center shadow-lg backdrop-blur-sm text-xs">
            <button
              onClick={() => onToggleMode('global')}
              className={`px-2.5 py-1 rounded transition text-[11px] font-medium ${
                mode === 'global' ? 'bg-[#333333] text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => onToggleMode('local')}
              className={`px-2.5 py-1 rounded transition text-[11px] font-medium ${
                mode === 'local' ? 'bg-[#333333] text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Local
            </button>
          </div>
        )}

        {mode === 'local' && (
          <div className="bg-[#202020]/90 border border-[#333333] rounded px-2 py-1 text-[11px] text-gray-300 flex items-center gap-1 shadow-lg">
            <span className="text-gray-500">Depth:</span>
            <button
              onClick={() => setSettings(s => ({ ...s, depth: 1 }))}
              className={`px-1.5 py-0.5 rounded text-[10px] ${settings.depth === 1 ? 'bg-[#705dcf] text-white font-bold' : 'text-gray-400'}`}
            >
              1
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, depth: 2 }))}
              className={`px-1.5 py-0.5 rounded text-[10px] ${settings.depth === 2 ? 'bg-[#705dcf] text-white font-bold' : 'text-gray-400'}`}
            >
              2
            </button>
          </div>
        )}

        <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
          {visibleNotes.length} notes • {visibleLinks.length} links
        </span>
      </div>

      {/* Top Right: Obsidian Controls Gear & Drawer */}
      <div className="absolute top-3 right-3 z-30 flex flex-col items-end">
        <button
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className={`p-1.5 rounded border transition shadow-lg ${
            isControlsOpen ? 'bg-[#705dcf] border-[#705dcf] text-white' : 'bg-[#202020]/90 border-[#333333] text-gray-300 hover:text-white'
          }`}
          title="Graph settings"
        >
          <Sliders size={14} />
        </button>

        {isControlsOpen && (
          <div className="mt-2 w-64 bg-[#1e1e1e]/95 border border-[#333333] rounded-lg shadow-2xl p-3 text-xs space-y-3 backdrop-blur-md text-gray-300 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2 text-[11px] font-semibold text-gray-200 uppercase tracking-wider">
              <span>Graph settings</span>
              <button
                onClick={handleResetLayout}
                className="text-gray-400 hover:text-gray-200 transition"
                title="Reset simulation"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* Accordion 1: Filters */}
            <div className="space-y-1.5">
              <button
                onClick={() => setOpenSection(openSection === 'filters' ? 'forces' : 'filters')}
                className="w-full flex items-center justify-between text-gray-400 hover:text-gray-200 text-[11px] font-medium"
              >
                <span>Filters</span>
                {openSection === 'filters' ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {openSection === 'filters' && (
                <div className="space-y-2 pt-1 pl-1">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Search files..."
                    className="w-full bg-[#141414] border border-[#2d2d2d] rounded px-2 py-1 text-xs text-gray-200 outline-none focus:border-[#705dcf]"
                  />
                  <label className="flex items-center justify-between cursor-pointer text-[11px]">
                    <span>Orphans</span>
                    <input
                      type="checkbox"
                      checked={settings.showOrphans}
                      onChange={e => setSettings(s => ({ ...s, showOrphans: e.target.checked }))}
                      className="accent-[#705dcf]"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Accordion 2: Forces */}
            <div className="space-y-1.5 border-t border-[#2d2d2d] pt-2">
              <button
                onClick={() => setOpenSection(openSection === 'forces' ? 'display' : 'forces')}
                className="w-full flex items-center justify-between text-gray-400 hover:text-gray-200 text-[11px] font-medium"
              >
                <span>Forces</span>
                {openSection === 'forces' ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {openSection === 'forces' && (
                <div className="space-y-2.5 pt-1 pl-1">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Center strength</span>
                      <span className="font-mono">{Math.round(settings.centerStrength * 1000)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.005"
                      max="0.06"
                      step="0.005"
                      value={settings.centerStrength}
                      onChange={e => {
                        setSettings(s => ({ ...s, centerStrength: parseFloat(e.target.value) }));
                        alphaRef.current = 0.3;
                      }}
                      className="w-full accent-[#705dcf] h-1 bg-[#2d2d2d] rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Repel force</span>
                      <span className="font-mono">{settings.repelStrength}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="700"
                      step="20"
                      value={settings.repelStrength}
                      onChange={e => {
                        setSettings(s => ({ ...s, repelStrength: parseInt(e.target.value) }));
                        alphaRef.current = 0.3;
                      }}
                      className="w-full accent-[#705dcf] h-1 bg-[#2d2d2d] rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Link distance</span>
                      <span className="font-mono">{settings.linkDistance}</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="240"
                      step="10"
                      value={settings.linkDistance}
                      onChange={e => {
                        setSettings(s => ({ ...s, linkDistance: parseInt(e.target.value) }));
                        alphaRef.current = 0.3;
                      }}
                      className="w-full accent-[#705dcf] h-1 bg-[#2d2d2d] rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Display */}
            <div className="space-y-1.5 border-t border-[#2d2d2d] pt-2">
              <button
                onClick={() => setOpenSection(openSection === 'display' ? 'forces' : 'display')}
                className="w-full flex items-center justify-between text-gray-400 hover:text-gray-200 text-[11px] font-medium"
              >
                <span>Display</span>
                {openSection === 'display' ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {openSection === 'display' && (
                <div className="space-y-2 pt-1 pl-1">
                  <label className="flex items-center justify-between cursor-pointer text-[11px]">
                    <span>Show labels</span>
                    <input
                      type="checkbox"
                      checked={settings.showLabels}
                      onChange={e => setSettings(s => ({ ...s, showLabels: e.target.checked }))}
                      className="accent-[#705dcf]"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right: Zoom controls */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center bg-[#202020]/90 border border-[#333333] rounded p-0.5 shadow-lg backdrop-blur-sm">
        <button
          onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
          className="p-1.5 text-gray-400 hover:text-white transition"
          title="Zoom out"
        >
          <ZoomOut size={13} />
        </button>
        <span className="text-[10px] font-mono px-1.5 text-gray-400">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          className="p-1.5 text-gray-400 hover:text-white transition"
          title="Zoom in"
        >
          <ZoomIn size={13} />
        </button>
        <button
          onClick={handleResetLayout}
          className="p-1.5 text-gray-400 hover:text-white transition border-l border-[#2d2d2d] ml-1"
          title="Reset zoom & pan"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
