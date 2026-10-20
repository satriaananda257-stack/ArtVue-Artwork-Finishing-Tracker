import { Response } from "express";
import { AuthRequest } from "../../config/middleware/auth.middleware";
import { updateProfileSchema, userParamSchema } from "../../validations/profile.validation";
import { db } from "../../config/db";
import { usersTable, profilesTable } from "../../config/schema";
import { eq } from "drizzle-orm";

export class UsersController {
    // GET MY PROFILE
    getMyProfile = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            return res.json(await this._buildProfile(userId));
        } catch (error) {
            console.error("Get my profile error:", error);
            return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
        }
    };

    // GET USER PROFILE BY ID
    getUserProfile = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = userParamSchema.parse(req.params);
            return res.json(await this._buildProfile(id));
        } catch (error) {
            console.error("Get user profile error:", error);
            return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
        }
    };

    // UPDATE MY PROFILE
    updateMyProfile = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const validated = updateProfileSchema.parse(req.body);

            const existing = await db.query.profilesTable.findFirst({
                where: eq(profilesTable.userId, userId),
            });

            if (existing) {
                await db.update(profilesTable).set({
                    ...(validated.username !== undefined && { username: validated.username }),
                    ...(validated.bio !== undefined && { bio: validated.bio }),
                }).where(eq(profilesTable.userId, userId));
            } else {
                await db.insert(profilesTable).values({
                    userId,
                    username: validated.username ?? "user",
                    bio: validated.bio,
                });
            }

            return res.json(await this._buildProfile(userId));
        } catch (error) {
            console.error("Update profile error:", error);
            return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
        }
    };

    // PRIVATE: build profile
    private _buildProfile = async (userId: number) => {
        const [user] = await db
            .select({
                id: usersTable.id,
                email: usersTable.email,
                role: usersTable.role,
                createdAt: usersTable.createdAt,
                username: profilesTable.username,
                bio: profilesTable.bio,
                profilePicture: profilesTable.profilePicture,
            })
            .from(usersTable)
            .leftJoin(profilesTable, eq(usersTable.id, profilesTable.userId))
            .where(eq(usersTable.id, userId));

        if (!user) return { success: false, message: "User not found" };

        return {
            success: true,
            message: "Profile retrieved successfully",
            data: { profile: user },
        };
    };
}

export default new UsersController();
