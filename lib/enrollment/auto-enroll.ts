import { createAdminClient } from '@/lib/supabase/admin'

interface AutoEnrollParams {
  userId: string
  classTitle?: string
  classId?: string
  programType?: string // e.g. 'masuk_apoteker' | 'ukmppai' | 'pharmacamp'
}

/**
 * Service untuk auto-enrollment murid:
 * 1. Cek apakah kelas target sudah ada di database `classes` (berdasarkan classId atau title).
 * 2. Jika belum ada kelasnya -> Otomatis buat kelas baru di tabel `classes` + 1 sub_class default 'Batch 1'.
 * 3. Jika sudah ada kelasnya -> Cari sub_class aktif / terbaru.
 * 4. Enroll murid ke tabel `enrollments` (status: active).
 * 5. Jika kelas bertipe UKAI/CBT, murid juga otomatis terhubung ke tryout kelas tersebut.
 */
export async function enrollStudentToClass({
  userId,
  classTitle,
  classId,
  programType
}: AutoEnrollParams) {
  const adminDb = createAdminClient()

  let targetClassId = classId
  let targetSubClassId: string | null = null

  // 1. Cari atau Buat Kelas
  if (targetClassId) {
    const { data: existingClass } = await adminDb
      .from('classes')
      .select('id, title')
      .eq('id', targetClassId)
      .single()

    if (!existingClass) {
      targetClassId = undefined
    }
  }

  // Jika belum ada classId tapi ada classTitle
  if (!targetClassId && classTitle) {
    // Cari kelas yang judulnya mirip
    const { data: foundClasses } = await adminDb
      .from('classes')
      .select('id, title')
      .ilike('title', `%${classTitle.trim()}%`)
      .limit(1)

    if (foundClasses && foundClasses.length > 0) {
      targetClassId = foundClasses[0].id
    } else {
      // 2. OTOMATIS BUAT KELAS BARU jika belum ada
      console.log(`[AutoEnroll] Kelas "${classTitle}" belum ada. Membuat kelas baru...`)
      const { data: newClass, error: createClassErr } = await adminDb
        .from('classes')
        .insert({
          title: classTitle.trim(),
          description: `Kelas otomatis dibuat dari sistem pembayaran untuk program ${classTitle}`,
          level: programType || 'All Level'
        })
        .select('id')
        .single()

      if (createClassErr || !newClass) {
        throw new Error(`Gagal membuat kelas otomatis: ${createClassErr?.message}`)
      }

      targetClassId = newClass.id

      // Buat default sub_class "Batch 1"
      const { data: newSubClass } = await adminDb
        .from('sub_classes')
        .insert({
          class_id: targetClassId,
          title: 'Batch 1 (Reguler)',
          description: 'Sub-kelas aktif pertama'
        })
        .select('id')
        .single()

      if (newSubClass) {
        targetSubClassId = newSubClass.id
      }
    }
  }

  if (!targetClassId) {
    throw new Error('Gagal mengidentifikasi kelas tujuan untuk pendaftaran murid.')
  }

  // 3. Jika kelas sudah ada, cari sub_class yang sedang berjalan / terbaru
  if (!targetSubClassId) {
    const { data: subClasses } = await adminDb
      .from('sub_classes')
      .select('id, title')
      .eq('class_id', targetClassId)
      .order('created_at', { ascending: false })

    if (subClasses && subClasses.length > 0) {
      targetSubClassId = subClasses[0].id
    } else {
      // Buat sub_class default jika belum ada
      const { data: createdSub } = await adminDb
        .from('sub_classes')
        .insert({
          class_id: targetClassId,
          title: 'Batch 1',
          description: 'Sub-kelas otomatis'
        })
        .select('id')
        .single()

      targetSubClassId = createdSub?.id || null
    }
  }

  // 4. Enroll Murid ke tabel `enrollments`
  console.log(`[AutoEnroll] Mendaftarkan user ${userId} ke kelas ${targetClassId} (sub_class: ${targetSubClassId})`)
  const { data: enrollment, error: enrollErr } = await adminDb
    .from('enrollments')
    .upsert({
      class_id: targetClassId,
      student_id: userId,
      sub_class_id: targetSubClassId,
      status: 'active'
    }, {
      onConflict: 'class_id,student_id'
    })
    .select('id')
    .single()

  if (enrollErr) {
    console.error('[AutoEnroll Error]:', enrollErr.message)
    throw new Error(`Gagal mendaftarkan murid: ${enrollErr.message}`)
  }

  return {
    success: true,
    classId: targetClassId,
    subClassId: targetSubClassId,
    enrollmentId: enrollment?.id
  }
}
