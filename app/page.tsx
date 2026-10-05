'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileText, Folder, Search, Plus, Edit3, Eye, Download, 
  Trash2, X, Sliders, Command, ChevronRight, ChevronLeft,
  Share2, Network, Compass, ListTree, Link2, Settings,
  Maximize2, CheckCircle2, Upload, ImageIcon, ArrowUpDown
} from 'lucide-react';
import { WikiNote } from '../components/obsidian/types';
import ForceGraph from '../components/obsidian/ForceGraph';
import MarkdownReader from '../components/obsidian/MarkdownReader';
import BacklinksPanel from '../components/obsidian/BacklinksPanel';
import OutlinePanel from '../components/obsidian/OutlinePanel';
import PropertiesPanel from '../components/obsidian/PropertiesPanel';
import CommandPalette from '../components/obsidian/CommandPalette';

// Bóveda Unificada de Paulo - TempleFit
const DEFAULT_NOTES: WikiNote[] = [
  {
    id: 'note-manual-orden',
    title: 'Manual de Trabajo Ordenado y Control',
    tags: ['sops', 'orden', 'organizacion', 'checklist', 'control'],
    content: `# Manual de Trabajo Ordenado y Control
Guía maestra de estandarización, orden operativo y control sistemático para el equipo y operaciones de Paulo en TempleFit.

> [!NOTE]
> Este manual rige la rutina diaria del gimnasio y se conecta directamente con [[1. Modelo Bicéfalo y Espacios]] y [[3. Ritmos Semanales y Festivales]].

---

### 1. RUTINA DE APERTURA (05:45 AM - 06:15 AM)
El orden de toda la jornada se decide en los primeros 30 minutos antes de que ingrese el primer atleta.

- [ ] **Apertura y Despeje Físico**:
  - Encender iluminación de la jaula y verificar música/ambiente.
  - Asegurar cuadrilátero limpio, sin barras ni discos en el suelo.
  - Preparar estación de hidratación inicial (bidón con sales ElectroHidra).
- [ ] **Apertura de Caja y Sistema**:
  - Abrir la aplicación TempleFit Admin en el móvil o tablet.
  - Verificar fondo de caja física inicial (base de cambio en monedas y billetes).
  - Comprobar funcionamiento del canal QR Simple para cobros inmediatos.

---

### 2. GESTIÓN IMPECABLE DE PROSPECTOS Y LEADS
Regla de oro: Ningún prospecto se queda más de 24 horas sin respuesta humana cálida. Se ejecuta a través de la [[4. Red de Embudos de Venta]].

- [ ] **Revisión Matutina del Embudo**:
  - Filtrar prospectos con estado "Nuevo" y enviar mensaje de bienvenida personalizado por WhatsApp.
  - Recordar la invitación a la clase de prueba CristoFit Camp del sábado (06:00 AM) documentada en [[3. Ritmos Semanales y Festivales]].
- [ ] **Día Sábado Comunitario (Regla Anti-Ventas)**:
  - Respetar el bloqueo estricto de ventas en sábado: el sábado es exclusivamente para comunidad, sudor, técnica y nutrición. No presionar ventas ese día.
- [ ] **Auditoría de Prospectos (>14 días)**:
  - Revisar contactos sin respuesta en 14 días. Reclasificar a "Perdido" o activar mensaje de cortesía F2.

---

### 3. CONTROL DE SNACK BAR SIN DESCUADRES
El 90% del desorden financiero surge de consumos no anotados o cobros postergados. Vinculado a [[2. El Modelo Hub (Las 4 Unidades)]].

- [ ] **Registro en el Acto**:
  - Todo consumo de suplemento, barra o batido se anota inmediatamente en la ficha del atleta.
  - Jamás confiar en la memoria para anotar consumos al final de la jornada.
- [ ] **Canales de Cobro Claros**:
  - Ofrecer siempre las dos opciones: **QR Simple** (transferencia bancaria instantánea) o **Efectivo** (en mano).
  - Para QR Simple, solicitar al atleta que muestre la confirmación en pantalla antes de dar por saldado el monto.
- [ ] **Saldado de Deudas**:
  - Cuando un atleta liquide su deuda pendiente o deje saldo a favor, registrar el abono con el método exacto (QR Simple o Efectivo).

---

### 4. SEGUIMIENTO DE LOS 12 HÁBITOS DIARIOS EN EL CALENDARIO
No se puede mejorar lo que no se mide día a día. Se audita en [[5. Bases de Datos y Métricas de Control]] y se distribuye con [[6. Modelo de los 12 Discípulos]].

- [ ] **Verificación en el Calendario Mensual**:
  - Acceder al Calendario Mensual de Hábitos en TempleFit Admin.
  - Seleccionar el día actual y marcar cada uno de los 12 hábitos operativos cumplidos.
  - Meta mínima diaria: 10 de 12 hábitos para calificar el día en color Verde (Óptimo).
- [ ] **Análisis de Avance Mensual**:
  - Al final de cada semana y mes, revisar el panel de avance/retroceso para identificar qué hábitos tuvieron menor tasa de cumplimiento y corregir el enfoque.

---

### 5. RUTINA DE CIERRE DIARIO (21:30 PM - 22:00 PM)
Terminar la jornada con la casa en orden garantiza un inicio perfecto al día siguiente.

- [ ] **Cierre y Arqueo de Caja**:
  - Comparar el dinero en efectivo físico con el total de ingresos en efectivo reportados en el sistema.
  - Verificar que los pagos por QR Simple coincidan con las notificaciones bancarias.
- [ ] **Registro de Asistencias y Victorias**:
  - Validar que todas las asistencias del día quedaron registradas.
  - Anotar la Victoria Principal del día y el Foco de Ajuste prioritario para mañana.
- [ ] **Orden Físico y Seguridad**:
  - Regresar todos los implementos a su posición de almacenamiento estándar.
  - Cerrar jaula, apagar sistemas y respaldar notas operativas en esta Bóveda.`,
    attachments: [],
    updatedAt: '2026-10-05'
  },
  {
    id: 'note-sops-1',
    title: '1. Modelo Bicéfalo y Espacios',
    tags: ['sops', 'arquitectura', 'modelo'],
    content: `# 1. Modelo Bicéfalo y Espacios
El gimnasio opera con un modelo asociado donde nosotros manejamos 3 Niveles Operativos:
- **Fase 1: Iniciación**: Acondicionamiento y adaptación muscular básica.
- **Fase 2: Desarrollo**: Aumento de cargas, hipertrofia funcional y técnica.
- **Fase 3: Perfeccionamiento**: Potencia, atletas de competencia y élite.

> [!TIP]
> Repartición de gimnasio: 30% del margen neto para el local asociado y 70% reinversión/hub.

Este modelo nutre directamente a [[2. El Modelo Hub (Las 4 Unidades)]] y organiza la estructura humana con [[6. Modelo de los 12 Discípulos]].
Para el orden del día a día, remitirse a [[Manual de Trabajo Ordenado y Control]].`,
    attachments: [],
    updatedAt: '2026-10-05'
  },
  {
    id: 'note-sops-2',
    title: '2. El Modelo Hub (Las 4 Unidades)',
    tags: ['sops', 'hub', 'unidades'],
    content: `# 2. El Modelo Hub (Las 4 Unidades)
El ecosistema central de TempleFit ideado por Paulo integra 4 unidades de monetización continua:
1. **Centro de Entrenamiento**: El motor de adquisición y retención.
2. **Barra Nutricional Integrada (Snack Bar)**: Suplementos, batidos y alimentación pre/post entreno.
3. **Apparel (Marca de Ropa)**: Identidad, comunidad y merchandising exclusivo.
4. **Medicina Preventiva**: Fisioterapia, kinesiología y medicina deportiva preventiva.

Todo alumno debe transicionar por estas unidades (Cross-Selling natural).
- Se conecta con [[3. Ritmos Semanales y Festivales]] para activación comunitaria.
- Se nutre del tráfico de [[4. Red de Embudos de Venta]].`,
    attachments: [],
    updatedAt: '2026-10-05'
  },
  {
    id: 'note-sops-3',
    title: '3. Ritmos Semanales y Festivales',
    tags: ['sops', 'ritmos', 'sabados'],
    content: `# 3. Ritmos Semanales y Festivales
Calendario de eventos y cadencias de impacto para la comunidad TempleFit:
- **Sábados CristoFit Camp**: Bloques de Fuerza, Comunidad, Catering, Técnica, Cardio, Show Fit.
  - Regla: Cero presión de ventas los sábados; enfoque 100% en sudor y afecto.
- **Festivales Trimestrales**: Corona de Victoria y Celebración de Vida.
- **Neuro-Entrenamiento de Impacto en Ventas**: Programa formativo continuo de 630 horas.

Coordina directamente con [[4. Red de Embudos de Venta]] para la reactivación de atletas y el [[Manual de Trabajo Ordenado y Control]].`,
    attachments: [],
    updatedAt: '2026-10-05'
  },
  {
    id: 'note-sops-4',
    title: '4. Red de Embudos de Venta',
    tags: ['sops', 'ventas', 'embudos'],
    content: `# 4. Red de Embudos de Venta
Estructura automatizada y humana de adquisición y recuperación de atletas:
- **F1 Conversión Inicial**: 5 correos / WhatsApps en 7 días.
  - Lead Magnet: 1 semana gratis de entrenamiento + 20% Dcto en Snack Bar.
- **F2 Recuperación (Recovery)**: Rescate de alumnos desertores o inactivos:
  - 24 horas: Gym check-in.
  - 48 horas: Snack Bar cortesía.
  - 72 horas: Evaluación en Medicina Preventiva.
- **F3 Onboarding**: 60% de conversión garantizada de Gym hacia consumo en Snack Bar.

Los resultados numéricos se consolidan cada lunes en [[5. Bases de Datos y Métricas de Control]].`,
    attachments: [],
    updatedAt: '2026-10-05'
  },
  {
    id: 'note-sops-5',
    title: '5. Bases de Datos y Métricas de Control',
    tags: ['sops', 'metricas', 'control'],
    content: `# 5. Bases de Datos y Métricas de Control
Panel de control numérico y auditoría para Paulo y el equipo de liderazgo:
- **Checklist 6 Días Operativos**: Cumplimiento del [[Manual de Trabajo Ordenado y Control]].
- **Corte Ejecutivo**: Lunes 8:00 AM puntual:
  - Ingresos brutos y netos.
  - Vidas impactadas y nuevas altas.
  - Margen neto operativo.
- **Regla 3-3-3**: Alerta temprana ante 3 días consecutivos de estancamiento.
- **NPS (Net Promoter Score)**: Si baja de 7, se activa intervención inmediata en los escuadrones de [[6. Modelo de los 12 Discípulos]].`,
    attachments: [],
    updatedAt: '2026-10-05'
  },
  {
    id: 'note-sops-6',
    title: '6. Modelo de los 12 Discípulos',
    tags: ['sops', 'escuadrones', 'liderazgo'],
    content: `# 6. Modelo de los 12 Discípulos
Estructura celular descentralizada de formación y liderazgo en TempleFit:
- **Brigadas Independientes**: 25 grupos activos en el Hub.
- **Límite Estricto**: Máximo 12 atletas por escuadrón para garantizar control de comunidad y atención fraternal.
- **Meta Anual**: 300 atletas certificados en el primer año.
- **Monitoreo**: Se reporta semanalmente en [[5. Bases de Datos y Métricas de Control]] y retroalimenta al [[1. Modelo Bicéfalo y Espacios]].`,
    attachments: [],
    updatedAt: '2026-10-05'
  },
  {
    id: 'note-sops-7',
    title: '7. Marco Corporativo (Distribución de Utilidades)',
    tags: ['estrategia', 'finanzas', 'corporativo'],
    content: `# 7. Marco Corporativo (Distribución de Utilidades)
Guía financiera y estratégica de Paulo para la distribución y reinversión de utilidades de TempleFit:

- **50% de las utilidades netas**: Se REINVIERTEN obligatoriamente en expansión, equipamiento y reserva del Hub.
- **50% de las utilidades disponibles**: Se distribuyen entre el equipo clave:
  - 25% Paulo (Fundador & Dirección)
  - 10% Regalías (Royalties de Marca)
  - 10% Manager General del Gimnasio
  - 10% Chef / Nutricionista de la Barra
  - 10% Pool de Instructores y Coaches
  - 5% Marketing Digital & Closers de Ventas
  - 5% Fondo Bonus para el Equipo

- Conecta con la arquitectura de [[1. Modelo Bicéfalo y Espacios]] y las metas de [[5. Bases de Datos y Métricas de Control]].`,
    attachments: [],
    updatedAt: '2026-10-05'
  }
];

export default function TempleWikiApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [notes, setNotes] = useState<WikiNote[]>(DEFAULT_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>('note-sops-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Tabs: list of open tabs e.g. [{ type: 'note', id: '...' }, { type: 'graph' }]
  const [openTabs, setOpenTabs] = useState<{ id: string; type: 'note' | 'graph'; noteId?: string }[]>([
    { id: 'tab-editor', type: 'note', noteId: 'note-sops-1' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-editor');

  // Mode: 'read' | 'edit'
  const [editorMode, setEditorMode] = useState<'read' | 'edit'>('read');

  // Sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightSidebarTab, setRightSidebarTab] = useState<'backlinks' | 'outline' | 'localgraph'>('backlinks');

  // Editor Draft State
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Command palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('templefit_obsidian_workspace_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          return;
        }
      } catch (e) {}
    }
    setNotes(DEFAULT_NOTES);
    localStorage.setItem('templefit_obsidian_workspace_v5', JSON.stringify(DEFAULT_NOTES));
  }, []);

  // 2. Keyboard shortcuts (Ctrl+P, Ctrl+O, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'o' || e.key === 'k')) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setEditorMode(m => m === 'read' ? 'edit' : 'read');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active Note Reference
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || notes[0] || DEFAULT_NOTES[0];
  }, [notes, activeNoteId]);

  // Sync draft fields when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditedTitle(activeNote.title);
      setEditedContent(activeNote.content);
      setEditorMode('read');
    }
  }, [activeNoteId]);

  // Save changes
  const handleSaveNote = () => {
    const extractedTags = Array.from(editedContent.matchAll(/#(\w+)/g)).map(m => m[1]);
    const allTags = Array.from(new Set([...activeNote.tags, ...extractedTags]));
    const todayDate = new Date().toISOString().split('T')[0];

    const updated = notes.map(n => n.id === activeNote.id ? {
      ...n,
      title: editedTitle.trim() || n.title,
      content: editedContent,
      tags: allTags,
      updatedAt: todayDate
    } : n);

    setNotes(updated);
    try {
      localStorage.setItem('templefit_obsidian_workspace_v5', JSON.stringify(updated));
    } catch (e) {}

    setEditorMode('read');
    setToastMessage('Note saved');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Open note in tab
  const handleOpenNote = (noteId: string) => {
    setActiveNoteId(noteId);
    // If there is an existing note tab, reuse or activate it
    const existing = openTabs.find(t => t.type === 'note');
    if (existing) {
      existing.noteId = noteId;
      setActiveTabId(existing.id);
    } else {
      const newTabId = `tab-note-${Date.now()}`;
      setOpenTabs([...openTabs, { id: newTabId, type: 'note', noteId }]);
      setActiveTabId(newTabId);
    }
  };

  // Open Graph Tab
  const handleOpenGraphTab = () => {
    const existing = openTabs.find(t => t.type === 'graph');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newTabId = `tab-graph-${Date.now()}`;
      setOpenTabs([...openTabs, { id: newTabId, type: 'graph' }]);
      setActiveTabId(newTabId);
    }
  };

  // Close tab
  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openTabs.length <= 1) return; // Keep at least one tab
    const nextTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  // Create new note
  const handleCreateNote = (suggestedTitle?: string) => {
    const title = suggestedTitle || prompt('Note title:');
    if (!title || !title.trim()) return;

    const newId = `note-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newNote: WikiNote = {
      id: newId,
      title: title.trim(),
      tags: ['sops'],
      content: `# ${title.trim()}\n\nWrite your note content here using Markdown...\n\n- Connect to other notes using [[1. Modelo Bicéfalo y Espacios]]`,
      attachments: [],
      updatedAt: today
    };

    const nextNotes = [newNote, ...notes];
    setNotes(nextNotes);
    try {
      localStorage.setItem('templefit_obsidian_workspace_v5', JSON.stringify(nextNotes));
    } catch (e) {}

    handleOpenNote(newId);
    setEditorMode('edit');
  };

  // Delete note
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (notes.length <= 1) return;
    if (!confirm('Delete note permanently?')) return;

    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    try {
      localStorage.setItem('templefit_obsidian_workspace_v5', JSON.stringify(remaining));
    } catch (e) {}

    if (activeNoteId === id) {
      handleOpenNote(remaining[0].id);
    }
  };

  // Export note as .md
  const handleExportCurrentNote = () => {
    const frontmatter = [
      '---',
      `title: "${activeNote.title.replace(/"/g, '\\"')}"`,
      `id: "${activeNote.id}"`,
      `author: "Paulo"`,
      `updated: "${activeNote.updatedAt}"`,
      `tags: [${activeNote.tags.map(t => `"${t}"`).join(', ')}]`,
      '---',
      '',
      activeNote.content
    ].join('\n');

    const blob = new Blob([frontmatter], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFileName = activeNote.title.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'note';
    link.download = `${cleanFileName}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export full vault as JSON
  const handleExportVaultBackup = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `templefit_vault_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle checklist
  const handleToggleCheckbox = (lineIndex: number, newChecked: boolean) => {
    const lines = activeNote.content.split('\n');
    if (lines[lineIndex]) {
      const current = lines[lineIndex];
      lines[lineIndex] = newChecked
        ? current.replace(/^-\s*\[\s*\]/, '- [x]')
        : current.replace(/^-\s*\[[xX]\]/, '- [ ]');
      const updatedContent = lines.join('\n');

      const next = notes.map(n => n.id === activeNote.id ? { ...n, content: updatedContent } : n);
      setNotes(next);
      try {
        localStorage.setItem('templefit_obsidian_workspace_v5', JSON.stringify(next));
      } catch (e) {}
      setEditedContent(updatedContent);
    }
  };

  // Tag Management
  const handleAddTag = (tag: string) => {
    const next = notes.map(n => n.id === activeNote.id ? { ...n, tags: Array.from(new Set([...n.tags, tag])) } : n);
    setNotes(next);
    try {
      localStorage.setItem('templefit_obsidian_workspace_v5', JSON.stringify(next));
    } catch (e) {}
  };

  const handleRemoveTag = (tag: string) => {
    const next = notes.map(n => n.id === activeNote.id ? { ...n, tags: n.tags.filter(t => t !== tag) } : n);
    setNotes(next);
    try {
      localStorage.setItem('templefit_obsidian_workspace_v5', JSON.stringify(next));
    } catch (e) {}
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? n.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  // All tags with counts
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach(n => {
      n.tags.forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const activeTab = openTabs.find(t => t.id === activeTabId) || openTabs[0];

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#1e1e1e] text-[#dcddde] select-none font-sans">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#705dcf] text-white text-xs px-3.5 py-2 rounded shadow-2xl flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Workspace Tab Bar */}
      <header className="h-9 bg-[#141414] border-b border-[#262626] flex items-center justify-between px-2 shrink-0 z-20">
        {/* Left: Tab list */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar h-full">
          {/* Toggle Left Sidebar Button */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-[#262626] rounded transition mr-1"
            title="Toggle sidebar (Ctrl+\)"
          >
            {leftSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Open Tabs */}
          {openTabs.map(tab => {
            const isTabActive = tab.id === activeTabId;
            const tabNote = tab.type === 'note' ? (notes.find(n => n.id === tab.noteId) || activeNote) : null;
            const tabTitle = tab.type === 'graph' ? 'Graph view' : tabNote?.title || 'Note';

            return (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  if (tab.type === 'note' && tab.noteId) {
                    setActiveNoteId(tab.noteId);
                  }
                }}
                className={`h-[28px] max-w-[200px] px-2.5 rounded-t text-xs flex items-center gap-2 cursor-pointer transition border-t-2 ${
                  isTabActive
                    ? 'bg-[#1e1e1e] border-[#705dcf] text-white font-medium shadow-sm'
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-300'
                }`}
              >
                {tab.type === 'graph' ? (
                  <Network size={12} className="text-[#a78bfa] shrink-0" />
                ) : (
                  <FileText size={12} className="text-gray-400 shrink-0" />
                )}
                <span className="truncate text-[12px]">{tabTitle}</span>
                {openTabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="p-0.5 text-gray-500 hover:text-gray-200 rounded hover:bg-[#2d2d2d] transition ml-1"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Note Button in Tab Bar */}
          <button
            onClick={() => handleCreateNote()}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-[#262626] rounded transition ml-1"
            title="New note"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Right: Actions in Tab Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeTab.type === 'note' && (
            <div className="flex items-center bg-[#202020] rounded border border-[#2d2d2d] p-0.5">
              <button
                onClick={() => setEditorMode('read')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                  editorMode === 'read' ? 'bg-[#333333] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Reading view"
              >
                <Eye size={12} />
                <span className="hidden sm:inline">Reading</span>
              </button>
              <button
                onClick={() => setEditorMode('edit')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                  editorMode === 'edit' ? 'bg-[#333333] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Editing mode (Ctrl+E)"
              >
                <Edit3 size={12} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          )}

          {/* Quick Switcher / Command palette */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-[#262626] rounded transition"
            title="Command palette (Ctrl+P / Ctrl+O)"
          >
            <Command size={14} />
          </button>

          {/* Export note as .md */}
          {activeTab.type === 'note' && (
            <button
              onClick={handleExportCurrentNote}
              className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-[#262626] rounded transition"
              title="Export as Markdown (.md)"
            >
              <Download size={14} />
            </button>
          )}

          {/* Toggle Right Sidebar Button */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-[#262626] rounded transition ml-1"
            title="Toggle right sidebar"
          >
            {rightSidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* 1. Left Ribbon (44px vertical icon strip) */}
        <nav className="w-11 bg-[#141414] border-r border-[#262626] flex flex-col items-center py-2.5 space-y-3 shrink-0 z-10">
          <button
            onClick={() => setLeftSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#222222] rounded transition"
            title="Files"
          >
            <Folder size={16} />
          </button>

          <button
            onClick={() => {
              setLeftSidebarOpen(true);
            }}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#222222] rounded transition"
            title="Search"
          >
            <Search size={16} />
          </button>

          <button
            onClick={handleOpenGraphTab}
            className={`p-2 rounded transition ${
              activeTab.type === 'graph' ? 'bg-[#705dcf] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#222222]'
            }`}
            title="Open graph view"
          >
            <Network size={16} />
          </button>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#222222] rounded transition"
            title="Quick switcher (Ctrl+O)"
          >
            <Command size={16} />
          </button>

          <div className="flex-1" />

          {/* Vault Backup JSON */}
          <button
            onClick={handleExportVaultBackup}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#222222] rounded transition"
            title="Download vault backup (JSON)"
          >
            <Download size={16} />
          </button>
        </nav>

        {/* 2. Left Sidebar (File Explorer Tree) */}
        {leftSidebarOpen && (
          <aside className="w-64 bg-[#181818] border-r border-[#262626] flex flex-col shrink-0">
            {/* Header: Vault title & actions */}
            <div className="p-2.5 border-b border-[#262626] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider truncate">
                TempleFit Vault
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCreateNote()}
                  className="p-1 text-gray-400 hover:text-gray-200 hover:bg-[#242424] rounded transition"
                  title="New note"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Quick search input */}
            <div className="p-2 border-b border-[#262626]">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Find files..."
                  className="w-full bg-[#121212] border border-[#262626] rounded py-1 pl-7 pr-2 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-[#705dcf]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1.5 text-gray-500 hover:text-gray-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              <div className="text-[10px] uppercase font-semibold text-gray-500 px-2 py-1 tracking-wider">
                Notes ({filteredNotes.length})
              </div>

              {filteredNotes.map(n => {
                const isActive = n.id === activeNote.id && activeTab.type === 'note';
                return (
                  <div
                    key={n.id}
                    onClick={() => handleOpenNote(n.id)}
                    className={`group px-2.5 py-1.5 rounded text-xs flex items-center justify-between cursor-pointer transition ${
                      isActive
                        ? 'bg-[#2a2a2a] text-white font-medium'
                        : 'text-gray-400 hover:bg-[#222222] hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={13} className={isActive ? 'text-[#a78bfa]' : 'text-gray-500 group-hover:text-gray-400'} />
                      <span className="truncate">{n.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteNote(n.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-red-400 transition rounded"
                      title="Delete note"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Tags tree in sidebar */}
            {tagCounts.length > 0 && (
              <div className="p-2 border-t border-[#262626] max-h-36 overflow-y-auto">
                <div className="text-[10px] uppercase font-semibold text-gray-500 px-1 py-0.5 tracking-wider mb-1">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {tagCounts.map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
                        selectedTag === tag
                          ? 'bg-[#705dcf] text-white'
                          : 'bg-[#202020] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      #{tag} <span className="opacity-60 text-[9px]">({count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* 3. Center Workspace Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
          {activeTab.type === 'graph' ? (
            /* Full-window Graph View */
            <div className="flex-1 relative w-full h-full">
              <ForceGraph
                notes={notes}
                activeNoteId={activeNote.id}
                onSelectNote={(id) => handleOpenNote(id)}
                onOpenEditor={() => {
                  const noteTab = openTabs.find(t => t.type === 'note');
                  if (noteTab) setActiveTabId(noteTab.id);
                }}
                mode="global"
              />
            </div>
          ) : (
            /* Note Editor & Reading View */
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 max-w-4xl w-full mx-auto">
              {/* Properties Frontmatter Panel */}
              <PropertiesPanel
                note={activeNote}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />

              {editorMode === 'edit' ? (
                /* Source Edit Mode */
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full bg-transparent text-2xl font-bold text-gray-100 border-b border-[#2d2d2d] pb-2 outline-none"
                  />

                  <textarea
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    rows={20}
                    placeholder="Write Markdown with [[Wikilinks]]..."
                    className="w-full bg-transparent text-gray-200 font-mono text-[13px] leading-relaxed outline-none resize-none border-none p-0"
                  />

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2d2d2d]">
                    <button
                      onClick={() => setEditorMode('read')}
                      className="px-3 py-1.5 bg-[#262626] hover:bg-[#303030] text-gray-300 text-xs rounded transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="px-4 py-1.5 bg-[#705dcf] hover:bg-[#7e6be3] text-white text-xs font-medium rounded transition"
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Reading View */
                <div className="space-y-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-6 font-sans">
                    {activeNote.title}
                  </h1>

                  <MarkdownReader
                    content={activeNote.content}
                    notes={notes}
                    onNavigate={(id) => handleOpenNote(id)}
                    onCreateMissingNote={(title) => handleCreateNote(title)}
                    onToggleCheckbox={handleToggleCheckbox}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        {/* 4. Right Sidebar (Backlinks, Outline, Local Graph) */}
        {rightSidebarOpen && (
          <aside className="w-72 bg-[#181818] border-l border-[#262626] flex flex-col shrink-0">
            {/* Header: Tab Icons */}
            <div className="h-9 border-b border-[#262626] flex items-center justify-around px-2 text-xs">
              <button
                onClick={() => setRightSidebarTab('backlinks')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition text-[11px] font-medium ${
                  rightSidebarTab === 'backlinks' ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Backlinks"
              >
                <Link2 size={13} className="text-[#a78bfa]" />
                <span>Links</span>
              </button>

              <button
                onClick={() => setRightSidebarTab('outline')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition text-[11px] font-medium ${
                  rightSidebarTab === 'outline' ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Outline"
              >
                <ListTree size={13} className="text-[#38bdf8]" />
                <span>Outline</span>
              </button>

              <button
                onClick={() => setRightSidebarTab('localgraph')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded transition text-[11px] font-medium ${
                  rightSidebarTab === 'localgraph' ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Local graph"
              >
                <Compass size={13} className="text-[#34d399]" />
                <span>Local</span>
              </button>
            </div>

            {/* Sidebar Tab Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {rightSidebarTab === 'backlinks' && (
                <BacklinksPanel
                  activeNote={activeNote}
                  allNotes={notes}
                  onNavigate={(id) => handleOpenNote(id)}
                />
              )}

              {rightSidebarTab === 'outline' && (
                <OutlinePanel content={activeNote.content} />
              )}

              {rightSidebarTab === 'localgraph' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Compass size={12} className="text-[#34d399]" />
                    <span>Local Graph</span>
                  </div>
                  <div className="h-64 rounded border border-[#2d2d2d] overflow-hidden">
                    <ForceGraph
                      notes={notes}
                      activeNoteId={activeNote.id}
                      onSelectNote={(id) => handleOpenNote(id)}
                      mode="local"
                      height="256px"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 5. Bottom Status Bar (22px) */}
      <footer className="h-6 bg-[#141414] border-t border-[#262626] px-3 flex items-center justify-between text-[11px] text-gray-500 font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span>Vault: TempleFit</span>
          <span>{notes.length} notes</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{activeNote.content.length} chars</span>
          <span>{editorMode === 'read' ? 'Reading' : 'Editing'}</span>
        </div>
      </footer>

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          notes={notes}
          onSelectNote={(id) => {
            handleOpenNote(id);
            setIsCommandPaletteOpen(false);
          }}
          onCreateNewNote={() => {
            handleCreateNote();
            setIsCommandPaletteOpen(false);
          }}
          onOpenGlobalGraph={() => {
            handleOpenGraphTab();
            setIsCommandPaletteOpen(false);
          }}
          onOpenLocalGraph={() => {
            setRightSidebarOpen(true);
            setRightSidebarTab('localgraph');
            setIsCommandPaletteOpen(false);
          }}
          onToggleEditMode={() => {
            setEditorMode(m => m === 'read' ? 'edit' : 'read');
            setIsCommandPaletteOpen(false);
          }}
          onExportCurrentNote={() => {
            handleExportCurrentNote();
            setIsCommandPaletteOpen(false);
          }}
          onExportVaultBackup={() => {
            handleExportVaultBackup();
            setIsCommandPaletteOpen(false);
          }}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      )}
    </div>
  );
}
