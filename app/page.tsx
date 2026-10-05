'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Plus, Edit3, Save, Sparkles, FileText, CheckCircle2, 
  Network, Compass, Eye, Upload, Tag, Trash2, ArrowRight, Download, 
  Image as ImageIcon, X, Sliders, ExternalLink, Command, ChevronRight, 
  Layers, FileDown, RotateCcw, AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { WikiNote } from '../components/obsidian/types';
import ForceGraph from '../components/obsidian/ForceGraph';
import MarkdownReader from '../components/obsidian/MarkdownReader';
import BacklinksPanel from '../components/obsidian/BacklinksPanel';
import OutlinePanel from '../components/obsidian/OutlinePanel';
import PropertiesPanel from '../components/obsidian/PropertiesPanel';
import CommandPalette from '../components/obsidian/CommandPalette';

// Unicode and Emoji Safe Extraction Helpers
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

// Bóveda Unificada de Paulo - TempleFit Maestro
const DEFAULT_NOTES: WikiNote[] = [
  {
    id: 'note-manual-orden',
    title: '📋 Manual de cómo se puede trabajar más ordenado?',
    tags: ['sops', 'orden', 'organizacion', 'checklist', 'control'],
    content: `# 📋 Manual de cómo se puede trabajar más ordenado?
Guía maestra de estandarización, orden operativo y control sistemático para el equipo y operaciones de Paulo en TempleFit.

> [!NOTE]
> Este manual rige la rutina diaria del gimnasio y se conecta directamente con [[📘 1. Modelo Bicéfalo y Espacios]] y [[⏱️ 3. Ritmos Semanales y Festivales]].

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
Regla de oro: Ningún prospecto se queda más de 24 horas sin respuesta humana cálida. Se ejecuta a través de la [[🧲 4. Red de Embudos de Venta]].

- [ ] **Revisión Matutina del Embudo**:
  - Filtrar prospectos con estado "Nuevo" y enviar mensaje de bienvenida personalizado por WhatsApp.
  - Recordar la invitación a la clase de prueba CristoFit Camp del sábado (06:00 AM) documentada en [[⏱️ 3. Ritmos Semanales y Festivales]].
- [ ] **Día Sábado Comunitario (Regla Anti-Ventas)**:
  - Respetar el bloqueo estricto de ventas en sábado: el sábado es exclusivamente para comunidad, sudor, técnica y nutrición. No presionar ventas ese día.
- [ ] **Auditoría de Prospectos (>14 días)**:
  - Revisar contactos sin respuesta en 14 días. Reclasificar a "Perdido" o activar mensaje de cortesía F2.

---

### 3. 🥤 CONTROL DE SNACK BAR SIN DESCUADRES
El 90% del desorden financiero surge de consumos no anotados o cobros postergados. Vinculado a [[🎯 2. El Modelo Hub (Las 4 Unidades)]].

- [ ] **Registro en el Acto**:
  - Todo consumo de suplemento, barra o batido se anota inmediatamente en la ficha del atleta.
  - Jamás confiar en la memoria para anotar consumos al final de la jornada.
- [ ] **Canales de Cobro Claros**:
  - Ofrecer siempre las dos opciones: **QR Simple** (transferencia bancaria instantánea) o **Efectivo** (en mano).
  - Para QR Simple, solicitar al atleta que muestre la confirmación en pantalla antes de dar por saldado el monto.
- [ ] **Saldado de Deudas**:
  - Cuando un atleta liquide su deuda pendiente o deje saldo a favor, registrar el abono con el método exacto (QR Simple o Efectivo).

---

### 4. 📅 SEGUIMIENTO DE LOS 12 HÁBITOS DIARIOS EN EL CALENDARIO
No se puede mejorar lo que no se mide día a día. Se audita en [[📊 5. Bases de Datos y Métricas]] y se distribuye con [[🛡️ 6. Modelo de los 12 Discípulos]].

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
  - Cerrar jaula, apagar sistemas y respaldar notas operativas en esta Bóveda.`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-1',
    title: '📘 1. Modelo Bicéfalo y Espacios',
    tags: ['sops', 'arquitectura', 'modelo'],
    content: `# 📘 1. Modelo Bicéfalo y Espacios
El gimnasio opera con un modelo asociado donde nosotros manejamos 3 Niveles Operativos:
- **Fase 1: Iniciación**: Acondicionamiento y adaptación muscular básica.
- **Fase 2: Desarrollo**: Aumento de cargas, hipertrofia funcional y técnica.
- **Fase 3: Perfeccionamiento**: Potencia, atletas de competencia y élite.

> [!TIP]
> Repartición de gimnasio: 30% del margen neto para el local asociado y 70% reinversión/hub.

Este modelo nutre directamente a [[🎯 2. El Modelo Hub (Las 4 Unidades)]] y organiza la estructura humana con [[🛡️ 6. Modelo de los 12 Discípulos]].
Para el orden del día a día, remitirse a [[📋 Manual de cómo se puede trabajar más ordenado?]].`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-2',
    title: '🎯 2. El Modelo Hub (Las 4 Unidades)',
    tags: ['sops', 'hub', 'unidades'],
    content: `# 🎯 2. El Modelo Hub
El ecosistema central de TempleFit ideado por Paulo integra 4 unidades de monetización continua:
1. **Centro de Entrenamiento**: El motor de adquisición y retención.
2. **Barra Nutricional Integrada (Snack Bar)**: Suplementos, batidos y alimentación pre/post entreno.
3. **Apparel (Marca de Ropa)**: Identidad, comunidad y merchandising exclusivo.
4. **Medicina Preventiva**: Fisioterapia, kinesiología y medicina deportiva preventiva.

Todo alumno debe transicionar por estas unidades (Cross-Selling natural).
- Se conecta con [[⏱️ 3. Ritmos Semanales y Festivales]] para activación comunitaria.
- Se nutre del tráfico de [[🧲 4. Red de Embudos de Venta]].`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-3',
    title: '⏱️ 3. Ritmos Semanales y Festivales',
    tags: ['sops', 'ritmos', 'sabados'],
    content: `# ⏱️ 3. Ritmos Semanales y Festivales
Calendario de eventos y cadencias de impacto para la comunidad TempleFit:
- **Sábados CristoFit Camp**: Bloques de Fuerza, Comunidad, Catering, Técnica, Cardio, Show Fit.
  - Regla: Cero presión de ventas los sábados; enfoque 100% en sudor y afecto.
- **Festivales Trimestrales**: Corona de Victoria y Celebración de Vida.
- **Neuro-Entrenamiento de Impacto en Ventas**: Programa formativo continuo de 630 horas.

Coordina directamente con [[🧲 4. Red de Embudos de Venta]] para la reactivación de atletas y el [[📋 Manual de cómo se puede trabajar más ordenado?]].`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-4',
    title: '🧲 4. Red de Embudos de Venta',
    tags: ['sops', 'ventas', 'embudos'],
    content: `# 🧲 4. Red de Embudos de Venta
Estructura automatizada y humana de adquisición y recuperación de atletas:
- **F1 Conversión Inicial**: 5 correos / WhatsApps en 7 días.
  - Lead Magnet: 1 semana gratis de entrenamiento + 20% Dcto en Snack Bar.
- **F2 Recuperación (Recovery)**: Rescate de alumnos desertores o inactivos:
  - 24 horas: Gym check-in.
  - 48 horas: Snack Bar cortesía.
  - 72 horas: Evaluación en Medicina Preventiva.
- **F3 Onboarding**: 60% de conversión garantizada de Gym hacia consumo en Snack Bar.

Los resultados numéricos se consolidan cada lunes en [[📊 5. Bases de Datos y Métricas]].`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-5',
    title: '📊 5. Bases de Datos y Métricas',
    tags: ['sops', 'metricas', 'control'],
    content: `# 📊 5. Bases de Datos y Métricas de Control
Panel de control numérico y auditoría para Paulo y el equipo de liderazgo:
- **Checklist 6 Días Operativos**: Cumplimiento del [[📋 Manual de cómo se puede trabajar más ordenado?]].
- **Corte Ejecutivo**: Lunes 8:00 AM puntual:
  - Ingresos brutos y netos.
  - Vidas impactadas y nuevas altas.
  - Margen neto operativo.
- **Regla 3-3-3**: Alerta temprana ante 3 días consecutivos de estancamiento.
- **NPS (Net Promoter Score)**: Si baja de 7, se activa intervención inmediata en los escuadrones de [[🛡️ 6. Modelo de los 12 Discípulos]].`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-6',
    title: '🛡️ 6. Modelo de los 12 Discípulos',
    tags: ['sops', 'escuadrones', 'liderazgo'],
    content: `# 🛡️ 6. Modelo de los 12 Discípulos (Escuadrones)
Estructura celular descentralizada de formación y liderazgo en TempleFit:
- **Brigadas Independientes**: 25 grupos activos en el Hub.
- **Límite Estricto**: Máximo 12 atletas por escuadrón para garantizar control de comunidad y atención fraternal.
- **Meta Anual**: 300 atletas certificados en el primer año.
- **Monitoreo**: Se reporta semanalmente en [[📊 5. Bases de Datos y Métricas]] y retroalimenta al [[📘 1. Modelo Bicéfalo y Espacios]].`,
    attachments: [],
    updatedAt: '05/10/2026'
  },
  {
    id: 'note-sops-7',
    title: '💰 7. Marco Corporativo (Regla 50/50)',
    tags: ['estrategia', 'finanzas', 'corporativo'],
    content: `# 💰 7. Marco Corporativo (Distribución de Utilidades)
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

- Conecta con la arquitectura de [[📘 1. Modelo Bicéfalo y Espacios]] y las metas de [[📊 5. Bases de Datos y Métricas]].`,
    attachments: [],
    updatedAt: '05/10/2026'
  }
];

export default function TempleWikiApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [notes, setNotes] = useState<WikiNote[]>(DEFAULT_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>('note-sops-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // View mode: 'editor' | 'graph-global' | 'graph-local'
  const [viewMode, setViewMode] = useState<'editor' | 'graph-global' | 'graph-local'>('editor');
  const [editorSubMode, setEditorSubMode] = useState<'read' | 'edit'>('read');

  // Editing state
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Nota Guardada en la Bóveda');

  // Modals & Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<{ name: string; url: string; type: string } | null>(null);
  const [attachmentErrorModal, setAttachmentErrorModal] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // 1. Initial Load from LocalStorage (with backwards compatibility)
  useEffect(() => {
    setIsMounted(true);
    const saved = 
      localStorage.getItem('templefit_paulo_obsidian_notes_v4') ||
      localStorage.getItem('templefit_mini_obsidian_notes_v3') || 
      localStorage.getItem('templefit_mini_obsidian_notes_v2');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, WikiNote>();
          DEFAULT_NOTES.forEach(d => map.set(d.id, d));
          parsed.forEach((p: any) => {
            if (p && p.id) {
              const base = map.get(p.id) || p;
              let date = p.updatedAt;
              if (!date || date === 'Hoy' || date === '21/8/2026') {
                date = new Date().toLocaleDateString('es-BO');
              }
              map.set(p.id, { ...base, ...p, updatedAt: date });
            }
          });
          const merged = Array.from(map.values());
          setNotes(merged);
          localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(merged));
          return;
        }
      } catch (e) {}
    }

    setNotes(DEFAULT_NOTES);
    localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(DEFAULT_NOTES));
  }, []);

  // 2. Keyboard shortcuts (Ctrl+P, Ctrl+O, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'o' || e.key === 'k')) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active Note reference
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || notes[0] || DEFAULT_NOTES[0];
  }, [notes, activeNoteId]);

  // Sync editor fields when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditedTitle(activeNote.title);
      setEditedContent(activeNote.content);
      // Default to reading view unless explicitly editing
      setEditorSubMode('read');
    }
  }, [activeNoteId]);

  // Save changes to note
  const handleSaveNote = () => {
    const extractedTags = Array.from(editedContent.matchAll(/#(\w+)/g)).map(m => m[1]);
    const allTags = Array.from(new Set([...activeNote.tags, ...extractedTags]));
    const todayDate = new Date().toLocaleDateString('es-BO');

    const updated = notes.map(n => n.id === activeNote.id ? {
      ...n,
      title: editedTitle.trim() || n.title,
      content: editedContent,
      tags: allTags,
      updatedAt: todayDate
    } : n);

    setNotes(updated);
    try {
      localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(updated));
    } catch (e) {}

    setEditorSubMode('read');
    setToastMessage('Nota guardada en la Bóveda de Paulo');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Create new note
  const handleCreateNote = (suggestedTitle?: string) => {
    const title = suggestedTitle || prompt('Título de la nueva nota en la Bóveda de Paulo:');
    if (!title || !title.trim()) return;

    const newId = `note-${Date.now()}`;
    const today = new Date().toLocaleDateString('es-BO');
    const newNote: WikiNote = {
      id: newId,
      title: title.trim(),
      tags: ['nueva_nota', 'operaciones'],
      content: `# ${title.trim()}\n\nEscribe tu conocimiento o SOP aquí en formato Markdown de Obsidian...\n\n- Conecta con otras notas usando [[1. Modelo Bicéfalo y Espacios]] o [[Manual de cómo se puede trabajar más ordenado?]]\n\n#operaciones`,
      attachments: [],
      updatedAt: today
    };

    const nextNotes = [newNote, ...notes];
    setNotes(nextNotes);
    try {
      localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(nextNotes));
    } catch (e) {}

    setActiveNoteId(newId);
    setViewMode('editor');
    setEditorSubMode('edit');
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) {
      alert('La bóveda debe contener al menos una nota.');
      return;
    }
    if (!confirm('¿Deseas eliminar esta nota permanentemente de la Bóveda?')) return;

    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    try {
      localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(remaining));
    } catch (e) {}

    setActiveNoteId(remaining[0].id);
  };

  // Export current note as .md file
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
    const cleanFileName = activeNote.title.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'nota';
    link.download = `${cleanFileName}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export entire vault backup as JSON
  const handleExportVaultBackup = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `templefit_boveda_paulo_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Attachment upload with auto canvas compression to respect quota
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

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
          localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(updated));
        } catch (err) {
          alert('Atención: La memoria local está llena. Considera eliminar adjuntos antiguos.');
          return prev;
        }
        return updated;
      });

      setToastMessage('Archivo adjuntado a la nota');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    };

    if (isImage) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let w = img.width;
        let h = img.height;
        const maxDim = 1280;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((maxDim * h) / w);
            w = maxDim;
          } else {
            w = Math.round((maxDim * w) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          saveAttachment(canvas.toDataURL('image/jpeg', 0.78));
        } else {
          const reader = new FileReader();
          reader.onload = ev => saveAttachment(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      };
      img.src = objectUrl;
    } else {
      const reader = new FileReader();
      reader.onload = ev => saveAttachment(ev.target?.result as string);
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const handleDeleteAttachment = (idx: number) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === activeNote.id ? {
        ...n,
        attachments: n.attachments.filter((_, i) => i !== idx)
      } : n);
      try {
        localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Toggle checklist checkbox directly in markdown
  const handleToggleCheckbox = (lineIndex: number, newChecked: boolean) => {
    const lines = activeNote.content.split('\n');
    if (lines[lineIndex]) {
      const current = lines[lineIndex];
      lines[lineIndex] = newChecked
        ? current.replace(/^-\s*\[\s*\]/, '- [x]')
        : current.replace(/^-\s*\[[xX]\]/, '- [ ]');
      const updatedContent = lines.join('\n');

      setNotes(prev => {
        const next = prev.map(n => n.id === activeNote.id ? { ...n, content: updatedContent } : n);
        try {
          localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      setEditedContent(updatedContent);
    }
  };

  // Tag Management in Properties
  const handleAddTag = (tag: string) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === activeNote.id ? { ...n, tags: Array.from(new Set([...n.tags, tag])) } : n);
      try {
        localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleRemoveTag = (tag: string) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === activeNote.id ? { ...n, tags: n.tags.filter(t => t !== tag) } : n);
      try {
        localStorage.setItem('templefit_paulo_obsidian_notes_v4', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Filtered Notes for the Sidebar
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? n.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  // Unique Tags in Vault
  const allVaultTags = useMemo(() => {
    return Array.from(new Set(notes.flatMap(n => n.tags)));
  }, [notes]);

  return (
    <div className="min-h-screen bg-[#05070C] text-white flex flex-col font-sans select-none">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-black font-bold uppercase tracking-wider text-xs py-3.5 px-6 rounded-xl flex items-center gap-2.5 shadow-2xl">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Obsidian Main Top Header */}
      <header className="border-b border-white/10 bg-[#0B0F19]/95 backdrop-blur-md sticky top-0 z-40 px-3 py-2.5 sm:px-6 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo & Vault Identity */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-temple-gold/25 to-amber-500/10 border border-temple-gold/40 flex items-center justify-center shadow-md shadow-temple-gold/10">
                <BookOpen className="text-temple-gold w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.2em] text-temple-gold bg-temple-gold/10 px-1.5 py-0.5 rounded border border-temple-gold/30">
                    Bóveda Paulo • Obsidian
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                    {notes.length} notas
                  </span>
                </div>
                <h1 className="text-base sm:text-xl font-serif font-black tracking-wider uppercase text-white leading-none mt-0.5">
                  TEMPLEFIT<span className="text-temple-gold italic">-WIKI</span>
                </h1>
              </div>
            </div>

            {/* Quick Palette Button (Mobile) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
              title="Abrir Comandos (Ctrl+P)"
            >
              <Command size={16} />
            </button>
          </div>

          {/* Quick Switcher Search Bar (Desktop) */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center justify-between w-72 lg:w-96 bg-black/60 hover:bg-black/80 border border-white/10 hover:border-temple-gold/40 px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 transition shadow-inner"
          >
            <div className="flex items-center gap-2 truncate">
              <Search size={14} className="text-temple-gold shrink-0" />
              <span className="truncate">Buscar notas, wikilinks o comandos...</span>
            </div>
            <kbd className="text-[10px] font-mono text-gray-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded shrink-0">
              Ctrl+P
            </kbd>
          </button>

          {/* View Modes & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                  viewMode === 'editor' ? 'bg-temple-gold text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText size={13} /> <span>Editor</span>
              </button>

              <button
                onClick={() => setViewMode('graph-global')}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                  viewMode === 'graph-global' ? 'bg-temple-gold text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Network size={13} /> <span>Grafo Global</span>
              </button>

              <button
                onClick={() => setViewMode('graph-local')}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                  viewMode === 'graph-local' ? 'bg-temple-gold text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Compass size={13} /> <span>Grafo Local</span>
              </button>
            </div>

            <button
              onClick={() => handleCreateNote()}
              className="px-3.5 py-2 bg-temple-gold text-black font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md shadow-temple-gold/20"
            >
              <Plus size={14} /> <span>+ Nota</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
        
        {/* VIEW MODE 1: OBSIDIAN GRAPH VIEW (GLOBAL O LOCAL) */}
        {viewMode === 'graph-global' || viewMode === 'graph-local' ? (
          <Card className="bg-[#0B0F19]/95 border-temple-gold/30 relative overflow-hidden">
            <CardContent className="!p-4 sm:!p-6 space-y-4">
              <ForceGraph
                notes={notes}
                activeNoteId={activeNote.id}
                onSelectNote={(id) => setActiveNoteId(id)}
                onOpenEditor={() => setViewMode('editor')}
                mode={viewMode === 'graph-local' ? 'local' : 'global'}
                onToggleMode={(m) => setViewMode(m === 'local' ? 'graph-local' : 'graph-global')}
                getNodeEmoji={getNodeEmoji}
                getNodeDisplayTitle={getNodeDisplayTitle}
              />

              {/* Inspector Card below Graph */}
              <div className="p-4 rounded-2xl bg-black/60 border border-temple-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-temple-gold/15 border border-temple-gold/40 flex items-center justify-center text-2xl shrink-0 shadow-md">
                    {getNodeEmoji(activeNote.title)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded border border-temple-gold/30">
                        Nota en Foco
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <button
                    onClick={() => setViewMode('editor')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-temple-gold hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-temple-gold/20"
                  >
                    <Edit3 size={14} /> <span>Abrir en Editor Obsidian</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* VIEW MODE 2: OBSIDIAN DUAL-PANE NOTE ENGINE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Vault File Explorer & Search */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="bg-[#0B0F19]/90 border-white/10">
                <CardContent className="!p-4 space-y-4">
                  
                  {/* Search inside Vault */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar nota o contenido..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-temple-gold"
                    />
                  </div>

                  {/* Tag Filter Pills */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block">
                      Filtrar por Etiquetas:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      <button
                        onClick={() => setSelectedTag(null)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition ${
                          selectedTag === null ? 'bg-temple-gold text-black border-temple-gold' : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                        }`}
                      >
                        Todas ({notes.length})
                      </button>
                      {allVaultTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-lg border transition ${
                            selectedTag === tag ? 'bg-temple-gold text-black border-temple-gold' : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes File List */}
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                    {filteredNotes.map(n => {
                      const isActive = n.id === activeNote.id;
                      return (
                        <div
                          key={n.id}
                          onClick={() => setActiveNoteId(n.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col space-y-1.5 ${
                            isActive
                              ? 'bg-temple-gold/15 border-temple-gold text-white shadow-md'
                              : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">
                              {n.title}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono shrink-0 ml-2">
                              {n.updatedAt}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {n.tags.slice(0, 3).map((t, ti) => (
                              <span key={ti} className="text-[8px] font-mono text-amber-300 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20">
                                #{t}
                              </span>
                            ))}
                            {n.attachments.length > 0 && (
                              <span className="text-[8px] text-gray-400">
                                📎 {n.attachments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vault Backup Footer */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <button
                      onClick={handleExportVaultBackup}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl transition flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Download size={13} className="text-temple-gold" />
                      <span>Descargar Bóveda (JSON)</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Note Viewer, Editor, Backlinks & Outline */}
            <div className="lg:col-span-8 space-y-4">
              <Card className="bg-[#0B0F19]/90 border-white/10 min-h-[640px]">
                <CardContent className="!p-4 sm:!p-6 space-y-5">
                  
                  {/* Note Header & Actions Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-temple-gold">
                          Bóveda Paulo • TempleFit
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {activeNote.updatedAt}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
                        {activeNote.title}
                      </h2>
                    </div>

                    {/* Mode Toggles & Export */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Reading vs Edit Mode Toggle */}
                      <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5">
                        <button
                          onClick={() => setEditorSubMode('read')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            editorSubMode === 'read' ? 'bg-temple-gold text-black shadow-sm' : 'text-gray-400 hover:text-white'
                          }`}
                          title="Vista de Lectura (Markdown renderizado)"
                        >
                          <Eye size={13} /> <span className="hidden sm:inline">Lectura</span>
                        </button>
                        <button
                          onClick={() => setEditorSubMode('edit')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            editorSubMode === 'edit' ? 'bg-temple-gold text-black shadow-sm' : 'text-gray-400 hover:text-white'
                          }`}
                          title="Modo Edición (Markdown fuente)"
                        >
                          <Edit3 size={13} /> <span className="hidden sm:inline">Editar</span>
                        </button>
                      </div>

                      {/* Export to .md */}
                      <button
                        onClick={handleExportCurrentNote}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl transition"
                        title="Exportar archivo Markdown (.md)"
                      >
                        <FileDown size={14} className="text-temple-gold" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteNote(activeNote.id)}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 rounded-xl transition"
                        title="Eliminar nota"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Obsidian Properties Panel (Frontmatter) */}
                  <PropertiesPanel
                    note={activeNote}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                  />

                  {/* Note Content (Reading Mode vs Live Editor) */}
                  {editorSubMode === 'edit' ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          Título del Documento:
                        </label>
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={e => setEditedTitle(e.target.value)}
                          placeholder="Título de la nota..."
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-temple-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                            Cuerpo Markdown:
                          </label>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Escribe [[Título]] para enlazar notas
                          </span>
                        </div>
                        <textarea
                          value={editedContent}
                          onChange={e => setEditedContent(e.target.value)}
                          rows={16}
                          className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-temple-gold leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditorSubMode('read')}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveNote}
                          className="px-5 py-2 bg-temple-gold hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-temple-gold/20"
                        >
                          <Save size={14} /> <span>Guardar en Bóveda</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Reading View with Wikilinks and Outline */
                    <div className="space-y-6">
                      {/* Document Outline (Headings Navigation) */}
                      <OutlinePanel content={activeNote.content} />

                      {/* Markdown Body */}
                      <div className="p-4 bg-black/30 rounded-2xl border border-white/5 min-h-[220px]">
                        <MarkdownReader
                          content={activeNote.content}
                          notes={notes}
                          onNavigate={(id) => setActiveNoteId(id)}
                          onCreateMissingNote={(title) => handleCreateNote(title)}
                          onToggleCheckbox={handleToggleCheckbox}
                        />
                      </div>
                    </div>
                  )}

                  {/* Obsidian Backlinks & Outgoing Connections Panel */}
                  <BacklinksPanel
                    activeNote={activeNote}
                    allNotes={notes}
                    onNavigate={(id) => setActiveNoteId(id)}
                  />

                  {/* Attachments Section */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-temple-gold flex items-center gap-2">
                        <ImageIcon size={14} /> Archivos y Adjuntos ({activeNote.attachments.length})
                      </span>
                      <label className="cursor-pointer px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-white transition flex items-center gap-1">
                        <Upload size={12} /> Subir Imagen o Archivo
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {activeNote.attachments.length === 0 ? (
                      <p className="text-xs text-gray-500 italic pl-1">
                        No hay archivos ni imágenes adjuntas en esta nota.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeNote.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <ImageIcon size={15} className="text-temple-gold shrink-0" />
                              <span className="text-xs text-gray-300 truncate font-medium">
                                {att.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => setPreviewAttachment(att)}
                                className="text-temple-gold hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10"
                              >
                                Ver
                              </button>
                              <a
                                href={att.url}
                                download={att.name}
                                className="text-temple-gold hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10"
                              >
                                Descargar
                              </a>
                              <button
                                onClick={() => handleDeleteAttachment(idx)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                title="Eliminar adjunto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Obsidian Command Palette (Ctrl+P / Ctrl+O) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        onSelectNote={(id) => {
          setActiveNoteId(id);
          setViewMode('editor');
        }}
        onOpenGlobalGraph={() => setViewMode('graph-global')}
        onOpenLocalGraph={() => setViewMode('graph-local')}
        onCreateNewNote={() => handleCreateNote()}
        onToggleEditMode={() => setEditorSubMode(prev => prev === 'read' ? 'edit' : 'read')}
        onExportCurrentNote={handleExportCurrentNote}
        onExportVaultBackup={handleExportVaultBackup}
      />

      {/* Attachment Image Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B0F19] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm font-bold text-white truncate">
                {previewAttachment.name}
              </span>
              <button
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
          </div>
        </div>
      )}
    </div>
  );
}
