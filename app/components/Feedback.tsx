'use client'

/**
 * Pengganti alert() / confirm() bawaan browser.
 *
 * Pakai dari mana saja (event handler / client component):
 *   notify.success('Data berhasil diperbarui!')
 *   notify.error('Gagal menyimpan')
 *   if (!(await confirmDialog({ title: 'Hapus?', message: '...', variant: 'danger' }))) return
 *
 * <FeedbackHost /> cukup dipasang sekali di root layout.
 */

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
type ToastItem = { id: number; type: ToastType; message: string }

type ConfirmOptions = {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}
type ConfirmItem = ConfirmOptions & { resolve: (v: boolean) => void }

let nextId = 1
const toastListeners = new Set<(t: ToastItem) => void>()
const confirmListeners = new Set<(c: ConfirmItem) => void>()

function push(type: ToastType, message: string) {
  const item: ToastItem = { id: nextId++, type, message }
  toastListeners.forEach((l) => l(item))
}

export const notify = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message),
  info: (message: string) => push('info', message),
}

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (confirmListeners.size === 0) {
      resolve(false)
      return
    }
    confirmListeners.forEach((l) => l({ ...options, resolve }))
  })
}

const TOAST_STYLE: Record<ToastType, { box: string; icon: string; Icon: typeof Info }> = {
  success: { box: 'border-green-200', icon: 'bg-green-50 text-green-600', Icon: CheckCircle2 },
  error: { box: 'border-red-200', icon: 'bg-red-50 text-red-500', Icon: XCircle },
  info: { box: 'border-blue-200', icon: 'bg-blue-50 text-brand-blue', Icon: Info },
}

export default function FeedbackHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [confirms, setConfirms] = useState<ConfirmItem[]>([])

  useEffect(() => {
    const onToast = (t: ToastItem) => {
      setToasts((prev) => [...prev, t].slice(-4))
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), t.type === 'error' ? 6000 : 3500)
    }
    const onConfirm = (c: ConfirmItem) => setConfirms((prev) => [...prev, c])
    toastListeners.add(onToast)
    confirmListeners.add(onConfirm)
    return () => {
      toastListeners.delete(onToast)
      confirmListeners.delete(onConfirm)
    }
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id))

  const answer = (value: boolean) => {
    setConfirms((prev) => {
      const [current, ...rest] = prev
      current?.resolve(value)
      return rest
    })
  }

  const active = confirms[0]

  return (
    <>
      {/* TOASTS */}
      <div
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => {
          const { box, icon, Icon } = TOAST_STYLE[t.type]
          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-3 pr-2 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 ${box}`}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${icon}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="flex-1 py-1.5 text-sm font-semibold leading-snug text-brand-dark break-words">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* CONFIRM DIALOG */}
      {active && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => answer(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-8">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${
                  active.variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-brand-blue'
                }`}
              >
                <AlertCircle className="h-10 w-10" />
              </div>
            </div>
            <div className="p-8 text-center">
              <h3 className="mb-2 text-xl font-bold text-brand-dark">{active.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{active.message}</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                autoFocus
                onClick={() => answer(false)}
                className="flex-1 rounded-2xl bg-gray-50 py-3.5 text-sm font-bold text-gray-400 transition-all hover:bg-gray-100"
              >
                {active.cancelText ?? 'Batal'}
              </button>
              <button
                onClick={() => answer(true)}
                className={`flex-1 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition-all ${
                  active.variant === 'danger'
                    ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600'
                    : 'bg-brand-pink shadow-brand-pink/20 hover:bg-brand-dark'
                }`}
              >
                {active.confirmText ?? 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
