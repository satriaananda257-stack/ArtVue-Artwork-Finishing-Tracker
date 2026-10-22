import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { worksTable, profilesTable } from "@/lib/schema"
import { verifyToken } from "@/lib/auth"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"
import { and, eq } from "drizzle-orm"

const WORK_STATUS = [
  "Sketch",
  "Line Art",
  "Coloring",
  "Shading",
  "Background",
  "Final Touch",
  "Done",
] as const

const updateWorkSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(WORK_STATUS).optional(),
})

// GET /api/v1/works/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyToken(req)
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const workId = Number(id)
  if (isNaN(workId)) {
    return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 })
  }

  try {
    const [work] = await db
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
      .where(and(eq(worksTable.id, workId), eq(worksTable.userId, user.id)))

    if (!work) {
      return NextResponse.json({ success: false, message: "Work not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Work retrieved successfully",
      data: { work },
    })
  } catch (error) {
    console.error("Get work error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/v1/works/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyToken(req)
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const workId = Number(id)
  if (isNaN(workId)) {
    return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 })
  }

  try {
    const [existing] = await db
      .select()
      .from(worksTable)
      .where(and(eq(worksTable.id, workId), eq(worksTable.userId, user.id)))

    if (!existing) {
      return NextResponse.json({ success: false, message: "Work not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const title = formData.get("title") as string | null
    const description = formData.get("description") as string | null
    const notes = formData.get("notes") as string | null
    const status = formData.get("status") as string | null
    const imageFile = formData.get("image") as File | null

    const validated = updateWorkSchema.parse({
      title: title ?? undefined,
      description: description ?? undefined,
      notes: notes ?? undefined,
      status: status ?? undefined,
    })

    let imageUrl = existing.imageUrl
    let imagePublicId = existing.imagePublicId

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const result = await uploadToCloudinary(buffer)
      imageUrl = result.secure_url
      imagePublicId = result.public_id
      if (existing.imagePublicId) await deleteFromCloudinary(existing.imagePublicId)
    }

    let completedAt = existing.completedAt
    if (validated.status === "Done" && existing.status !== "Done") {
      completedAt = new Date()
    } else if (validated.status && validated.status !== "Done") {
      completedAt = null
    }

    await db
      .update(worksTable)
      .set({
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.notes !== undefined && { notes: validated.notes }),
        ...(validated.status !== undefined && { status: validated.status }),
        ...(imageFile && { imageUrl, imagePublicId }),
        completedAt,
      })
      .where(eq(worksTable.id, workId))

    const [updatedWork] = await db.select().from(worksTable).where(eq(worksTable.id, workId))

    return NextResponse.json({
      success: true,
      message: "Work updated successfully",
      data: { work: updatedWork },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.errors[0].message }, { status: 400 })
    }
    console.error("Update work error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/v1/works/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyToken(req)
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const workId = Number(id)
  if (isNaN(workId)) {
    return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 })
  }

  try {
    const [existing] = await db
      .select()
      .from(worksTable)
      .where(and(eq(worksTable.id, workId), eq(worksTable.userId, user.id)))

    if (!existing) {
      return NextResponse.json({ success: false, message: "Work not found" }, { status: 404 })
    }

    if (existing.imagePublicId) {
      await deleteFromCloudinary(existing.imagePublicId)
    }

    await db.delete(worksTable).where(eq(worksTable.id, workId))

    return NextResponse.json({ success: true, message: "Work deleted successfully" })
  } catch (error) {
    console.error("Delete work error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
