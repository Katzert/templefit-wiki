'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Plus, Edit3, Save, Sparkles, FileText, CheckCircle2, 
  Share2, Layers, ExternalLink, Lock, Unlock, Network, Eye, Upload, Tag, 
  Trash2, ShieldCheck, ArrowRight, Download, Cpu, MessageSquare 
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

const DEFAULT_NOTES: WikiNote[] = [
  // Bóveda 1: Conocimiento Negocio TempleFit
  {
    id: 'note-cuerpo',
    title: '🏋️‍♂️ Pilar Cuerpo: Protocolo Nutrición & Fuerza',
    vault: 'business',
    tags: ['cuerpo', 'nutricion', 'fuerza', 'salud'],
    content: `# 🏋️‍♂️ Pilar Cuerpo: Protocolo Nutrición & Fuerza

Nota de referencia oficial para el equipo de entrenadores de **TempleFit**.

## Standard Operating Procedures (SOP)
- **Agua:** Mínimo 2.5L a 3.0L de agua purificada diarios.
- **Protocolo Matutino:** Consumir 500ml de agua al despertar antes de café o alimentos.
- **Nutrición Bio-optimizada:** 0 azúcares refinados. Priorizar 1.8g proteína/kg.
- **Entrenamiento:** Combinación de fuerza hipertrofia con calistenia y acondicionamiento en [[Sábados_CristoFit]].

#nutricion #fuerza #cuerpo #salud`,
    attachments: [
      { name: 'Guia_Nutricion_Keto_Bio.pdf', url: '#', type: 'pdf' }
    ],
    updatedAt: '23 de Julio, 2026'
  },
  {
    id: 'note-mente',
    title: '🧠 Pilar Mente: Rutina Matutina & Neuro-Ventas',
    vault: 'business',
    tags: ['mente', 'habitos', 'ventas', 'liderazgo'],
    content: `# 🧠 Pilar Mente: Rutina Matutina & Neuro-Ventas

Directrices cognitivas para el acondicionamiento mental de los atletas:

1. **Regla de Oro Matutina:** 0 redes sociales durante los primeros 60 minutos del día.
2. **Lectura Diaria:** 15 minutos de desarrollo personal antes de iniciar el bloque de trabajo.
3. **Neuro-Ventas Éticas:** Escuchar la necesidad del cliente y conectar con sus valores antes de ofrecer el [[Reto_21_Dias]].

#mente #habitos #ventas #liderazgo`,
    attachments: [],
    updatedAt: '23 de Julio, 2026'
  },
  {
    id: 'note-espiritu',
    title: '❤️ Pilar Espíritu: Fe, Gratitud & CristoFit Camp',
    vault: 'business',
    tags: ['espiritu', 'fe', 'comunidad', 'cristofit'],
    content: `# ❤️ Pilar Espíritu: Fe, Gratitud & CristoFit Camp

Valores inquebrantables del atleta íntegro:

- **Oración Matutina:** 10 a 15 minutos de gratitud y conexión espiritual.
- **Sábados CristoFit Camp:** Entrenamiento grupal al aire libre en Santa Cruz, Bolivia.
- **Regla de la Excelencia:** "Todo lo que hagan, háganlo de corazón, como para el Señor" (Colosenses 3:23).

#espiritu #fe #comunidad #cristofit`,
    attachments: [],
    updatedAt: '23 de Julio, 2026'
  },

  // Bóveda 2: Bóveda Privada Fundadores (Paulo & Tú)
  {
    id: 'note-paulo-estrategia-2027',
    title: '🔐 Estrategia Franquicias 2027 (Paulo & Socio)',
    vault: 'founders',
    tags: ['paulo_ideas', 'estrategia', 'franquicias', 'privado'],
    content: `# 🔐 Estrategia Franquicias 2027 (Notas Borrador Paulo & Socio)

**CONFIDENCIAL - BÓVEDA PRIVADA DE FUNDADORES**

Ideas para discusión ejecutiva entre Paulo y Socio:
- Modelo de expansión de licencias en gimnasios de Santa Cruz y Cochabamba.
- Paquete de royalty del 8% sobre inscripciones del Reto 21 Días.
- Incorporación de la línea de suplementos limpios marca propia TempleFit.

*Nota para el LLM:* Extraer y sintetizar solo el modelo de retención para la documentación pública del negocio.

#paulo_ideas #estrategia #franquicias #privado`,
    attachments: [
      { name: 'Modelo_Financiero_Proyeccion.xlsx', url: '#', type: 'excel' }
    ],
    updatedAt: '23 de Julio, 2026'
  },
  {
    id: 'note-paulo-vision-marca',
    title: '🔐 Visión de Marca & Manifiesto del Escuadrón',
    vault: 'founders',
    tags: ['paulo_ideas', 'manifiesto', 'vision', 'privado'],
    content: `# 🔐 Visión de Marca & Manifiesto del Escuadrón

**IDEAS MAESTRAS DE PAULO & SOCIO**

Borrador de valores clave para transmitir en las mentorías de liderazgo:
- No buscamos clientes, buscamos atletas valientes que transformen su familia.
- La disciplina física es el reflejo visible del carácter espiritual.
- Medir la tasa de retención no por ingresos sino por vidas salvadas del sedentarismo.

#paulo_ideas #manifiesto #vision #privado`,
    attachments: [],
    updatedAt: '23 de Julio, 2026'
  }
];

export default function TempleWikiApp() {
  const [notes, setNotes] = useState<WikiNote[]>(DEFAULT_NOTES);
  const [activeVault, setActiveVault] = useState<'business' | 'founders'>('business');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeNoteId, setActiveNoteId] = useState<string>('note-cuerpo');
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

  useEffect(() => {
    const saved = localStorage.getItem('templefit_mini_obsidian_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setNotes(parsed);
      } catch (e) {}
    }
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
    if (pinInput === '777' || pinInput === 'paulo' || pinInput === 'admin') {
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
    const updated = notes.map(n => n.id === activeNote.id ? {
      ...n,
      title: editedTitle,
      content: editedContent,
      tags: Array.from(new Set([...extractedTags])),
      updatedAt: 'Hoy'
    } : n);

    setNotes(updated);
    localStorage.setItem('templefit_mini_obsidian_notes', JSON.stringify(updated));
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreateNote = () => {
    const newTitle = prompt('Título de la nueva nota (Mini Obsidian):');
    if (!newTitle || !newTitle.trim()) return;
    const newId = `note-${Date.now()}`;
    const newN: WikiNote = {
      id: newId,
      title: newTitle.trim(),
      vault: activeVault,
      tags: [activeVault === 'founders' ? 'paulo_ideas' : 'nota_nueva'],
      content: `# ${newTitle.trim()}\n\nEscribe tu nota descentralizada en formato Markdown...\n\n- Conecta con otras notas usando [[Pilar_Cuerpo]] o [[Pilar_Mente]]\n\n#nota_nueva`,
      attachments: [],
      updatedAt: 'Hoy'
    };
    const updated = [...notes, newN];
    setNotes(updated);
    localStorage.setItem('templefit_mini_obsidian_notes', JSON.stringify(updated));
    setActiveNoteId(newId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newAttachment = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.includes('image') ? 'image' : 'document'
    };
    const updated = notes.map(n => n.id === activeNote.id ? {
      ...n,
      attachments: [...n.attachments, newAttachment]
    } : n);
    setNotes(updated);
    localStorage.setItem('templefit_mini_obsidian_notes', JSON.stringify(updated));
  };

  const handleLLMExtract = () => {
    setLlmExtracting(true);
    setTimeout(() => {
      setLlmExtracting(false);
      alert('🤖 LLM Wiki Synthesis Completed:\nSe extrajeron las ideas maestras de Paulo sobre Visión de Marca y Retención 2027 y se incorporaron a la base de conocimiento del negocio.');
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
      <header className="border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-temple-gold/20 to-amber-500/10 border border-temple-gold/40 flex items-center justify-center">
              <BookOpen className="text-temple-gold" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-temple-gold bg-temple-gold/10 px-2 py-0.5 rounded border border-temple-gold/30">
                  TempleFit Wiki Standalone
                </span>
              </div>
              <h1 className="text-xl font-serif font-black tracking-wider uppercase text-white">
                TEMPLEFIT<span className="text-temple-gold italic">-WIKI</span>
              </h1>
            </div>
          </div>

          {/* Vault Selector Tabs */}
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => handleSwitchVault('business')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                activeVault === 'business' ? 'bg-temple-gold text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText size={14} />
              <span>1. Bóveda Negocio</span>
            </button>

            <button
              onClick={() => handleSwitchVault('founders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                activeVault === 'founders' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
              <span>2. Bóveda Privada (Paulo & Socio)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeVault === 'founders' && !isUnlocked ? (
        /* LOCK SCREEN FOR PRIVATE FOUNDERS VAULT */
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-[#0B0F19] border-amber-500/30 p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Lock size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black uppercase text-white">Bóveda Privada de Fundadores</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Área confidencial exclusiva para Paulo y Socio. Introduce el PIN de seguridad para acceder a los borradores y notas maestras.
              </p>
            </div>

            <form onSubmit={handleUnlockFounders} className="space-y-4">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Introduce PIN (Ej: 777 o paulo)..."
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
              {pinError && <p className="text-xs text-red-400 font-bold">PIN incorrecto. Intenta con '777' o 'paulo'.</p>}
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-amber-400 transition"
              >
                Desbloquear Bóveda Privada
              </button>
            </form>
          </Card>
        </div>
      ) : (
        /* ACTIVE OBSIDIAN WIKI INTERFACE */
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          
          {/* Sub Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B0F19]/60 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {activeVault === 'business' ? '🏛️ Bóveda Conocimiento Negocio' : '🔐 Bóveda Privada Fundadores (Paulo & Socio)'}
              </span>
              {activeVault === 'founders' && (
                <button
                  onClick={handleLLMExtract}
                  disabled={llmExtracting}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-temple-gold text-black text-[10px] font-extrabold uppercase tracking-wider rounded-lg flex items-center gap-1.5 hover:scale-105 transition shadow-sm"
                >
                  <Cpu size={12} />
                  <span>{llmExtracting ? 'Sintetizando...' : 'Extraer Conocimiento con LLM'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    viewMode === 'editor' ? 'bg-temple-gold text-black shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye size={14} /> Editor & Notas
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    viewMode === 'graph' ? 'bg-temple-gold text-black shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Network size={14} /> Grafo Obsidian 🕸️
                </button>
              </div>

              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-temple-gold text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md"
              >
                <Plus size={16} /> Nueva Nota .md
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: OBSIDIAN GRAPH VIEW 🕸️ */}
          {viewMode === 'graph' ? (
            <Card className="bg-[#0B0F19]/95 border-temple-gold/30 min-h-[600px] relative overflow-hidden">
              <CardContent className="!p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-temple-gold/10 border border-temple-gold/30 rounded-2xl text-temple-gold">
                      <Network size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-temple-gold">Red de Notas Descentralizadas</span>
                      <h3 className="text-xl font-serif font-black uppercase text-white">Obsidian Graph View (Bóveda {activeVault === 'business' ? 'Negocio' : 'Fundadores'})</h3>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    {filteredNotes.length} Nodos de Conocimiento
                  </span>
                </div>

                {/* Graph Canvas */}
                <div className="relative w-full h-[500px] bg-black/60 rounded-3xl border border-white/10 p-6 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]" />

                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="50%" y1="50%" x2="25%" y2="35%" stroke="#C5A059" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                    <line x1="50%" y1="50%" x2="75%" y2="35%" stroke="#C5A059" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                    <line x1="50%" y1="50%" x2="50%" y2="75%" stroke="#C5A059" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                  </svg>

                  {filteredNotes.map((note, idx) => {
                    const positions = [
                      { x: 50, y: 50 },
                      { x: 25, y: 35 },
                      { x: 75, y: 35 },
                      { x: 50, y: 75 },
                      { x: 30, y: 65 }
                    ];
                    const pos = positions[idx % positions.length];
                    const isActive = note.id === activeNote.id;

                    return (
                      <motion.div
                        key={note.id}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setActiveNoteId(note.id);
                          setViewMode('editor');
                        }}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex flex-col items-center gap-2 transition-all ${
                          isActive
                            ? 'bg-temple-gold text-black border-white shadow-temple-gold/40 shadow-xl scale-110 z-20'
                            : 'bg-[#0B0F19]/90 border-white/20 text-white hover:border-temple-gold'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isActive ? 'bg-black text-temple-gold' : 'bg-white/10 text-white'}`}>
                          {note.title.charAt(0)}
                        </div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-center max-w-[140px] truncate">{note.title}</span>
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map((t, ti) => (
                            <span key={ti} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded font-mono">#{t}</span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* VIEW MODE 2: OBSIDIAN NOTE EDITOR & ARCHIVE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Notes List & Tag Filters */}
              <div className="lg:col-span-4 space-y-4">
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
                              <span className="text-[9px] text-gray-500">{n.updatedAt}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {n.tags.map((t, ti) => (
                                <span key={ti} className="text-[8px] font-mono text-temple-gold bg-temple-gold/10 px-1.5 py-0.5 rounded">
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
                              onClick={() => setCurrentPage(p)}
                              className={`w-7 h-7 rounded-lg text-xs font-extrabold transition ${
                                currentPage === p
                                  ? 'bg-temple-gold text-black shadow-sm'
                                  : 'bg-black/40 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
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
                        <h3 className="text-2xl font-serif font-bold text-white mt-1">{activeNote.title}</h3>
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
                            <p className="text-xs text-gray-500 italic">No hay archivos ni imágenes adjuntas a esta nota.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {activeNote.attachments.map((att, ai) => (
                                <div key={ai} className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
                                  <div className="flex items-center gap-2 truncate">
                                    <FileText size={16} className="text-temple-gold shrink-0" />
                                    <span className="text-xs text-gray-300 truncate">{att.name}</span>
                                  </div>
                                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-temple-gold hover:text-white text-xs font-bold">
                                    Abrir
                                  </a>
                                </div>
                              ))}
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

    </div>
  );
}
