import { z } from "zod";

export const WORK_STATUS = [
    "Sketch",
    "Line Art",
    "Coloring",
    "Shading",
    "Background",
    "Final Touch",
    "Done",
] as const;

export const createWorkSchema = z.object({
    title: z.string().min(3, "Title minimal 3 karakter").max(255, "Title maksimal 255 karakter"),
    description: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(WORK_STATUS).optional(),
});

export const workIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const updateWorkParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const updateWorkSchema = z.object({
    title: z.string().min(3, "Title minimal 3 karakter").max(255).optional(),
    description: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(WORK_STATUS).optional(),
});
