
"use client"

import { useEffect, useState } from "react"
import { useAuth, AuthenticateWithRedirectCallback } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

function ExchangeToken() {
  const router = useRouter()
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || processing) return

    const exchangeToken = async () => {
      setProcessing(true)

      try {
        const clerkToken = await getToken()

        if (!clerkToken) {
          router.replace("/login")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        if (!apiUrl) {
          // Kalau API URL belum di-set, langsung redirect ke home
          router.replace("/home")
          return
        }

        const res = await fetch(`${apiUrl}/api/v1/auth/clerk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clerkToken }),
        })

        const data = await res.json()

        if (!res.ok || !data.data?.token || !data.data?.user) {
          throw new Error("Pertukaran token gagal")
        }

        localStorage.setItem("token", data.data.token)
        localStorage.setItem("user", JSON.stringify(data.data.user))

        router.replace("/home")
      } catch (error) {
        console.error("Clerk token exchange gagal:", error)
        router.replace("/login")
      }
    }

    void exchangeToken()
  }, [isLoaded, isSignedIn, getToken, router, processing])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141414]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Menghubungkan akun Google...</p>
      </div>
    </div>
  )
}

export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />
}
