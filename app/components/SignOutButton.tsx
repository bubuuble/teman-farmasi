'use client'

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    // Logout dari Supabase
    await supabase.auth.signOut()
    // Refresh halaman agar proxy menendang ke login
    router.refresh() 
    router.push('/login')
    setLoading(false)
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="text-red-500 hover:text-red-700 font-semibold text-sm flex items-center gap-2"
    >
      {loading ? "Keluar..." : "Log Out"}
    </button>
  )
}