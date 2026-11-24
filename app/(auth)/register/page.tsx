'use client'

import { useActionState, useEffect, useState } from 'react'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import { register } from './actions'

const initialState = { error: '' }

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-brand-gray/30 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all text-brand-dark placeholder:text-gray-400 bg-brand-cream/30'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => setIsHydrated(true), [])
  if (!isHydrated) return <LoadingSpinner />

  const next = new URLSearchParams(window.location.search).get('next') || ''
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login'

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-cream">
      <div className="w-full max-w-md bg-white p-8 rounded-4xl shadow-soft">
        <h1 className="font-heading font-extrabold text-2xl text-brand-dark mb-1">Daftar Akun Siswa</h1>
        <p className="text-gray-500 text-sm mb-6">Buat akun untuk membeli program dan mengakses kelas.</p>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-brand-dark mb-2">Nama Lengkap</label>
            <input id="fullName" name="fullName" required className={inputCls} placeholder="Nama sesuai identitas" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-brand-dark mb-2">Email</label>
            <input id="email" name="email" type="email" required className={inputCls} placeholder="nama@email.com" />
          </div>
          <div>
            <label htmlFor="institusi" className="block text-sm font-semibold text-brand-dark mb-2">Institusi (opsional)</label>
            <input id="institusi" name="institusi" className={inputCls} placeholder="Kampus / instansi" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-brand-dark mb-2">Password</label>
            <input id="password" name="password" type="password" required minLength={8} className={inputCls} placeholder="Minimal 8 karakter" />
          </div>

          {state?.error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium border border-red-100">{state.error}</div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-darkblue text-white font-heading font-semibold py-4 rounded-xl shadow-lg hover:bg-brand-dark transition-all disabled:opacity-70"
          >
            {isPending ? 'Memproses...' : 'Daftar & Lanjutkan'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-gray">
          Sudah punya akun?{' '}
          <a href={loginHref} className="text-brand-pink font-semibold hover:underline">Masuk</a>
        </p>
      </div>
    </div>
  )
}
