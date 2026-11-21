// Daftar program kelas yang dipakai sidebar admin, halaman per program, dan pengelompokan kelas.
// Dipisah dari ClassForm (client component) supaya bisa dipakai di server component.

const PROGRAM_VALUES = [
  'PharmaCore Class',
  'Pharma Research Mentoring',
  'PharmaPublish Academy',
  'Pharma Impact',
  'Pharmacamp',
  'UKAI Series - Masuk Apoteker',
  'UKAI Series - Kelas UKMPPAI',
]

/** Kategori sebuah kelas berdasarkan judulnya. */
export function getCategoryOfClass(title: string): string {
  const programs = [...PROGRAM_VALUES].sort((a, b) => b.length - a.length)
  for (const p of programs) {
    if (title.startsWith(p)) {
      if (p === 'PharmaCore Class') {
        if (title.toLowerCase().includes('private')) return 'PharmaCore Class (Private)'
        if (title.toLowerCase().includes('group') || title.toLowerCase().includes('grup')) return 'PharmaCore Class (Group)'
      }
      return p
    }
  }
  return 'Lainnya'
}

export type ClassProgramLink = {
  /** Sama dengan hasil getCategoryOfClass */
  key: string
  slug: string
  /** Label pendek untuk sidebar */
  short: string
}

export const CLASS_PROGRAM_LINKS: ClassProgramLink[] = [
  { key: 'PharmaCore Class (Private)', slug: 'pharmacore-private', short: 'PharmaCore Private' },
  { key: 'PharmaCore Class (Group)', slug: 'pharmacore-group', short: 'PharmaCore Group' },
  { key: 'Pharma Research Mentoring', slug: 'research-mentoring', short: 'Research Mentoring' },
  { key: 'PharmaPublish Academy', slug: 'pharmapublish', short: 'PharmaPublish' },
  { key: 'Pharma Impact', slug: 'pharma-impact', short: 'Pharma Impact' },
  { key: 'Pharmacamp', slug: 'pharmacamp', short: 'Pharmacamp' },
  { key: 'UKAI Series - Masuk Apoteker', slug: 'ukai-masuk-apoteker', short: 'UKAI Masuk Apoteker' },
  { key: 'UKAI Series - Kelas UKMPPAI', slug: 'ukai-ukmppai', short: 'UKAI UKMPPAI' },
]

export const programHref = (slug: string) => `/admin/classes/program/${slug}`

export const findProgramBySlug = (slug: string) => CLASS_PROGRAM_LINKS.find(p => p.slug === slug)

export const findProgramByTitle = (title: string) => {
  const key = getCategoryOfClass(title)
  return CLASS_PROGRAM_LINKS.find(p => p.key === key)
}
