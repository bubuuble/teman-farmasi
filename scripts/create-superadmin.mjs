// Script sekali pakai untuk buat akun superadmin
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://qcqcpbaqfecdpjczmukk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcWNwYmFxZmVjZHBqY3ptdWtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA0MTc0MiwiZXhwIjoyMDgxNjE3NzQyfQ.r579tI3WsWcizmNZfTsGCJrloJ_xquWRx8iGq_jR_5k',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function createSuperAdmin() {
  console.log('🚀 Membuat akun superadmin...')

  // 1. Buat user di Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'tes@gmail.com',
    password: '123123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Superadmin',
      role: 'superadmin',
      username: 'superadmin'
    }
  })

  if (error) {
    console.error('❌ Gagal buat user:', error.message)
    return
  }

  console.log('✅ User auth berhasil dibuat, ID:', data.user.id)

  // 2. Update constraint role (tambah superadmin) dan set role di profiles
  // Tunggu sebentar agar trigger profiles terbuat dulu
  await new Promise(r => setTimeout(r, 1500))

  // 3. Update role di tabel profiles
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      role: 'superadmin',
      username: 'superadmin',
      full_name: 'Superadmin'
    })
    .eq('id', data.user.id)

  if (profileError) {
    console.error('❌ Gagal update profile:', profileError.message)
    console.log('⚠️  Jalankan SQL ini manual di Supabase SQL Editor:')
    console.log(`UPDATE profiles SET role = 'superadmin' WHERE id = '${data.user.id}';`)
    return
  }

  console.log('✅ Role superadmin berhasil di-set!')
  console.log('📧 Email  :', 'tes@gmail.com')
  console.log('🔑 Password:', '123123')
  console.log('👑 Role   :', 'superadmin')
}

createSuperAdmin()
