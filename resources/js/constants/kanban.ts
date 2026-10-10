export const KANBAN_COLUMN_WIDTH = 'w-[320px]'
/** Column is 320px with px-1.5 (6px) padding on each side. */
export const KANBAN_CARD_WIDTH = 'w-[308px]'

export const KANBAN_COLUMN_COLORS = [
  {
    value: 'gray',
    label: 'Default',
    surface: 'bg-neutral-100 border-neutral-200 dark:bg-neutral-950/80 dark:border-white/10',
    drop: 'border-neutral-300 bg-neutral-200/90 dark:border-white/20 dark:bg-neutral-900',
    swatch: 'bg-neutral-300 dark:bg-neutral-600',
  },
  {
    value: 'sky',
    label: 'Sky',
    surface: 'bg-sky-50 border-sky-200/80 dark:bg-sky-950/45 dark:border-sky-800',
    drop: 'bg-sky-100 border-sky-300 dark:bg-sky-900/55',
    swatch: 'bg-sky-400',
  },
  {
    value: 'teal',
    label: 'Teal',
    surface: 'bg-teal-50 border-teal-200/80 dark:bg-teal-950/45 dark:border-teal-800',
    drop: 'bg-teal-100 border-teal-300 dark:bg-teal-900/55',
    swatch: 'bg-teal-400',
  },
  {
    value: 'emerald',
    label: 'Green',
    surface: 'bg-emerald-50 border-emerald-200/80 dark:bg-emerald-950/45 dark:border-emerald-800',
    drop: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/55',
    swatch: 'bg-emerald-400',
  },
  {
    value: 'amber',
    label: 'Amber',
    surface: 'bg-amber-50 border-amber-200/80 dark:bg-amber-950/45 dark:border-amber-800',
    drop: 'bg-amber-100 border-amber-300 dark:bg-amber-900/55',
    swatch: 'bg-amber-400',
  },
  {
    value: 'orange',
    label: 'Orange',
    surface: 'bg-orange-50 border-orange-200/80 dark:bg-orange-950/45 dark:border-orange-800',
    drop: 'bg-orange-100 border-orange-300 dark:bg-orange-900/55',
    swatch: 'bg-orange-400',
  },
  {
    value: 'rose',
    label: 'Rose',
    surface: 'bg-rose-50 border-rose-200/80 dark:bg-rose-950/45 dark:border-rose-800',
    drop: 'bg-rose-100 border-rose-300 dark:bg-rose-900/55',
    swatch: 'bg-rose-400',
  },
  {
    value: 'violet',
    label: 'Violet',
    surface: 'bg-violet-50 border-violet-200/80 dark:bg-violet-950/45 dark:border-violet-800',
    drop: 'bg-violet-100 border-violet-300 dark:bg-violet-900/55',
    swatch: 'bg-violet-400',
  },
  {
    value: 'indigo',
    label: 'Indigo',
    surface: 'bg-indigo-50 border-indigo-200/80 dark:bg-indigo-950/45 dark:border-indigo-800',
    drop: 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/55',
    swatch: 'bg-indigo-400',
  },
  {
    value: 'slate',
    label: 'Slate',
    surface: 'bg-slate-100 border-slate-200 dark:bg-slate-950/70 dark:border-slate-700',
    drop: 'bg-slate-200/80 border-slate-300 dark:bg-slate-900',
    swatch: 'bg-slate-400',
  },
] as const

export type KanbanColumnColor = (typeof KANBAN_COLUMN_COLORS)[number]['value']

export function kanbanColumnColor(value?: string | null) {
  return KANBAN_COLUMN_COLORS.find((color) => color.value === value) ?? KANBAN_COLUMN_COLORS[0]
}
