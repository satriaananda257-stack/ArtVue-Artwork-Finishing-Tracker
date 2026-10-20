import { Response } from "express";
import { AuthRequest } from "../../config/middleware/auth.middleware";
import {
    createWorkSchema,
    workIdSchema,
    updateWorkParamsSchema,
    updateWorkSchema,
} from "../../validations/work.validation";
import { db } from "../../config/db";
import { worksTable, usersTable, profilesTable } from "../../config/schema";
import { and, desc, eq } from "drizzle-orm";
import { uploadToCloudinary, deleteFromCloudinary } from "../../services/cloudinary.services";

export class WorksController {
    // CREATE WORK — userId from JWT
    createWork = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const validatedData = createWorkSchema.parse(req.body);
            const { title, description, notes, status } = validatedData;

            let imageUrl: string | undefined;
            let imagePublicId: string | undefined;

            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                imageUrl = uploadResult.secure_url;
                imagePublicId = uploadResult.public_id;
            }

            const [inserted] = await db
                .insert(worksTable)
                .values({
                    userId,
                    title,
                    description: description ?? null,
                    notes: notes ?? null,
                    status: status ?? "Sketch",
                    imageUrl,
                    imagePublicId,
                })
                .$returningId();

            const newWork = await db.query.worksTable.findFirst({
                where: eq(worksTable.id, inserted.id),
            });

            return res.status(201).json({
                success: true,
                message: "Work created successfully",
                data: { work: newWork },
            });
        } catch (error) {
            console.error("Create work error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

    // GET ALL WORKS milik user yang sedang login
    getMyWorks = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;

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
                .where(eq(worksTable.userId, userId))
                .orderBy(desc(worksTable.createdAt));

            return res.status(200).json({
                success: true,
                message: "Works retrieved successfully",
                data: { works },
            });
        } catch (error) {
            console.error("Get works error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

    // GET WORK BY ID (hanya pemilik yang bisa akses)
    getWorkById = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = workIdSchema.parse(req.params);
            const userId = req.user!.id;

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
                .where(and(eq(worksTable.id, id), eq(worksTable.userId, userId)));

            if (!work) {
                return res.status(404).json({ success: false, message: "Work not found" });
            }

            return res.status(200).json({
                success: true,
                message: "Work retrieved successfully",
                data: { work },
            });
        } catch (error) {
            console.error("Get work by id error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

    // UPDATE WORK — hanya pemilik
    updateWork = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = updateWorkParamsSchema.parse(req.params);
            const validatedData = updateWorkSchema.parse(req.body);
            const userId = req.user!.id;

            const [existing] = await db
                .select()
                .from(worksTable)
                .where(and(eq(worksTable.id, id), eq(worksTable.userId, userId)));

            if (!existing) {
                return res.status(404).json({ success: false, message: "Work not found" });
            }

            let imageUrl = existing.imageUrl;
            let imagePublicId = existing.imagePublicId;

            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                imageUrl = uploadResult.secure_url;
                imagePublicId = uploadResult.public_id;
                if (existing.imagePublicId) await deleteFromCloudinary(existing.imagePublicId);
            }

            // Tentukan completedAt: isi otomatis jika status berubah ke "Done", hapus jika kembali
            let completedAt = existing.completedAt;
            if (validatedData.status === "Done" && existing.status !== "Done") {
                completedAt = new Date();
            } else if (validatedData.status && validatedData.status !== "Done") {
                completedAt = null;
            }

            await db.update(worksTable).set({
                ...(validatedData.title !== undefined && { title: validatedData.title }),
                ...(validatedData.description !== undefined && { description: validatedData.description }),
                ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
                ...(validatedData.status !== undefined && { status: validatedData.status }),
                ...(req.file && { imageUrl, imagePublicId }),
                completedAt,
            }).where(eq(worksTable.id, id));

            const [updatedWork] = await db.select().from(worksTable).where(eq(worksTable.id, id));

            return res.status(200).json({
                success: true,
                message: "Work updated successfully",
                data: { work: updatedWork },
            });
        } catch (error) {
            console.error("Update work error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

    // DELETE WORK — hanya pemilik (hard delete)
    deleteWork = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = workIdSchema.parse(req.params);
            const userId = req.user!.id;

            const [existing] = await db
                .select()
                .from(worksTable)
                .where(and(eq(worksTable.id, id), eq(worksTable.userId, userId)));

            if (!existing) {
                return res.status(404).json({ success: false, message: "Work not found" });
            }

            // Hapus gambar dari Cloudinary jika ada
            if (existing.imagePublicId) {
                await deleteFromCloudinary(existing.imagePublicId);
            }

            await db.delete(worksTable).where(eq(worksTable.id, id));

            return res.status(200).json({ success: true, message: "Work deleted successfully" });
        } catch (error) {
            console.error("Delete work error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
            });
        }
    };
}

export default new WorksController();
