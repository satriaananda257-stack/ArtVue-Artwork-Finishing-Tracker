"use client"

import { SignUp } from "@clerk/nextjs"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-[#141414]">
      {/* Left — form */}
      <div className="flex w-full flex-col justify-center px-8 md:w-1/2 md:px-16 lg:px-24">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">DEADLINEKU</span>
        </div>

        <SignUp
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none p-0 w-full",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "hidden",
              socialButtonsRoot: "hidden",
              dividerRow: "hidden",
              formFieldLabel: "text-zinc-400 text-sm",
              formFieldInput:
                "bg-zinc-800 border border-zinc-700 text-white rounded-md focus:ring-1 focus:ring-white",
              formButtonPrimary:
                "bg-white text-black font-semibold hover:bg-zinc-200 w-full rounded-md mt-2",
              footerActionLink: "text-white underline",
              footerActionText: "text-zinc-400",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-white",
              formFieldSuccessText: "text-green-400",
              formFieldErrorText: "text-red-400",
              alertText: "text-red-400",
            },
          }}
        />
      </div>

      {/* Right — artwork image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-4xl font-black uppercase leading-tight tracking-wider text-white">
            START YOUR
            <br />
            CREATIVE JOURNEY
          </p>
        </div>
      </div>
    </div>
  )
}
