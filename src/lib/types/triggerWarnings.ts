export type TriggerWarningCategory = 
  | 'animal_death'
  | 'jump_scares'
  | 'graphic_violence'
  | 'sexual_content'
  | 'suicide_theme'
  | 'child_peril'
  | 'substance_abuse'
  | 'claustrophobia'
  | 'family_unfriendly';

export interface TriggerWarningDefinition {
  category: TriggerWarningCategory;
  label: string;
  emoji: string;
  description: string;
}

export const TRIGGER_WARNING_CATEGORIES: TriggerWarningDefinition[] = [
  {
    category: 'jump_scares',
    label: '⚠️ Jump scares intensos',
    emoji: '⚡',
    description: 'Sustos repentinos con estallidos de sonido o imágenes súbitas.'
  },
  {
    category: 'graphic_violence',
    label: '⚠️ Violencia gráfica / Gore',
    emoji: '🩸',
    description: 'Escenas explícitas de sangre, mutilación o daño físico severo.'
  },
  {
    category: 'animal_death',
    label: '⚠️ Muerte o daño a animales',
    emoji: '🐾',
    description: 'Mascotas o animales heridos, sacrificados o fallecidos en pantalla.'
  },
  {
    category: 'sexual_content',
    label: '⚠️ Contenido sexual explícito / Asalto',
    emoji: '🔞',
    description: 'Escenas sexuales no aptas para todo público o situaciones de agresión.'
  },
  {
    category: 'suicide_theme',
    label: '⚠️ Temáticas de suicidio o autolesión',
    emoji: '💔',
    description: 'Referencias directas, intentos o actos de suicidio y autolesión.'
  },
  {
    category: 'child_peril',
    label: '⚠️ Peligro o maltrato infantil',
    emoji: '👶',
    description: 'Situaciones de amenaza grave, secuestro o maltrato hacia menores de edad.'
  },
  {
    category: 'substance_abuse',
    label: '⚠️ Abuso severo de sustancias',
    emoji: '💊',
    description: 'Consumo explícito o sobredosis de drogas/alcohol con consecuencias destructivas.'
  },
  {
    category: 'claustrophobia',
    label: '⚠️ Claustrofobia / Encierro extremo',
    emoji: '📦',
    description: 'Entornos asfixiantes, entierros prematuros o atrapamiento angustiante.'
  },
  {
    category: 'family_unfriendly',
    label: '⚠️ Lenguaje o situaciones no familiares',
    emoji: '🤬',
    description: 'Insultos constantes, blasfemias o humor sumamente adulto/grotesco.'
  }
];

export interface TriggerWarningItem {
  id: string;
  tmdb_id: number;
  category: TriggerWarningCategory;
  label: string;
  source: 'ai' | 'community';
  reported_by?: string | null;
  upvotes: number;
  created_at?: string;
  confidence?: 'high' | 'medium';
  user_has_upvoted?: boolean;
}
