import { client } from '@/lib/sanity'
import { UKAI_DEFAULT_PLANS, type UkaiPlan } from '@/lib/ukai-plans'

/**
 * Katalog checkout. Harga SELALU di-resolve di server dari Sanity (atau default di bawah),
 * jangan pernah percaya harga dari URL/klien.
 */

export type CheckoutItem = {
  key: string // contoh: "ukai:masuk_apoteker:1", "pharmacore:0", "research:2"
  category: string
  title: string // tampil di struk
  subtitle?: string
  amount: number // rupiah, integer
  priceLabel: string
  classTitle: string // judul kelas di tabel `classes` (diawali nama program agar terkelompok)
}

/** "Rp 750.000 / orang" -> 750000. null bila tidak ada nominal (mis. "By agreement"). */
export function parseRupiah(text: string | null | undefined): number | null {
  const m = String(text ?? '').match(/Rp\.?\s*([\d.]+)/i)
  if (!m) return null
  const n = parseInt(m[1].replace(/\./g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

const PROGRAM_NAME: Record<string, string> = {
  pharmacore: 'PharmaCore Class',
  research: 'Pharma Research Mentoring',
  publish: 'PharmaPublish Academy',
  impact: 'Pharma Impact',
}

function mapUkaiPlans(sub: any, fallback: UkaiPlan[]): UkaiPlan[] {
  if (sub?.plans?.length) {
    return sub.plans.map((p: any, i: number) => ({
      type: `plan_${i}`,
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      unit: p.unit || '/ orang',
      popular: !!p.popular,
      features: p.features || [],
    }))
  }
  return fallback
}

/** Resolve item checkout dari (category, key). Mengembalikan null bila tidak ditemukan / tidak bisa dibeli online. */
export async function resolveCheckoutItem(category: string, key: string): Promise<CheckoutItem | null> {
  const parts = key.split(':')

  if (category === 'ukai') {
    const sub = parts[1] as 'masuk_apoteker' | 'ukmppai'
    const idx = Number(parts[2])
    if ((sub !== 'masuk_apoteker' && sub !== 'ukmppai') || !Number.isInteger(idx)) return null
    const doc = await client.fetch(
      `*[_type == "program" && category == "ukai"][0]{ masukApoteker, ukmppai }`,
      {},
      { next: { revalidate: 30 } } as any
    )
    const subDoc = sub === 'masuk_apoteker' ? doc?.masukApoteker : doc?.ukmppai
    const subTitle = subDoc?.title || (sub === 'masuk_apoteker' ? 'Masuk Apoteker' : 'Kelas UKMPPAI')
    const plan = mapUkaiPlans(subDoc, UKAI_DEFAULT_PLANS[sub])[idx]
    const amount = parseRupiah(plan?.price)
    if (!plan || !amount) return null
    return {
      key,
      category,
      title: `UKAI Series - ${subTitle}`,
      subtitle: plan.name,
      amount,
      priceLabel: `${plan.price} ${plan.unit}`.trim(),
      classTitle: `UKAI Series - ${sub === 'masuk_apoteker' ? 'Masuk Apoteker' : 'Kelas UKMPPAI'} - ${plan.name}`,
    }
  }

  const name = PROGRAM_NAME[category]
  if (!name) return null
  const idx = Number(parts[1])
  if (!Number.isInteger(idx)) return null
  const doc = await client.fetch(
    `*[_type == "program" && category == $category][0]{ price, subjects, tiers }`,
    { category },
    { next: { revalidate: 30 } } as any
  )
  if (!doc) return null

  if (category === 'pharmacore') {
    const block: string | undefined = doc.subjects?.[idx]
    if (!block) return null
    const title = block.split(':')[0].trim()
    const priceText = doc.price || 'Rp 99.900 / Mata Kuliah'
    const amount = parseRupiah(priceText)
    if (!amount) return null
    return { key, category, title: `${name} - ${title}`, amount, priceLabel: priceText, classTitle: `${name} - ${title}` }
  }

  const tier = doc.tiers?.[idx]
  const amount = parseRupiah(tier?.price)
  if (!tier || !amount) return null
  return { key, category, title: `${name} - ${tier.name}`, amount, priceLabel: tier.price, classTitle: `${name} - ${tier.name}` }
}
