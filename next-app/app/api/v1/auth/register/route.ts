import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { usersTable, profilesTable } from "@/lib/schema"
import { signToken } from "@/lib/auth"
import { eq } from "drizzle-orm"

const registerSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password } = registerSchema.parse(body)

    const existing = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [inserted] = await db
      .insert(usersTable)
      .values({ email, password: hashedPassword })
      .$returningId()

    await db.insert(profilesTable).values({ userId: inserted.id, username })

    return NextResponse.json(
      {
        success: true,
        message: "Register successful",
        data: { user: { id: inserted.id, username, email } },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Register error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
