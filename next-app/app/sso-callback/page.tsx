"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useSignIn } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

export default function SSOCallbackPage() {
  const router = useRouter()
  const { isSignedIn, getToken } = useAuth()
  const { handleRedirectCallback, isLoaded } = useSignIn()

  useEffect(() => {
    if (!isLoaded) return

    const handleCallback = async () => {
      try {
        await handleRedirectCallback()
      } catch {
        // Clerk sudah handle redirect, lanjut exchange token
      }
    }
    handleCallback()
  }, [isLoaded, handleRedirectCallback])

  useEffect(() => {
    if (!isSignedIn) return

    const exchangeToken = async () => {
      try {
        const clerkToken = await getToken()
        if (!clerkToken) {
          router.push("/login")
          return
        }

        const res = await fetch("http://localhost:5000/api/v1/auth/clerk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkToken }),
        })
        const data = await res.json()

        if (res.ok) {
          localStorage.setItem("token", data.data.token)
          localStorage.setItem("user", JSON.stringify(data.data.user))
          router.push("/home")
        } else {
          router.push("/login")
        }
      } catch {
        router.push("/login")
      }
    }

    exchangeToken()
  }, [isSignedIn, getToken, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141414]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Menghubungkan akun Google...</p>
      </div>
    </div>
  )
}
