export interface WikiNote {
  id: string;
  title: string;
  tags: string[];
  content: string;
  attachments: { name: string; url: string; type: string }[];
  updatedAt: string;
  aliases?: string[];
}

export interface GraphNode {
  id: string;
  title: string;
  tags: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  connections: number;
  groupColor: string;
  groupName: string;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string;
  target: string;
  isHighlighted?: boolean;
}

export interface ForceSettings {
  repelStrength: number;
  linkDistance: number;
  centerStrength: number;
  showLabels: boolean;
  showOrphans: boolean;
  showArrows: boolean;
  depth: number; // For local graph (1 or 2 hops)
}

export interface ColorGroup {
  name: string;
  tags: string[];
  color: string;
  bgGlow: string;
}

export const OBSIDIAN_COLOR_GROUPS: ColorGroup[] = [
  {
    name: 'Operaciones & SOPs',
    tags: ['sops', 'orden', 'organizacion', 'checklist', 'control'],
    color: '#F5D061', // Temple Gold
    bgGlow: 'rgba(245, 208, 97, 0.25)'
  },
  {
    name: 'Hub & Espacios',
    tags: ['hub', 'unidades', 'modelo', 'arquitectura'],
    color: '#38BDF8', // Sky Blue
    bgGlow: 'rgba(56, 189, 248, 0.25)'
  },
  {
    name: 'Comunidad & Ritmos',
    tags: ['ritmos', 'sabados', 'festivales'],
    color: '#C084FC', // Purple
    bgGlow: 'rgba(192, 132, 252, 0.25)'
  },
  {
    name: 'Ventas & Embudos',
    tags: ['ventas', 'embudos', 'leads'],
    color: '#34D399', // Emerald
    bgGlow: 'rgba(52, 211, 153, 0.25)'
  },
  {
    name: 'Métricas & Finanzas',
    tags: ['metricas', 'finanzas', 'estrategia', 'corporativo', 'privado'],
    color: '#FB923C', // Amber / Orange
    bgGlow: 'rgba(251, 146, 60, 0.25)'
  },
  {
    name: 'Liderazgo & Escuadrones',
    tags: ['escuadrones', 'liderazgo', 'discipulos'],
    color: '#F87171', // Coral Red
    bgGlow: 'rgba(248, 113, 113, 0.25)'
  }
];

export function getNoteColorGroup(tags: string[]): ColorGroup {
  for (const group of OBSIDIAN_COLOR_GROUPS) {
    if (tags.some(t => group.tags.includes(t.toLowerCase()))) {
      return group;
    }
  }
  return {
    name: 'General',
    tags: [],
    color: '#94A3B8',
    bgGlow: 'rgba(148, 163, 184, 0.2)'
  };
}
