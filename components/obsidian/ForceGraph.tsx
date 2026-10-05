'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Network, RotateCcw, ZoomIn, ZoomOut, Maximize2, Settings2, 
  Sliders, Eye, EyeOff, Compass, Filter, Share2, Layers
} from 'lucide-react';
import { WikiNote, GraphNode, GraphLink, ForceSettings, OBSIDIAN_COLOR_GROUPS, getNoteColorGroup } from './types';

interface ForceGraphProps {
  notes: WikiNote[];
  activeNoteId: string;
  onSelectNote: (id: string) => void;
  onOpenEditor: () => void;
  mode: 'global' | 'local';
  onToggleMode: (mode: 'global' | 'local') => void;
  getNodeEmoji: (title: string) => string;
  getNodeDisplayTitle: (title: string) => string;
}

const DEFAULT_SETTINGS: ForceSettings = {
  repelStrength: 380,
  linkDistance: 170,
  centerStrength: 0.025,
  showLabels: true,
  showOrphans: true,
  showArrows: true,
  depth: 1
};

export default function ForceGraph({
  notes,
  activeNoteId,
  onSelectNote,
  onOpenEditor,
  mode,
  onToggleMode,
  getNodeEmoji,
  getNodeDisplayTitle
}: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<ForceSettings>(DEFAULT_SETTINGS);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Pan & Zoom transform state for scalable navigation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  // Hover & Drag state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragInfoRef = useRef<{ startX: number; startY: number; hasMoved: boolean } | null>(null);

  // Physics simulation nodes & simulation loop ref
  const [simNodes, setSimNodes] = useState<GraphNode[]>([]);
  const simNodesRef = useRef<GraphNode[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const alphaRef = useRef<number>(1); // Simulation temperature

  // 1. Compute Base Links from Wikilinks, tags and core relationships
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

    // A. Structural TempleFit Architecture Links
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
        const query = m[1].trim().toLowerCase();
        const target = notes.find(
          other => other.id.toLowerCase() === query || other.title.toLowerCase().includes(query)
        );
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
        candidateNotes = candidateNotes.filter(n => hop2.has(n.id));
      } else {
        candidateNotes = candidateNotes.filter(n => hop1.has(n.id));
      }
    }

    // Search query filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      candidateNotes = candidateNotes.filter(
        n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (selectedTagFilter) {
      candidateNotes = candidateNotes.filter(n => n.tags.includes(selectedTagFilter));
    }

    // Filter links where both source and target are in candidate notes
    const validIds = new Set(candidateNotes.map(n => n.id));
    let links = allLinks.filter(l => validIds.has(l.source) && validIds.has(l.target));

    // Orphans filter
    if (!settings.showOrphans) {
      const linkedIds = new Set<string>();
      links.forEach(l => {
        linkedIds.add(l.source);
        linkedIds.add(l.target);
      });
      candidateNotes = candidateNotes.filter(n => linkedIds.has(n.id));
    }

    return { visibleNotes: candidateNotes, visibleLinks: links };
  }, [notes, allLinks, mode, activeNoteId, settings.depth, searchFilter, selectedTagFilter, settings.showOrphans]);

  // Degree count per visible node
  const degreeMap = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleNotes.forEach(n => { counts[n.id] = 0; });
    visibleLinks.forEach(l => {
      counts[l.source] = (counts[l.source] || 0) + 1;
      counts[l.target] = (counts[l.target] || 0) + 1;
    });
    return counts;
  }, [visibleNotes, visibleLinks]);

  // 3. Initialize or reconcile simulation nodes
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 900;
    const height = containerRef.current?.clientHeight || 560;
    const cx = width / 2;
    const cy = height / 2;

    const existingMap = new Map<string, GraphNode>();
    simNodesRef.current.forEach(n => existingMap.set(n.id, n));

    const total = visibleNotes.length;
    const nextNodes: GraphNode[] = visibleNotes.map((note, idx) => {
      const existing = existingMap.get(note.id);
      const degree = degreeMap[note.id] || 0;
      const group = getNoteColorGroup(note.tags);

      // Node radius scales smoothly with degree centrality
      const radius = 22 + Math.min(degree * 3, 14);

      if (existing) {
        return {
          ...existing,
          title: note.title,
          tags: note.tags,
          radius,
          connections: degree,
          groupColor: group.color,
          groupName: group.name
        };
      }

      // Initial placement in harmonic circle
      const angle = (idx / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
      const orbitR = Math.min(width, height) * 0.36;
      return {
        id: note.id,
        title: note.title,
        tags: note.tags,
        x: cx + Math.cos(angle) * orbitR + (Math.random() - 0.5) * 15,
        y: cy + Math.sin(angle) * orbitR + (Math.random() - 0.5) * 15,
        vx: 0,
        vy: 0,
        radius,
        connections: degree,
        groupColor: group.color,
        groupName: group.name,
        fx: null,
        fy: null
      };
    });

    simNodesRef.current = nextNodes;
    setSimNodes(nextNodes);
    alphaRef.current = 1.0; // Reheat simulation for smooth transition
  }, [visibleNotes, degreeMap]);

  // 4. Force Simulation Physics Loop (Velocity Verlet + D3 Force Mechanics)
  useEffect(() => {
    const tick = () => {
      const nodes = simNodesRef.current;
      const links = visibleLinks;
      const width = containerRef.current?.clientWidth || 900;
      const height = containerRef.current?.clientHeight || 560;
      const cx = width / 2;
      const cy = height / 2;

      const alpha = alphaRef.current;
      if (alpha > 0.005) {
        // A. Center Gravity Force
        const centerStrength = settings.centerStrength * alpha;
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.vx += (cx - n.x) * centerStrength;
          n.vy += (cy - n.y) * centerStrength;
        }

        // B. Many-Body Coulomb Repulsion Force (avoids node collisions)
        const repelBase = settings.repelStrength * 35 * alpha;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy || 1;
            const dist = Math.sqrt(distSq);

            // Minimum separation threshold
            const minDist = a.radius + b.radius + 35;
            let force = repelBase / (distSq + 100);

            if (dist < minDist) {
              force += (minDist - dist) * 0.35;
            }

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }

        // C. Link Springs (Hooke's Law attraction)
        const targetDist = settings.linkDistance;
        const linkStrength = 0.04 * alpha;
        const nodeMap = new Map<string, GraphNode>();
        nodes.forEach(n => nodeMap.set(n.id, n));

        for (let k = 0; k < links.length; k++) {
          const l = links[k];
          const src = nodeMap.get(l.source);
          const tgt = nodeMap.get(l.target);
          if (src && tgt) {
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.hypot(dx, dy) || 1;
            const delta = (dist - targetDist) * linkStrength;

            const fx = (dx / dist) * delta;
            const fy = (dy / dist) * delta;

            src.vx += fx;
            src.vy += fy;
            tgt.vx -= fx;
            tgt.vy -= fy;
          }
        }

        // D. Update Positions with Velocity Damping
        const damping = 0.82;
        const pad = 40;
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          if (n.fx !== null && n.fx !== undefined) {
            n.x = n.fx;
            n.y = n.fy!;
            n.vx = 0;
            n.vy = 0;
          } else {
            n.vx *= damping;
            n.vy *= damping;
            n.x += n.vx;
            n.y += n.vy;

            // Soft canvas bounding box
            if (n.x < pad) { n.x = pad; n.vx = -n.vx * 0.5; }
            if (n.x > width - pad) { n.x = width - pad; n.vx = -n.vx * 0.5; }
            if (n.y < pad) { n.y = pad; n.vy = -n.vy * 0.5; }
            if (n.y > height - pad) { n.y = height - pad; n.vy = -n.vy * 0.5; }
          }
        }

        // Slowly decay temperature
        alphaRef.current *= 0.985;
        setSimNodes([...nodes]);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [visibleLinks, settings]);

  // 5. Wake up simulation helper
  const reheat = useCallback(() => {
    alphaRef.current = 0.85;
  }, []);

  // 6. Reset Graph Positions
  const handleResetLayout = () => {
    const width = containerRef.current?.clientWidth || 900;
    const height = containerRef.current?.clientHeight || 560;
    const cx = width / 2;
    const cy = height / 2;
    const total = simNodesRef.current.length;
    const orbitR = Math.min(width, height) * 0.32;

    simNodesRef.current.forEach((n, idx) => {
      const angle = (idx / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
      n.x = cx + Math.cos(angle) * orbitR;
      n.y = cy + Math.sin(angle) * orbitR;
      n.vx = 0;
      n.vy = 0;
      n.fx = null;
      n.fy = null;
    });

    setPan({ x: 0, y: 0 });
    setZoom(1);
    reheat();
  };

  // 7. Node Drag & Pointer Capture Handlers
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Convert client coords considering pan and zoom
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;

    const targetNode = simNodesRef.current.find(n => n.id === nodeId);
    if (targetNode) {
      targetNode.fx = rawX;
      targetNode.fy = rawY;
    }

    dragInfoRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false
    };
    setDraggingNodeId(nodeId);
    reheat();
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Node Dragging
    if (draggingNodeId && dragInfoRef.current) {
      const dxPx = e.clientX - dragInfoRef.current.startX;
      const dyPx = e.clientY - dragInfoRef.current.startY;
      if (Math.hypot(dxPx, dyPx) > 4) {
        dragInfoRef.current.hasMoved = true;
      }

      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;

      const target = simNodesRef.current.find(n => n.id === draggingNodeId);
      if (target) {
        target.fx = worldX;
        target.fy = worldY;
        reheat();
      }
      return;
    }

    // Canvas Background Panning (Right Click or Middle Click or Drag Background)
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.startPanX + dx,
        y: panStartRef.current.startPanY + dy
      });
    }
  };

  const handleContainerPointerUp = () => {
    if (draggingNodeId && dragInfoRef.current) {
      const target = simNodesRef.current.find(n => n.id === draggingNodeId);
      if (target) {
        // Release pin so node participates in relaxed physics
        target.fx = null;
        target.fy = null;
      }

      if (!dragInfoRef.current.hasMoved) {
        onSelectNote(draggingNodeId);
      }
      reheat();
    }

    setDraggingNodeId(null);
    dragInfoRef.current = null;
    setIsPanning(false);
    panStartRef.current = null;
  };

  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.button === 0 || e.button === 1) { // Left or middle click on background
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y
      };
    }
  };

  // Node position map for instant link coordinate calculation
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    simNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [simNodes]);

  // Unique tags for filter pill list
  const allVaultTags = useMemo(() => {
    return Array.from(new Set(notes.flatMap(n => n.tags)));
  }, [notes]);

  return (
    <div className="relative w-full flex flex-col space-y-3">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F19]/90 p-3 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Left: Mode Switcher & Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => onToggleMode('global')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                mode === 'global' ? 'bg-temple-gold text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Network size={13} /> <span>Grafo Global</span>
            </button>
            <button
              onClick={() => onToggleMode('local')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                mode === 'local' ? 'bg-temple-gold text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass size={13} /> <span>Grafo Local</span>
            </button>
          </div>

          <span className="text-[10px] sm:text-xs text-gray-400 font-mono font-bold bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
            {visibleNotes.length} Nodos • {visibleLinks.length} Enlaces
          </span>

          {mode === 'local' && (
            <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-xl text-[10px] text-amber-300 font-bold">
              <span>Profundidad:</span>
              <button
                onClick={() => setSettings(s => ({ ...s, depth: 1 }))}
                className={`px-1.5 py-0.5 rounded ${settings.depth === 1 ? 'bg-temple-gold text-black font-extrabold' : 'text-gray-300'}`}
              >
                1-Hop
              </button>
              <button
                onClick={() => setSettings(s => ({ ...s, depth: 2 }))}
                className={`px-1.5 py-0.5 rounded ${settings.depth === 2 ? 'bg-temple-gold text-black font-extrabold' : 'text-gray-300'}`}
              >
                2-Hops
              </button>
            </div>
          )}
        </div>

        {/* Right: Search, Zoom & Settings */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {/* Quick Search inside graph */}
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Buscar en grafo..."
              className="w-32 sm:w-44 bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-temple-gold"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2 top-1.5 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.4, Math.round((z - 0.2) * 10) / 10))}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Alejar (Zoom Out)"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-gray-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(2.5, Math.round((z + 0.2) * 10) / 10))}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Acercar (Zoom In)"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Reset Layout */}
          <button
            onClick={handleResetLayout}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl transition"
            title="Reiniciar Geometría y Fuerzas"
          >
            <RotateCcw size={13} />
          </button>

          {/* Settings Drawer Toggle */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
              showSettingsDrawer ? 'bg-temple-gold text-black border-temple-gold' : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
            }`}
          >
            <Settings2 size={13} />
            <span className="hidden sm:inline">Ajustes</span>
          </button>
        </div>
      </div>

      {/* Tag Filters Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 shrink-0 mr-1">
          Filtro Etiqueta:
        </span>
        <button
          onClick={() => setSelectedTagFilter(null)}
          className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition whitespace-nowrap ${
            selectedTagFilter === null
              ? 'bg-temple-gold text-black border-temple-gold shadow-sm'
              : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          Todas ({notes.length})
        </button>
        {allVaultTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
            className={`text-[9px] font-mono px-2 py-0.5 rounded-lg border transition whitespace-nowrap ${
              selectedTagFilter === tag
                ? 'bg-temple-gold text-black border-temple-gold shadow-sm'
                : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Main Graph Interactive Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handleBackgroundPointerDown}
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handleContainerPointerUp}
        onPointerLeave={handleContainerPointerUp}
        className="relative w-full h-[480px] sm:h-[620px] bg-[#070A11] rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden touch-none select-none shadow-2xl cursor-grab active:cursor-grabbing"
      >
        {/* Obsidian Dark Dot Grid Canvas */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Scalable Pan/Zoom Canvas Layer */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0
          }}
        >
          {/* SVG Relationship Links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <filter id="obsidian-link-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {visibleLinks.map(link => {
              const src = nodeMap.get(link.source);
              const tgt = nodeMap.get(link.target);
              if (!src || !tgt) return null;

              const isHighlighted = 
                src.id === activeNoteId || tgt.id === activeNoteId ||
                src.id === hoveredNodeId || tgt.id === hoveredNodeId;

              const isFocusActive = Boolean(activeNoteId || hoveredNodeId);
              const strokeColor = isHighlighted ? '#F5D061' : '#C5A059';

              return (
                <g key={`link-${link.source}-${link.target}`}>
                  {isHighlighted && (
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke="#F59E0B"
                      strokeWidth="4"
                      opacity="0.35"
                      filter="url(#obsidian-link-glow)"
                    />
                  )}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 2.4 : 1.2}
                    strokeDasharray={isHighlighted ? undefined : '3 3'}
                    opacity={isHighlighted ? 0.95 : isFocusActive ? 0.12 : 0.3}
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes Layer */}
          {simNodes.map(node => {
            const isActive = node.id === activeNoteId;
            const isHovered = node.id === hoveredNodeId;
            const isConnectedToFocus = visibleLinks.some(
              l => (l.source === node.id && (l.target === activeNoteId || l.target === hoveredNodeId)) ||
                   (l.target === node.id && (l.source === activeNoteId || l.source === hoveredNodeId))
            );

            const isFocusActive = Boolean(activeNoteId || hoveredNodeId);
            const isDimmed = isFocusActive && !isActive && !isHovered && !isConnectedToFocus;
            const isDragging = draggingNodeId === node.id;

            return (
              <div
                key={node.id}
                onPointerDown={e => handleNodePointerDown(e, node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onDoubleClick={onOpenEditor}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  transform: 'translate(-50%, -50%)',
                  touchAction: 'none'
                }}
                className={`absolute flex flex-col items-center select-none ${
                  isDragging ? 'cursor-grabbing z-40' : 'cursor-grab hover:z-30'
                } ${
                  isActive ? 'z-30 scale-110' : isHovered ? 'z-30 scale-105' : isConnectedToFocus ? 'z-20' : 'z-10'
                } ${isDimmed ? 'opacity-30 hover:opacity-100' : 'opacity-100'} transition-opacity duration-150`}
                title={`${node.title} (${node.connections} enlaces) - Grupo: ${node.groupName}`}
              >
                {/* Outer Node Circle */}
                <div
                  style={{
                    width: `${node.radius * 2}px`,
                    height: `${node.radius * 2}px`,
                    borderColor: isActive ? '#FFFFFF' : isHovered ? node.groupColor : `${node.groupColor}99`,
                    boxShadow: isActive
                      ? `0 0 25px ${node.groupColor}, 0 0 10px #FFFFFF`
                      : isHovered
                      ? `0 0 15px ${node.groupColor}80`
                      : 'none'
                  }}
                  className={`relative rounded-full flex items-center justify-center text-base sm:text-xl border-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-300 via-temple-gold to-amber-600 text-black ring-4 ring-amber-400/50'
                      : 'bg-[#0B0F19]/95 text-white'
                  }`}
                >
                  <span>{getNodeEmoji(node.title)}</span>

                  {/* Pulsing beacon ring for active note */}
                  {isActive && (
                    <span className="absolute -inset-1.5 rounded-full border border-amber-400/80 animate-ping pointer-events-none" />
                  )}

                  {/* Link Degree Badge */}
                  {node.connections > 0 && (
                    <span
                      style={{
                        backgroundColor: isActive ? '#000000' : node.groupColor,
                        color: isActive ? node.groupColor : '#000000'
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center border border-black shadow"
                    >
                      {node.connections}
                    </span>
                  )}
                </div>

                {/* Obsidian Node Label Pill */}
                {settings.showLabels && (
                  <div className="mt-1.5 flex flex-col items-center pointer-events-none max-w-[120px] sm:max-w-[160px]">
                    <span
                      style={{
                        borderColor: isActive ? '#FFFFFF' : `${node.groupColor}60`
                      }}
                      className={`text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full border truncate text-center shadow-md transition-all ${
                        isActive
                          ? 'bg-temple-gold text-black font-extrabold shadow-amber-500/40'
                          : isHovered
                          ? 'bg-black/90 text-white border-amber-400'
                          : 'bg-black/85 text-gray-300'
                      }`}
                    >
                      {getNodeDisplayTitle(node.title)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Left: Obsidian Controls Drawer */}
        {showSettingsDrawer && (
          <div className="absolute top-3 right-3 z-50 bg-[#0B0F19]/95 border border-temple-gold/40 rounded-2xl p-4 w-72 space-y-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-temple-gold flex items-center gap-1.5">
                <Sliders size={14} /> Ajustes del Grafo
              </span>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Forces Sliders */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-300">
                  <span>Fuerza de Repulsión</span>
                  <span className="font-mono text-temple-gold">{settings.repelStrength}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={settings.repelStrength}
                  onChange={e => {
                    setSettings({ ...settings, repelStrength: Number(e.target.value) });
                    reheat();
                  }}
                  className="w-full accent-temple-gold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-300">
                  <span>Distancia de Enlaces</span>
                  <span className="font-mono text-temple-gold">{settings.linkDistance}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="250"
                  value={settings.linkDistance}
                  onChange={e => {
                    setSettings({ ...settings, linkDistance: Number(e.target.value) });
                    reheat();
                  }}
                  className="w-full accent-temple-gold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-300">
                  <span>Gravedad Central</span>
                  <span className="font-mono text-temple-gold">{Math.round(settings.centerStrength * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.15"
                  step="0.01"
                  value={settings.centerStrength}
                  onChange={e => {
                    setSettings({ ...settings, centerStrength: Number(e.target.value) });
                    reheat();
                  }}
                  className="w-full accent-temple-gold"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer text-gray-300 hover:text-white">
                <span>Mostrar Etiquetas</span>
                <input
                  type="checkbox"
                  checked={settings.showLabels}
                  onChange={e => setSettings({ ...settings, showLabels: e.target.checked })}
                  className="accent-temple-gold"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-gray-300 hover:text-white">
                <span>Mostrar Nodos Huérfanos</span>
                <input
                  type="checkbox"
                  checked={settings.showOrphans}
                  onChange={e => setSettings({ ...settings, showOrphans: e.target.checked })}
                  className="accent-temple-gold"
                />
              </label>
            </div>

            {/* Obsidian Color Groups Legend */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">
                Grupos de Color Obsidian:
              </span>
              <div className="space-y-1">
                {OBSIDIAN_COLOR_GROUPS.map(g => (
                  <div key={g.name} className="flex items-center justify-between text-[10px] text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                      <span>{g.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Canvas Instruction Pill */}
        <div className="absolute bottom-3 left-3 hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none text-[10px] text-gray-400">
          <span className="w-2 h-2 rounded-full bg-temple-gold animate-pulse" />
          <span>Física D3 activa • Arrastra para mover • Clic para seleccionar • Doble clic para editar</span>
        </div>
      </div>
    </div>
  );
}
