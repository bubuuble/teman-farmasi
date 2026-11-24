'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import MethodPicker from './MethodPicker'
import { createCheckoutOrder } from './actions'

export default function CheckoutForm({ category, itemKey }: { category: string; itemKey: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <MethodPicker
      loading={pending}
      error={error}
      submitLabel="Bayar Sekarang"
      onSubmit={(method, bank) => {
        setError(null)
        start(async () => {
          const res = await createCheckoutOrder(category, itemKey, method, bank)
          if (res.error || !res.orderId) return setError(res.error || 'Terjadi kesalahan.')
          router.push(`/student/orders/${res.orderId}`)
        })
      }}
    />
  )
}
