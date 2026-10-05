'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Plus, Edit3, Save, Sparkles, FileText, CheckCircle2, 
  Share2, Layers, ExternalLink, Lock, Unlock, Network, Eye, Upload, Tag, 
  Trash2, ShieldCheck, ArrowRight, Download, Cpu, MessageSquare, AlertTriangle, Image as ImageIcon, X,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

interface WikiNote {
  id: string;
  title: string;
  vault: 'business' | 'founders'; // Business Vault vs Private Founders Vault
  tags: string[];
  content: string;
  attachments: { name: string; url: string; type: string }[];
  updatedAt: string;
}

// Unicode and Emoji Safe Extraction Helpers (prevents UTF-16 surrogate slicing errors)
function getNodeEmoji(title: string): string {
  const clean = (title || '').trim();
  if (!clean) return '📄';
  const match = clean.match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u);
  if (match) return match[1];
  const segmenter = typeof Intl !== 'undefined' && (Intl as any).Segmenter ? new (Intl as any).Segmenter('es', { granularity: 'grapheme' }) : null;
  if (segmenter) {
    const firstGrapheme = Array.from(segmenter.segment(clean))[0] as any;
    if (firstGrapheme?.segment) return firstGrapheme.segment;
  }
  const chars = Array.from(clean);
  return chars[0] || '📄';
}

function getNodeDisplayTitle(title: string): string {
  const clean = (title || '').trim();
  const withoutEmoji = clean.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trim();
  return withoutEmoji || clean;
}

const DEFAULT_NOTES: WikiNote[] = [
  {
    id: 'note-manual-orden',
    title: '📋 Manual de cómo se puede trabajar más ordenado?',
    vault: 'business',
    tags: ['sops', 'orden', 'organizacion', 'checklist', 'control'],
    content: `# 📋 Manual de cómo se puede trabajar más ordenado?
Guía maestra de estandarización, orden operativo y control sistemático para el equipo de TempleFit.

---

### 1. 🌅 RUTINA DE APERTURA (05:45 AM - 06:15 AM)
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

### 2. 👥 GESTIÓN IMPECABLE DE PROSPECTOS Y LEADS
Regla de oro: Ningún prospecto se queda más de 24 horas sin respuesta humana cálida.

- [ ] **Revisión Matutina del Embudo**:
  - Filtrar prospectos con estado "Nuevo" y enviar mensaje de bienvenida personalizado por WhatsApp.
  - Recordar la invitación a la clase de prueba CristoFit Camp del sábado (06:00 AM).
- [ ] **Día Sábado Comunitario (Regla Anti-Ventas)**:
  - Respetar el bloqueo estricto de ventas en sábado: el sábado es exclusivamente para comunidad, sudor, técnica y nutrición. No presionar ventas ese día.
- [ ] **Auditoría de Prospectos (>14 días)**:
  - Revisar contactos sin respuesta en 14 días. Reclasificar a "Perdido" o activar mensaje de cortesía F2.

---

### 3. 🥤 CONTROL DE SNACK BAR SIN DESCUADRES
El 90% del desorden financiero surge de consumos no anotados o cobros postergados.

- [ ] **Registro en el Acto**:
  - Todo consumo de suplemento, barra o batido se anota inmediatamente en la ficha del atleta.
  - Jamás confiar en la memoria para anotar consumos al final de la jornada.
- [ ] **Canales de Cobro Claros**:
  - Ofrecer siempre las dos opciones: **QR Simple** (transferencia bancaria instantánea) o **Efectivo** (en mano).
  - Para QR Simple, solicitar al atleta que muestre la confirmación en pantalla antes de dar por saldado el monto.
- [ ] **Saldado de Deudas**:
  - Cuando un atleta liquide su deuda pendiente o deje saldo a favor, registrar el abono con el método exacto (QR Simple o Efectivo) para que el asiento contable entre a la bóveda correcta (Banco o Caja Física).

---

### 4. 📅 SEGUIMIENTO DE LOS 12 HÁBITOS DIARIOS EN EL CALENDARIO
No se puede mejorar lo que no se mide día a día.

- [ ] **Verificación en el Calendario Mensual**:
  - Acceder al Calendario Mensual de Hábitos en TempleFit Admin.
  - Seleccionar el día actual y marcar cada uno de los 12 hábitos operativos cumplidos.
  - Meta mínima diaria: 10 de 12 hábitos para calificar el día en color Verde (Óptimo).
- [ ] **Análisis de Avance Mensual**:
  - Al final de cada semana y mes, revisar el panel de avance/retroceso para identificar qué hábitos tuvieron menor tasa de cumplimiento y corregir el enfoque.

---

### 5. 🌙 RUTINA DE CIERRE DIARIO (21:30 PM - 22:00 PM)
Terminar la jornada con la casa en orden garantiza un inicio perfecto al día siguiente.

- [ ] **Cierre y Arqueo de Caja**:
  - Comparar el dinero en efectivo físico con el total de ingresos en efectivo reportados en el sistema.
  - Verificar que los pagos por QR Simple coincidan con las notificaciones bancarias.
- [ ] **Registro de Asistencias y Victorias**:
  - Validar que todas las asistencias del día quedaron registradas.
  - Anotar la Victoria Principal del día y el Foco de Ajuste prioritario para mañana.
- [ ] **Orden Físico y Seguridad**:
  - Regresar todos los implementos a su posición de almacenamiento estándar.
  - Cerrar jaula, apagar sistemas y respaldar notas operativas en esta Wiki.`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-1',
    title: '📘 1. Modelo Bicéfalo y Espacios',
    vault: 'business',
    tags: ['sops', 'arquitectura', 'modelo'],
    content: `# 📘 1. Modelo Bicéfalo y Espacios
El gimnasio opera con un modelo asociado donde nosotros manejamos 3 Niveles Operativos:
- Fase 1: Iniciación
- Fase 2: Desarrollo
- Fase 3: Perfeccionamiento
- Repartición de gimnasio: 30% del margen neto.`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-2',
    title: '🎯 2. El Modelo Hub (Las 4 Unidades)',
    vault: 'business',
    tags: ['sops', 'hub', 'unidades'],
    content: `# 🎯 2. El Modelo Hub
1. Centro de Entrenamiento
2. Barra Nutricional Integrada
3. Apparel (Marca de Ropa)
4. Medicina Preventiva
Todo alumno debe transicionar por estas unidades (Cross-Selling natural).`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-3',
    title: '⏱️ 3. Ritmos Semanales y Festivales',
    vault: 'business',
    tags: ['sops', 'ritmos', 'sabados'],
    content: `# ⏱️ 3. Ritmos Semanales y Festivales
- **Sábados CristoFit Camp:** Bloques de Fuerza, Comunidad, Catering, Técnica, Cardio, Show Fit.
- **Trimestral:** Festivales Corona de Victoria y Vida.
- **Neuro-Entrenamiento de Impacto en Ventas:** Programa formativo de 630 horas.`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-4',
    title: '🧲 4. Red de Embudos de Venta',
    vault: 'business',
    tags: ['sops', 'ventas', 'embudos'],
    content: `# 🧲 4. Red de Embudos de Venta
- **F1 Conversion:** 5 emails, 7 días. Lead Magnet: 1 semana gratis + 20% Dcto Snack Bar.
- **F2 Recovery:** Recuperación de desertores. 24h Gym, 48h Catering, 72h Med Prev.
- **F3:** 60% conversión onboarding de Gym a Snack Bar.`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-5',
    title: '📊 5. Bases de Datos y Métricas',
    vault: 'business',
    tags: ['sops', 'metricas', 'control'],
    content: `# 📊 5. Bases de Datos y Métricas de Control
- **Checklist 6 Días Operativos**
- **Corte Ejecutivo:** Lunes 8:00 AM (Ingresos, Vidas Impactadas, Margen Neto).
- **Regla 3-3-3:** Alerta de estancamiento.
- **NPS:** Corregir operaciones si baja de 7.`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-6',
    title: '🛡️ 6. Modelo de los 12 Discípulos',
    vault: 'business',
    tags: ['sops', 'escuadrones', 'liderazgo'],
    content: `# 🛡️ 6. Modelo de los 12 Discípulos (Escuadrones)
- **Brigadas Independientes:** 25 grupos.
- **Límite:** 12 atletas por escuadrón para máximo control de comunidad.
- **Meta Anual:** 300 atletas certificados en el primer año.`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-7',
    title: '💰 7. Marco Corporativo (Regla 50/50)',
    vault: 'founders',
    tags: ['estrategia', 'finanzas', 'privado'],
    content: `# 💰 7. Marco Corporativo (Distribución de Utilidades)
**CONFIDENCIAL**
- 50% de las utilidades netas se REINVIERTEN obligatoriamente en el Hub.
- 50% de las utilidades se distribuyen:
  - 25% Fundador
  - 10% Regalías (Royalties)
  - 10% Manager del Gym
  - 10% Chef / Nutricionista
  - 10% Pool de Instructores
  - 5% Marketing / Closers
  - 5% Fondo Bonus (Equipo)`,
    attachments: [],
    updatedAt: '05/10/2026'
  }
];

// Disposición armónica predeterminada para las notas de TempleFit (porcentaje 0-100 en canvas)
const DEFAULT_NODE_LAYOUT: Record<string, { x: number; y: number }> = {
  'note-sops-1': { x: 50, y: 46 }, // Hub Focal: Modelo Bicéfalo y Espacios
  'note-manual-orden': { x: 50, y: 76 }, // Base Operativa: Manual de Orden
  'note-sops-2': { x: 74, y: 35 }, // Superior Derecho: El Modelo Hub
  'note-sops-3': { x: 76, y: 65 }, // Inferior Derecho: Ritmos Semanales y Festivales
  'note-sops-4': { x: 26, y: 65 }, // Inferior Izquierdo: Red de Embudos de Venta
  'note-sops-5': { x: 24, y: 35 }, // Superior Izquierdo: Bases de Datos y Métricas
  'note-sops-6': { x: 50, y: 18 }, // Superior Central: Modelo de los 12 Discípulos
  'note-sops-7': { x: 50, y: 50 }, // Bóveda Privada: Marco Corporativo (50/50)
};

// Enlaces semánticos de arquitectura operativa TempleFit
const STRUCTURAL_EDGES: [string, string][] = [
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
  ['note-sops-7', 'note-sops-5'],
];

// Etiquetas comunes de SOPs que NO deben generar spiderweb densa no deseada
const GENERIC_TAGS = new Set(['sops', 'control', 'orden', 'organizacion', 'checklist']);

export default function TempleWikiApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [notes, setNotes] = useState<WikiNote[]>(DEFAULT_NOTES);
  const [activeVault, setActiveVault] = useState<'business' | 'founders'>('business');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeNoteId, setActiveNoteId] = useState<string>('note-sops-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K for accessibility search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('wiki-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [viewMode, setViewMode] = useState<'editor' | 'graph'>('editor');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [llmExtracting, setLlmExtracting] = useState(false);

  const [previewAttachment, setPreviewAttachment] = useState<{ name: string; url: string; type: string } | null>(null);
  const [attachmentErrorModal, setAttachmentErrorModal] = useState<string | null>(null);
  const [quickViewNote, setQuickViewNote] = useState<WikiNote | null>(null);

  // Obsidian Graph View interactive coordinate state & real-time drag tracking
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(DEFAULT_NODE_LAYOUT);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number; hasMoved: boolean } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('templefit_mini_obsidian_notes_v3') || localStorage.getItem('templefit_mini_obsidian_notes_v2') || localStorage.getItem('templefit_mini_obsidian_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, WikiNote>();
          DEFAULT_NOTES.forEach(d => map.set(d.id, d));
          parsed.forEach(p => {
            if (p && p.id) {
              const base = map.get(p.id) || p;
              // Clean up outdated dates if note has old 21/8/2026 or 'Hoy' date
              let cleanedDate = p.updatedAt;
              if (!cleanedDate || cleanedDate === '21/8/2026' || cleanedDate === 'Hoy') {
                cleanedDate = new Date().toLocaleDateString('es-BO');
              }
              map.set(p.id, { ...base, ...p, updatedAt: cleanedDate });
            }
          });
          // Ensure note-manual-orden is present
          if (!map.has('note-manual-orden')) {
            const manual = DEFAULT_NOTES.find(d => d.id === 'note-manual-orden');
            if (manual) map.set(manual.id, manual);
          }
          const merged = Array.from(map.values());
          setNotes(merged);
          localStorage.setItem('templefit_mini_obsidian_notes_v3', JSON.stringify(merged));
          return;
        }
      } catch (e) {}
    }
    setNotes(DEFAULT_NOTES);
    localStorage.setItem('templefit_mini_obsidian_notes_v3', JSON.stringify(DEFAULT_NOTES));
  }, []);

  const vaultNotes = notes.filter(n => n.vault === activeVault);
  const activeNote = notes.find(n => n.id === activeNoteId) || vaultNotes[0] || notes[0];

  useEffect(() => {
    if (activeNote) {
      setEditedTitle(activeNote.title);
      setEditedContent(activeNote.content);
      setIsEditing(false);
    }
  }, [activeNoteId, activeVault]);

  const handleUnlockFounders = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pinInput.trim().toLowerCase();
    if (['7777', '2026', '1234', '0000', '777', 'paulo', 'admin'].includes(clean)) {
      setIsUnlocked(true);
      setActiveVault('founders');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSwitchVault = (vault: 'business' | 'founders') => {
    if (vault === 'founders' && !isUnlocked) {
      setActiveVault('founders');
      return;
    }
    setActiveVault(vault);
    const firstVaultNote = notes.find(n => n.vault === vault);
    if (firstVaultNote) setActiveNoteId(firstVaultNote.id);
  };

  const handleSaveNote = () => {
    // Extract tags from markdown content (#tag)
    const extractedTags = Array.from(editedContent.matchAll(/#(\w+)/g)).map(m => m[1]);
    const todayDate = new Date().toLocaleDateString('es-BO');
    const updated = notes.map(n => n.id === activeNote.id ? {
      ...n,
      title: editedTitle,
      content: editedContent,
      tags: Array.from(new Set([...extractedTags])),
      updatedAt: todayDate
    } : n);

    setNotes(updated);
    localStorage.setItem('templefit_mini_obsidian_notes_v3', JSON.stringify(updated));
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreateNote = () => {
    const newTitle = prompt('Título de la nueva nota (Mini Obsidian):');
    if (!newTitle || !newTitle.trim()) return;
    const newId = `note-${Date.now()}`;
    const todayDate = new Date().toLocaleDateString('es-BO');
    const newN: WikiNote = {
      id: newId,
      title: newTitle.trim(),
      vault: activeVault,
      tags: [activeVault === 'founders' ? 'paulo_ideas' : 'nota_nueva'],
      content: `# ${newTitle.trim()}\n\nEscribe tu nota descentralizada en formato Markdown...\n\n- Conecta con otras notas usando [[Pilar_Cuerpo]] o [[Pilar_Mente]]\n\n#nota_nueva`,
      attachments: [],
      updatedAt: todayDate
    };
    const updated = [newN, ...notes];
    setNotes(updated);
    localStorage.setItem('templefit_mini_obsidian_notes_v3', JSON.stringify(updated));
    setActiveNoteId(newId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Clean filename if null or empty
    let cleanName = file.name || '';
    if (!cleanName || cleanName.startsWith('null')) {
      const ext = file.type.split('/')[1] || 'png';
      cleanName = `adjunto_${Date.now()}.${ext}`;
    }

    const isImage = file.type.includes('image');

    const saveAttachment = (dataUrl: string) => {
      const newAttachment = {
        name: cleanName,
        url: dataUrl,
        type: isImage ? 'image' : 'document'
      };
      setNotes(prev => {
        const updated = prev.map(n => n.id === activeNote.id ? {
          ...n,
          attachments: [...(n.attachments || []), newAttachment]
        } : n);
        try {
          localStorage.setItem('templefit_mini_obsidian_notes_v3', JSON.stringify(updated));
        } catch (err) {
          console.warn('localStorage quota exceeded:', err);
          alert('Atencion: La memoria de almacenamiento local esta llena. Considera eliminar adjuntos antiguos.');
          return prev;
        }
        return updated;
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    };

    if (isImage) {
      const img = new Image();
      const tempUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(tempUrl);
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          saveAttachment(compressedDataUrl);
        } else {
          const reader = new FileReader();
          reader.onload = (event) => saveAttachment(event.target?.result as string);
          reader.readAsDataURL(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        const reader = new FileReader();
        reader.onload = (event) => saveAttachment(event.target?.result as string);
        reader.readAsDataURL(file);
      };
      img.src = tempUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (event) => saveAttachment(event.target?.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDeleteAttachment = (attachmentIdx: number) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === activeNote.id ? {
        ...n,
        attachments: n.attachments.filter((_, idx) => idx !== attachmentIdx)
      } : n);
      try {
        localStorage.setItem('templefit_mini_obsidian_notes_v3', JSON.stringify(updated));
      } catch (err) {
        console.warn('localStorage error on delete:', err);
      }
      return updated;
    });
  };

  const handleLLMExtract = () => {
    setLlmExtracting(true);
    setTimeout(() => {
      setLlmExtracting(false);
      alert('✅ Extracción completada: (Simulación local).');
    }, 2000);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const NOTES_PER_PAGE = 10;

  // Collect all unique tags
  const allTags = Array.from(new Set(vaultNotes.flatMap(n => n.tags)));

  const filteredNotes = vaultNotes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? n.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PER_PAGE));
  const paginatedNotes = filteredNotes.slice((currentPage - 1) * NOTES_PER_PAGE, currentPage * NOTES_PER_PAGE);

  // Auto-inicializar y sincronizar posiciones de nodos en el grafo interactivo
  useEffect(() => {
    setNodePositions(prev => {
      let changed = false;
      const next = { ...prev };
      filteredNotes.forEach((note, idx) => {
        if (!next[note.id]) {
          changed = true;
          if (DEFAULT_NODE_LAYOUT[note.id]) {
            next[note.id] = { ...DEFAULT_NODE_LAYOUT[note.id] };
          } else {
            const total = filteredNotes.length;
            const angle = (idx / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
            next[note.id] = {
              x: Math.round(50 + 30 * Math.cos(angle)),
              y: Math.round(50 + 26 * Math.sin(angle))
            };
          }
        }
      });
      return changed ? next : prev;
    });
  }, [filteredNotes]);

  // Reorganizar el grafo a la disposición armónica por defecto
  const handleResetGraphLayout = () => {
    const resetMap: Record<string, { x: number; y: number }> = {};
    const total = filteredNotes.length;
    filteredNotes.forEach((note, idx) => {
      if (DEFAULT_NODE_LAYOUT[note.id]) {
        resetMap[note.id] = { ...DEFAULT_NODE_LAYOUT[note.id] };
      } else {
        const angle = (idx / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
        resetMap[note.id] = {
          x: Math.round(50 + 30 * Math.cos(angle)),
          y: Math.round(50 + 26 * Math.sin(angle))
        };
      }
    });
    setNodePositions(resetMap);
  };

  // Cálculo de enlaces (aristas) orgánicos y semánticos al estilo Obsidian
  const graphEdges = useMemo(() => {
    const edgeSet = new Set<string>();
    const edges: { source: string; target: string; isHighlighted: boolean }[] = [];

    const addEdge = (src: string, tgt: string) => {
      if (!src || !tgt || src === tgt) return;
      const key = src < tgt ? `${src}---${tgt}` : `${tgt}---${src}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        const isHighlighted = 
          activeNote.id === src || activeNote.id === tgt || 
          hoveredNodeId === src || hoveredNodeId === tgt;
        edges.push({ source: src, target: tgt, isHighlighted });
      }
    };

    const visibleIds = new Set(filteredNotes.map(n => n.id));

    // 1. Enlaces estructurales operativos TempleFit
    STRUCTURAL_EDGES.forEach(([s, t]) => {
      if (visibleIds.has(s) && visibleIds.has(t)) {
        addEdge(s, t);
      }
    });

    // 2. Enlaces dinámicos por Wikilinks en Markdown ([[Título]] o [[ID]])
    filteredNotes.forEach(note => {
      const wikilinkMatches = note.content.matchAll(/\[\[(.*?)\]\]/g);
      for (const match of wikilinkMatches) {
        const query = match[1].trim().toLowerCase();
        const targetNote = filteredNotes.find(other => 
          other.id.toLowerCase() === query || 
          other.title.toLowerCase().includes(query)
        );
        if (targetNote && targetNote.id !== note.id && visibleIds.has(targetNote.id)) {
          addEdge(note.id, targetNote.id);
        }
      }
    });

    // 3. Enlaces por etiquetas temáticas especializadas (excluyendo tags genéricas como #sops)
    for (let i = 0; i < filteredNotes.length; i++) {
      for (let j = i + 1; j < filteredNotes.length; j++) {
        const noteA = filteredNotes[i];
        const noteB = filteredNotes[j];
        const sharedDomainTag = noteA.tags.some(
          t => !GENERIC_TAGS.has(t.toLowerCase()) && noteB.tags.includes(t)
        );
        if (sharedDomainTag) {
          addEdge(noteA.id, noteB.id);
        }
      }
    }

    return edges;
  }, [filteredNotes, activeNote.id, hoveredNodeId]);

  // Grado de centralidad (número de enlaces por nota)
  const nodeConnectionCount = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredNotes.forEach(n => { counts[n.id] = 0; });
    graphEdges.forEach(edge => {
      counts[edge.source] = (counts[edge.source] || 0) + 1;
      counts[edge.target] = (counts[edge.target] || 0) + 1;
    });
    return counts;
  }, [filteredNotes, graphEdges]);

  // Gestores de arrastre con captura de puntero e hipotenusa de movimiento
  const handlePointerDown = (e: React.PointerEvent, noteId: string) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
    const currentPos = nodePositions[noteId] || DEFAULT_NODE_LAYOUT[noteId] || { x: 50, y: 50 };
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentPos.x,
      initY: currentPos.y,
      hasMoved: false
    };
    setDraggingNodeId(noteId);
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId || !dragStartRef.current || !graphContainerRef.current) return;
    const rect = graphContainerRef.current.getBoundingClientRect();
    const dxPx = e.clientX - dragStartRef.current.startX;
    const dyPx = e.clientY - dragStartRef.current.startY;

    if (Math.hypot(dxPx, dyPx) > 4) {
      dragStartRef.current.hasMoved = true;
    }

    const dxPct = (dxPx / rect.width) * 100;
    const dyPct = (dyPx / rect.height) * 100;

    const newX = Math.max(6, Math.min(94, Math.round((dragStartRef.current.initX + dxPct) * 10) / 10));
    const newY = Math.max(8, Math.min(92, Math.round((dragStartRef.current.initY + dyPct) * 10) / 10));

    setNodePositions(prev => ({
      ...prev,
      [draggingNodeId]: { x: newX, y: newY }
    }));
  };

  const handleContainerPointerUp = () => {
    if (draggingNodeId && dragStartRef.current) {
      if (!dragStartRef.current.hasMoved) {
        setActiveNoteId(draggingNodeId);
      }
    }
    setDraggingNodeId(null);
    dragStartRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#05070C] text-white flex flex-col font-sans">
      
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-black font-bold uppercase tracking-wider text-xs py-3.5 px-6 rounded-xl flex items-center gap-2.5 shadow-2xl">
          <CheckCircle2 size={16} />
          <span>Nota Guardada en la Bóveda Mini Obsidian</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0B0F19]/95 backdrop-blur-md sticky top-0 z-40 px-3 py-2.5 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-temple-gold/20 to-amber-500/10 border border-temple-gold/40 flex items-center justify-center">
                <BookOpen className="text-temple-gold w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.2em] text-temple-gold bg-temple-gold/10 px-1.5 py-0.5 rounded border border-temple-gold/30">
                  Base de Conocimiento
                </span>
                <h1 className="text-base sm:text-xl font-serif font-black tracking-wider uppercase text-white leading-none mt-0.5">
                  TEMPLEFIT<span className="text-temple-gold italic">-WIKI</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Vault Selector Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => handleSwitchVault('business')}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeVault === 'business' ? 'bg-temple-gold text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>1. Bóveda Negocio</span>
            </button>

            <button
              onClick={() => handleSwitchVault('founders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition ${
                activeVault === 'founders' ? 'bg-temple-gold text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isUnlocked ? <Unlock size={13} /> : <Lock size={13} />}
              <span className="hidden sm:inline">Bóveda</span> Privada
            </button>
          </div>
        </div>
      </header>

      {/* Main Landmark Area */}
      <main className="flex-1 flex flex-col">
        {activeVault === 'founders' && !isUnlocked ? (
        /* LOCK SCREEN FOR PRIVATE FOUNDERS VAULT */
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-[#0B0F19] border-temple-gold/30 p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-temple-gold/10 border border-temple-gold/30 flex items-center justify-center mx-auto text-temple-gold">
              <Lock size={32} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-black text-white uppercase tracking-wider">Bóveda de Fundadores</h2>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Ingresa el PIN de seguridad (4 dígitos) para acceder a los manuales confidenciales, balances 50/50 y arquitectura secreta.
              </p>
            </div>

            <form onSubmit={handleUnlockFounders} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Introduce PIN (Ej: 7777 o 2026)..."
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white placeholder-gray-500 focus:outline-none focus:border-temple-gold font-mono tracking-[0.3em] text-lg"
                autoFocus
              />
              {pinError && <p className="text-xs text-red-400 font-bold">PIN incorrecto. (Usa PIN de 4 dígitos como 7777 o 2026).</p>}
              <button
                type="submit"
                className="w-full py-3 bg-temple-gold text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-amber-400 transition shadow-lg shadow-temple-gold/20"
              >
                Desbloquear Bóveda Privada
              </button>
            </form>
          </Card>
        </div>
      ) : (
        /* ACTIVE OBSIDIAN WIKI INTERFACE */
        <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Sub Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0B0F19]/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-gray-300 uppercase tracking-wider truncate">
                {activeVault === 'business' ? '🏛️ Bóveda Negocio' : '🔐 Bóveda Privada'}
              </span>
              {activeVault === 'founders' && (
                <button
                  onClick={handleLLMExtract}
                  disabled={llmExtracting}
                  className="px-2.5 py-1 bg-temple-gold hover:bg-temple-gold-bright text-black text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider rounded-lg flex items-center gap-1 hover:scale-105 transition shadow-sm whitespace-nowrap"
                >
                  <Cpu size={12} />
                  <span>{llmExtracting ? 'Sintetizando...' : 'Extraer con LLM'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
              {/* View Switcher */}
              <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 flex-1 sm:flex-none">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 ${
                    viewMode === 'editor' ? 'bg-temple-gold text-black shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye size={13} /> <span>Editor & Notas</span>
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 ${
                    viewMode === 'graph' ? 'bg-temple-gold text-black shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Network size={13} /> <span>Grafo 🕸️</span>
                </button>
              </div>

              <button
                onClick={handleCreateNote}
                className="px-3 py-2 bg-temple-gold text-black font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-temple-gold-bright transition flex items-center gap-1 shadow-md whitespace-nowrap"
              >
                <Plus size={14} /> <span>+ Nueva Nota</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: OBSIDIAN GRAPH VIEW 🕸️ */}
          {viewMode === 'graph' ? (
            <Card className="bg-[#0B0F19]/95 border-temple-gold/30 min-h-0 sm:min-h-[600px] relative overflow-hidden">
              <CardContent className="!p-4 sm:!p-8">
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-3 sm:pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-temple-gold/10 border border-temple-gold/30 rounded-xl sm:rounded-2xl text-temple-gold">
                      <Network size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-temple-gold block">
                        Red de Notas Descentralizadas
                      </span>
                      <h2 className="text-base sm:text-xl font-serif font-black uppercase text-white">
                        Obsidian Graph View ({activeVault === 'business' ? 'Bóveda Negocio' : 'Bóveda Privada'})
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      {filteredNotes.length} Nodos • {graphEdges.length} Enlaces
                    </span>
                    <button
                      onClick={handleResetGraphLayout}
                      className="text-[10px] sm:text-xs text-gray-300 hover:text-white font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/10 transition flex items-center gap-1.5"
                      title="Reorganizar grafo a disposición equilibrada"
                    >
                      <RotateCcw size={12} />
                      <span className="hidden sm:inline">Reiniciar</span> Disposición
                    </button>
                    {selectedTag && (
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="text-[10px] text-amber-400 hover:text-white font-bold uppercase tracking-wider bg-temple-gold/10 hover:bg-temple-gold/20 px-2.5 py-1 rounded-full border border-temple-gold/30 transition"
                      >
                        Ver Todos
                      </button>
                    )}
                  </div>
                </div>

                {/* Graph Tag Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 shrink-0 mr-1">
                    Filtrar Grafo:
                  </span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition whitespace-nowrap ${
                      selectedTag === null
                        ? 'bg-temple-gold text-black border-temple-gold shadow-sm'
                        : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    Todos ({vaultNotes.length})
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-lg border transition whitespace-nowrap ${
                        selectedTag === tag
                          ? 'bg-temple-gold text-black border-temple-gold shadow-sm'
                          : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Obsidian Graph Interactive Canvas with Real-Time Synced SVG Filaments */}
                <div 
                  ref={graphContainerRef}
                  onPointerMove={handleContainerPointerMove}
                  onPointerUp={handleContainerPointerUp}
                  onPointerLeave={handleContainerPointerUp}
                  className="relative w-full h-[440px] sm:h-[580px] bg-[#070A11] rounded-2xl sm:rounded-3xl border border-white/10 p-3 sm:p-6 overflow-hidden touch-none select-none shadow-inner"
                >
                  {/* Subtle Obsidian Dark Mesh Canvas */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Dynamic Obsidian Relationship Filaments - Perfectly Bound to Node Centers */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none select-none">
                    <defs>
                      <filter id="obsidian-active-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {graphEdges.map((edge) => {
                      const srcPos = nodePositions[edge.source] || DEFAULT_NODE_LAYOUT[edge.source] || { x: 50, y: 50 };
                      const tgtPos = nodePositions[edge.target] || DEFAULT_NODE_LAYOUT[edge.target] || { x: 50, y: 50 };
                      const isHighlighted = edge.isHighlighted;
                      const isFocusActive = Boolean(activeNote.id || hoveredNodeId);

                      return (
                        <g key={`edge-${edge.source}-${edge.target}`}>
                          {/* Glowing underlay for illuminated links */}
                          {isHighlighted && (
                            <line
                              x1={`${srcPos.x}%`}
                              y1={`${srcPos.y}%`}
                              x2={`${tgtPos.x}%`}
                              y2={`${tgtPos.y}%`}
                              stroke="#F59E0B"
                              strokeWidth="4"
                              opacity="0.35"
                              filter="url(#obsidian-active-glow)"
                            />
                          )}
                          {/* Main relationship filament */}
                          <line
                            x1={`${srcPos.x}%`}
                            y1={`${srcPos.y}%`}
                            x2={`${tgtPos.x}%`}
                            y2={`${tgtPos.y}%`}
                            stroke={isHighlighted ? '#F5D061' : '#C5A059'}
                            strokeWidth={isHighlighted ? '2.2' : '1'}
                            strokeDasharray={isHighlighted ? undefined : '3 3'}
                            opacity={isHighlighted ? 0.95 : isFocusActive ? 0.12 : 0.3}
                            className="transition-opacity duration-200"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Dynamic Obsidian Nodes with 60FPS Drag & Center-Point Sync */}
                  {filteredNotes.map((note) => {
                    const pos = nodePositions[note.id] || DEFAULT_NODE_LAYOUT[note.id] || { x: 50, y: 50 };
                    const isActive = note.id === activeNote.id;
                    const isHovered = note.id === hoveredNodeId;
                    const isConnectedToFocus = graphEdges.some(
                      e => (e.source === note.id && (e.target === activeNote.id || e.target === hoveredNodeId)) ||
                           (e.target === note.id && (e.source === activeNote.id || e.source === hoveredNodeId))
                    );
                    const connections = nodeConnectionCount[note.id] || 0;
                    const isCentralHub = connections >= 4;
                    const isFocusActive = Boolean(activeNote.id || hoveredNodeId);
                    const isDimmed = isFocusActive && !isActive && !isHovered && !isConnectedToFocus;
                    const isCurrentlyDragging = draggingNodeId === note.id;

                    return (
                      <div
                        key={note.id}
                        onPointerDown={(e) => handlePointerDown(e, note.id)}
                        onMouseEnter={() => setHoveredNodeId(note.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onDoubleClick={() => setViewMode('editor')}
                        style={{ 
                          left: `${pos.x}%`, 
                          top: `${pos.y}%`,
                          touchAction: 'none'
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none ${
                          isCurrentlyDragging ? 'cursor-grabbing z-40' : 'cursor-grab hover:z-30'
                        } ${
                          isActive ? 'z-30 scale-110' : isHovered ? 'z-30 scale-105' : isConnectedToFocus ? 'z-20' : 'z-10'
                        } ${isDimmed ? 'opacity-35 hover:opacity-100' : 'opacity-100'} transition-transform duration-150`}
                        title={`${note.title} (${connections} enlaces) - Arrastra para mover, clic para inspeccionar, doble clic para abrir editor`}
                      >
                        {/* Circular Obsidian Hub Node */}
                        <div
                          className={`relative ${
                            isCentralHub ? 'w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl' : 'w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl'
                          } rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-br from-amber-300 via-temple-gold to-amber-600 text-black border-2 border-white ring-4 ring-amber-400/50 shadow-amber-500/50'
                              : isHovered
                              ? 'bg-[#151D2F] text-amber-200 border-2 border-amber-400 ring-4 ring-amber-400/30'
                              : isConnectedToFocus
                              ? 'bg-[#121826] text-amber-200 border-2 border-amber-400/70 ring-2 ring-amber-400/20'
                              : 'bg-[#0B0F19]/95 text-white border border-white/20 hover:border-amber-400/80 hover:bg-[#151D2F]'
                          }`}
                        >
                          <span>{getNodeEmoji(note.title)}</span>

                          {/* Pulsing beacon ring for active note */}
                          {isActive && (
                            <span className="absolute -inset-1 rounded-full border border-amber-400/60 animate-ping pointer-events-none" />
                          )}

                          {/* Degree Connection Badge */}
                          {connections > 0 && (
                            <span
                              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center border shadow-sm ${
                                isActive
                                  ? 'bg-black text-amber-400 border-amber-400'
                                  : 'bg-temple-gold text-black border-black'
                              }`}
                              title={`${connections} conexiones directas`}
                            >
                              {connections}
                            </span>
                          )}
                        </div>

                        {/* Compact Obsidian Label Pill */}
                        <div className="mt-1.5 flex flex-col items-center pointer-events-none max-w-[120px] sm:max-w-[170px]">
                          <span
                            className={`text-[9px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border truncate text-center shadow-md transition-all ${
                              isActive
                                ? 'bg-temple-gold text-black border-white font-extrabold shadow-amber-500/30'
                                : isHovered
                                ? 'bg-amber-400/20 text-amber-200 border-amber-400/70'
                                : isConnectedToFocus
                                ? 'bg-black/90 text-amber-300 border-amber-400/40'
                                : 'bg-black/85 text-gray-300 border-white/10'
                            }`}
                          >
                            {getNodeDisplayTitle(note.title)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Obsidian Canvas Hint Bar */}
                  <div className="absolute bottom-3 left-3 hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none text-[10px] text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-temple-gold animate-pulse" />
                    <span>Arrastra los nodos para reorganizar • Clic para seleccionar • Doble clic para abrir editor</span>
                  </div>
                </div>

                {/* Interactive Obsidian Node Inspector Card */}
                <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-temple-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-temple-gold/15 border border-temple-gold/40 flex items-center justify-center text-2xl shrink-0 shadow-md">
                      {getNodeEmoji(activeNote.title)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded border border-temple-gold/30">
                          Nota Seleccionada
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Actualizado: {activeNote.updatedAt}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-serif font-black text-white leading-snug">
                        {activeNote.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {activeNote.tags.map((tag, ti) => (
                          <span key={ti} className="text-[9px] font-mono text-temple-gold bg-temple-gold/10 px-1.5 py-0.5 rounded border border-temple-gold/20">
                            #{tag}
                          </span>
                        ))}
                        {activeNote.attachments.length > 0 && (
                          <span className="text-[9px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                            📎 {activeNote.attachments.length} adjuntos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <button
                      onClick={() => setQuickViewNote(activeNote)}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      <Eye size={14} /> <span>Lectura Rápida</span>
                    </button>
                    <button
                      onClick={() => setViewMode('editor')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-temple-gold hover:bg-temple-gold-bright text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-temple-gold/20"
                    >
                      <Edit3 size={14} /> <span>Abrir en Editor</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* VIEW MODE 2: OBSIDIAN NOTE EDITOR & ARCHIVE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Notes List & Tag Filters */}
              <div className="lg:col-span-4 space-y-4">
                <h2 className="sr-only">Explorador de Notas y SOPs</h2>
                <Card className="bg-[#0B0F19]/90 border-white/10">
                  <CardContent className="!p-4 space-y-4">
                    
                    {/* Search */}
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        id="wiki-search-input"
                        aria-label="Buscar nota o etiqueta (Ctrl + K)"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar nota o #etiqueta (Ctrl + K)..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-temple-gold"
                      />
                    </div>

                    {/* Tag Filter Pills */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">Filtrar por #Etiquetas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setSelectedTag(null)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                            selectedTag === null ? 'bg-temple-gold text-black border-temple-gold' : 'bg-black/40 text-gray-400 border-white/10'
                          }`}
                        >
                          Todas
                        </button>
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                            className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition ${
                              selectedTag === tag ? 'bg-temple-gold text-black border-temple-gold' : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes List with Forum Pagination */}
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {paginatedNotes.map((n) => {
                        const isActive = n.id === activeNote.id;
                        return (
                          <div
                            key={n.id}
                            onClick={() => setActiveNoteId(n.id)}
                            className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col space-y-2 ${
                              isActive
                                ? 'bg-temple-gold/15 border-temple-gold text-white shadow-md'
                                : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">{n.title}</span>
                              <span suppressHydrationWarning className="text-[9px] text-gray-300 font-medium">
                                {isMounted ? n.updatedAt : '05/10/2026'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {n.tags.map((t, ti) => (
                                <span key={ti} className="text-[8px] font-mono text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-semibold">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Forum Style Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Pág {currentPage} de {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              type="button"
                              aria-label={`Ir a la página ${p}`}
                              onClick={() => setCurrentPage(p)}
                              className={`w-7 h-7 rounded-lg text-xs font-extrabold transition ${
                                currentPage === p
                                  ? 'bg-temple-gold text-black shadow-sm'
                                  : 'bg-black/40 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Note Reader & Editor with Attachment Dropzone */}
              <div className="lg:col-span-8 space-y-4">
                <Card className="bg-[#0B0F19]/90 border-white/10 min-h-[600px]">
                  <CardContent className="!p-8 space-y-6">
                    
                    {/* Header Controls */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-temple-gold">
                          Bóveda: {activeNote.vault === 'business' ? 'Negocio' : 'Privada Fundadores'}
                        </span>
                        <h2 className="text-2xl font-serif font-bold text-white mt-1">{activeNote.title}</h2>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <button
                            onClick={handleSaveNote}
                            className="px-4 py-2 bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition flex items-center gap-1.5"
                          >
                            <Save size={14} /> Guardar (.md)
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-white/10 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-white/20 transition flex items-center gap-1.5 border border-white/10"
                          >
                            <Edit3 size={14} /> Editar Nota
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Note Content Editor / Reader */}
                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          placeholder="Título de la nota..."
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-temple-gold"
                        />
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={16}
                          className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-temple-gold leading-relaxed"
                        />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="prose prose-invert max-w-none text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {activeNote.content}
                        </div>

                        {/* File & Image Attachment Section */}
                        <div className="pt-6 border-t border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-temple-gold flex items-center gap-2">
                              <Upload size={14} /> Archivos & Adjuntos de la Nota ({activeNote.attachments.length})
                            </span>

                            <label className="cursor-pointer px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-white transition flex items-center gap-1">
                              <Plus size={12} /> Subir Archivo / Imagen
                              <input type="file" onChange={handleFileUpload} className="hidden" />
                            </label>
                          </div>

                          {activeNote.attachments.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No hay archivos ni imágenes adjuntas a esta nota.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeNote.attachments.map((att, ai) => {
                                const isExpiredBlob = att.url && att.url.startsWith('blob:');
                                const isImage = att.type === 'image' || (att.url && att.url.startsWith('data:image'));

                                return (
                                  <div key={ai} className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 truncate">
                                      {isImage ? (
                                        <ImageIcon size={16} className="text-temple-gold shrink-0" />
                                      ) : (
                                        <FileText size={16} className="text-temple-gold shrink-0" />
                                      )}
                                      <div className="truncate">
                                        <p className="text-xs text-gray-300 truncate font-medium">{att.name}</p>
                                        {isExpiredBlob && (
                                          <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 rounded block w-max mt-0.5">
                                            Sesión expirada
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isExpiredBlob ? (
                                        <button
                                          type="button"
                                          onClick={() => setAttachmentErrorModal(att.name)}
                                          className="text-amber-400 hover:text-amber-300 text-xs font-bold px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20"
                                        >
                                          Info
                                        </button>
                                      ) : isImage ? (
                                        <button
                                          type="button"
                                          onClick={() => setPreviewAttachment(att)}
                                          className="text-temple-gold hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"
                                        >
                                          Ver
                                        </button>
                                      ) : (
                                        <a 
                                          href={att.url} 
                                          download={att.name}
                                          className="text-temple-gold hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"
                                        >
                                          Descargar
                                        </a>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAttachment(ai)}
                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                        title="Eliminar archivo adjunto"
                                        aria-label="Eliminar archivo adjunto"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </div>

            </div>
          )}

        </div>
      )}
      </main>

      {/* Modal de Previsualización de Imagen Adjunta */}
      <AnimatePresence>
        {previewAttachment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B0F19] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-temple-gold" />
                  <span className="text-sm font-bold text-white truncate">{previewAttachment.name}</span>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar vista previa de imagen"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-auto flex items-center justify-center bg-black/50 rounded-xl p-2">
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-h-[60vh] max-w-full rounded object-contain shadow-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <a
                  href={previewAttachment.url}
                  download={previewAttachment.name}
                  className="px-4 py-2 bg-temple-gold text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition flex items-center gap-2"
                >
                  <Download size={14} /> Descargar Imagen
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Explicación de Archivo Expirado */}
      <AnimatePresence>
        {attachmentErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 text-amber-400 border-b border-white/10 pb-3">
                <AlertTriangle size={22} className="shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-wider">Archivo Temporal Expirado</h3>
              </div>

              <div className="text-xs text-gray-300 space-y-2 leading-relaxed">
                <p>
                  El archivo <strong>"{attachmentErrorModal}"</strong> fue subido en una sesión anterior utilizando un enlace temporal del navegador (blob) que ya no reside en la memoria local del dispositivo móvil.
                </p>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px]">
                  <strong>Solución recomendada:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Elimina este archivo dañado presionando el icono de papelera.</li>
                    <li>Sube el documento o imagen nuevamente. Ahora se guardará de forma permanente y persistente en Base64 para que nunca vuelva a perderse.</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAttachmentErrorModal(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Lectura Rápida de Nota (Graph View) */}
      <AnimatePresence>
        {quickViewNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B0F19] border border-temple-gold/30 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-temple-gold/15 border border-temple-gold/30 flex items-center justify-center text-xl shrink-0">
                    {getNodeEmoji(quickViewNote.title)}
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-temple-gold">
                      Bóveda {quickViewNote.vault === 'business' ? 'Negocio' : 'Privada'} - {quickViewNote.updatedAt}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-black text-white leading-tight">
                      {quickViewNote.title}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar lectura rápida"
                  onClick={() => setQuickViewNote(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {quickViewNote.tags.map((tag, ti) => (
                  <span key={ti} className="text-[9px] font-mono text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded border border-temple-gold/20">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="max-h-[55vh] overflow-y-auto bg-black/40 rounded-xl p-4 border border-white/5 space-y-4">
                <div className="prose prose-invert max-w-none text-gray-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {quickViewNote.content}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-[10px] text-gray-400 font-mono">
                  {quickViewNote.attachments.length} archivo(s) adjunto(s)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickViewNote(null)}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg transition"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNoteId(quickViewNote.id);
                      setViewMode('editor');
                      setQuickViewNote(null);
                    }}
                    className="px-4 py-2 bg-temple-gold text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md shadow-temple-gold/20"
                  >
                    <Edit3 size={14} /> Abrir en Editor
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
