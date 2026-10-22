import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { worksTable, profilesTable } from "@/lib/schema"
import { verifyToken } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { desc, eq } from "drizzle-orm"

const WORK_STATUS = [
  "Sketch",
  "Line Art",
  "Coloring",
  "Shading",
  "Background",
  "Final Touch",
  "Done",
] as const

const createWorkSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(WORK_STATUS).optional(),
})

// GET /api/v1/works — get all works for logged in user
export async function GET(req: NextRequest) {
  const user = verifyToken(req)
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const works = await db
      .select({
        id: worksTable.id,
        userId: worksTable.userId,
        title: worksTable.title,
        imageUrl: worksTable.imageUrl,
        description: worksTable.description,
        notes: worksTable.notes,
        status: worksTable.status,
        createdAt: worksTable.createdAt,
        completedAt: worksTable.completedAt,
        username: profilesTable.username,
      })
      .from(worksTable)
      .leftJoin(profilesTable, eq(worksTable.userId, profilesTable.userId))
      .where(eq(worksTable.userId, user.id))
      .orderBy(desc(worksTable.createdAt))

    return NextResponse.json({
      success: true,
      message: "Works retrieved successfully",
      data: { works },
    })
  } catch (error) {
    console.error("Get works error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/v1/works — create new work
export async function POST(req: NextRequest) {
  const user = verifyToken(req)
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string | null
    const notes = formData.get("notes") as string | null
    const status = formData.get("status") as string | null
    const imageFile = formData.get("image") as File | null

    const validated = createWorkSchema.parse({ title, description, notes, status: status || undefined })

    let imageUrl: string | undefined
    let imagePublicId: string | undefined

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const result = await uploadToCloudinary(buffer)
      imageUrl = result.secure_url
      imagePublicId = result.public_id
    }

    const [inserted] = await db
      .insert(worksTable)
      .values({
        userId: user.id,
        title: validated.title,
        description: validated.description ?? null,
        notes: validated.notes ?? null,
        status: validated.status ?? "Sketch",
        imageUrl,
        imagePublicId,
      })
      .$returningId()

    const newWork = await db.query.worksTable.findFirst({
      where: eq(worksTable.id, inserted.id),
    })

    return NextResponse.json(
      { success: true, message: "Work created successfully", data: { work: newWork } },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.errors[0].message }, { status: 400 })
    }
    console.error("Create work error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
