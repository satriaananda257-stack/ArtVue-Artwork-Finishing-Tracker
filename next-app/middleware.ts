import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/", "/login", "/register"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Check token in cookie
  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
