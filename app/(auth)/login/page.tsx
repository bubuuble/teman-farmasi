'use client'

import { useActionState, useState, useEffect } from 'react'
import LoadingSpinner from "@/app/components/LoadingSpinner"
import { login } from "./actions"

// Initial state harus sesuai format return action
const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return <LoadingSpinner />

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-cream">
      {/* ... Bagian Kiri (Logo) sama seperti sebelumnya ... */}
      
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-4xl shadow-soft">
          {/* ... Header text sama ... */}

          <form action={formAction} className="space-y-6">
            <div>
              <label 
                htmlFor="identifier" 
                className="block text-sm font-semibold text-brand-dark mb-2"
              >
                Email atau Username
              </label>
              <input
                id="identifier"
                name="identifier" // PENTING: Ubah name jadi identifier
                type="text"       // Ubah type jadi text (bukan email) agar validasi HTML tidak protes
                required
                className="w-full px-4 py-3 rounded-xl border border-brand-gray/30 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all text-brand-dark placeholder:text-gray-400 bg-brand-cream/30"
                placeholder="Username atau Email"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-brand-dark mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-brand-gray/30 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all text-brand-dark placeholder:text-gray-400 bg-brand-cream/30"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium border border-red-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-darkblue text-white font-heading font-semibold py-4 rounded-xl shadow-lg hover:bg-brand-dark hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-brand-gray text-sm">
              Belum punya akun?{' '}
              <a href="/register" className="text-brand-pink font-semibold hover:underline">
                Hubungi Admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}