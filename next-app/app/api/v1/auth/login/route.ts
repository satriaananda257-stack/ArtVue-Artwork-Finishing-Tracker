import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { usersTable, profilesTable } from "@/lib/schema"
import { signToken } from "@/lib/auth"
import { eq } from "drizzle-orm"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    })
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email or password incorrect" },
        { status: 404 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Email or password incorrect" },
        { status: 401 }
      )
    }

    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, user.id),
    })

    const token = signToken({ id: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: profile?.username ?? null,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
