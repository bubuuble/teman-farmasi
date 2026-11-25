import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

// Data program untuk halaman /programs. Diambil di SERVER dengan project/dataset dari env, supaya:
// 1) tidak kena CORS Sanity (dulu halaman memanggil Sanity langsung dari browser),
// 2) memakai dataset yang sama dengan homepage dan checkout (harga konsisten).
export const revalidate = 60

const ALLOWED = new Set(['ukai', 'pharmacore', 'research', 'publish', 'impact', 'pharmacamp'])

export async function GET(req: NextRequest) {
  const cat = req.nextUrl.searchParams.get('cat') || ''
  if (!ALLOWED.has(cat)) return NextResponse.json(null, { status: 400 })

  try {
    const doc = await client.fetch(`*[_type == "program" && category == $cat][0]`, { cat })
    return NextResponse.json(doc ?? null)
  } catch (e: any) {
    console.error('[api/programs] Gagal membaca Sanity:', e.message)
    return NextResponse.json(null, { status: 502 })
  }
}
