/**
 * Category configuration — single source of truth.
 * All category IDs, labels, and colors are defined here.
 * Components should import from this file instead of hardcoding values.
 */

export interface CategoryConfig {
  id: string
  label: string
  /** Primary brand color for this category */
  color: string
  /** Lighter tint — used for backgrounds, badges, etc. */
  tint: string
  /** Text color on the tint background */
  tintText: string
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'html',
    label: 'HTML',
    color: '#e44d26',
    tint: 'rgba(228, 77, 38, 0.1)',
    tintText: '#b83b1c',
  },
  {
    id: 'css',
    label: 'CSS',
    color: '#2965f1',
    tint: 'rgba(41, 101, 241, 0.1)',
    tintText: '#1a4ac9',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    color: '#c9a700',
    tint: 'rgba(201, 167, 0, 0.12)',
    tintText: '#8a7200',
  },
  {
    id: 'database',
    label: 'Database',
    color: '#7c3aed',
    tint: 'rgba(124, 58, 237, 0.1)',
    tintText: '#5b21b6',
  },
  {
    id: 'server',
    label: 'Server',
    color: '#059669',
    tint: 'rgba(5, 150, 105, 0.1)',
    tintText: '#047857',
  },
  {
    id: 'fe',
    label: 'Front-end',
    color: '#0ea5e9',
    tint: 'rgba(14, 165, 233, 0.1)',
    tintText: '#0369a1',
  },
  {
    id: 'be',
    label: 'Back-end',
    color: '#64748b',
    tint: 'rgba(100, 116, 139, 0.1)',
    tintText: '#475569',
  },
  {
    id: 'linux',
    label: 'Linux',
    color: '#d97706',
    tint: 'rgba(217, 119, 6, 0.1)',
    tintText: '#b45309',
  },
  {
    id: 'window',
    label: 'Windows',
    color: '#0078d4',
    tint: 'rgba(0, 120, 212, 0.1)',
    tintText: '#005fa3',
  },
]

/** Map for O(1) lookup by id */
export const CATEGORY_MAP = new Map<string, CategoryConfig>(
  CATEGORIES.map(c => [c.id, c])
)

/** Default/fallback for unknown categories */
export const DEFAULT_CATEGORY: CategoryConfig = {
  id: 'unknown',
  label: 'Khác',
  color: '#f97316',
  tint: 'rgba(249, 115, 22, 0.1)',
  tintText: '#c2560b',
}

/**
 * Get the category config for a given category id.
 * Returns default if not found.
 */
export function getCategoryConfig(id: string | undefined): CategoryConfig {
  if (!id) return DEFAULT_CATEGORY
  return CATEGORY_MAP.get(id) ?? DEFAULT_CATEGORY
}

/**
 * Get the primary color for one or more categories.
 * Uses the first category id in the array.
 */
export function getCategoryColor(categories: string | string[] | undefined): string {
  const id = Array.isArray(categories) ? categories[0] : categories
  return getCategoryConfig(id).color
}
