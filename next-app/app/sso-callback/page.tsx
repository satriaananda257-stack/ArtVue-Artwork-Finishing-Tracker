"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function SSOCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141414]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Mengalihkan...</p>
      </div>
    </div>
  )
}
