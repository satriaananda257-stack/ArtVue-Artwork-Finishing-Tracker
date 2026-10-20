import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../../validations/auth.validation";
import { db } from "../../config/db";
import { eq } from "drizzle-orm";
import { usersTable, profilesTable } from "../../config/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClerkClient, verifyToken } from "@clerk/backend";

export class AuthController {
    register = async (req: Request, res: Response) => {
        try {
            const { username, email, password } = registerSchema.parse(req.body);

            const existingEmail = await db.query.usersTable.findFirst({
                where: eq(usersTable.email, email),
            });
            if (existingEmail) {
                return res.status(409).json({ success: false, message: "Email already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [insertedUser] = await db
                .insert(usersTable)
                .values({ email, password: hashedPassword })
                .$returningId();

            await db.insert(profilesTable).values({
                userId: insertedUser.id,
                username,
            });

            return res.status(201).json({
                success: true,
                message: "Register successful",
                data: {
                    user: {
                        id: insertedUser.id,
                        username,
                        email,
                    },
                },
            });
        } catch (error) {
            console.error("Register error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : String(error),
            });
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = loginSchema.parse(req.body);

            const user = await db.query.usersTable.findFirst({
                where: eq(usersTable.email, email),
            });
            if (!user) {
                return res.status(404).json({ success: false, message: "Email or password incorrect" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, message: "Email or password incorrect" });
            }

            const profile = await db.query.profilesTable.findFirst({
                where: eq(profilesTable.userId, user.id),
            });

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn: "7d" }
            );

            return res.status(200).json({
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
            });
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
            });
        }
    };

    // Clerk OAuth — verifikasi Clerk session token, auto-create user jika belum ada
    clerkAuth = async (req: Request, res: Response) => {
        try {
            const { clerkToken } = req.body;
            if (!clerkToken) {
                return res.status(400).json({ success: false, message: "clerkToken required" });
            }

            const clerkClient = createClerkClient({
                secretKey: process.env.CLERK_SECRET_KEY,
            });

            // Verifikasi token Clerk
            let clerkUserId: string;
            try {
                const payload = await verifyToken(clerkToken, {
                    secretKey: process.env.CLERK_SECRET_KEY,
                });
                clerkUserId = payload.sub;
            } catch {
                return res.status(401).json({ success: false, message: "Token Clerk tidak valid" });
            }

            // Ambil data user dari Clerk
            const clerkUser = await clerkClient.users.getUser(clerkUserId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (!email) {
                return res.status(400).json({ success: false, message: "Email tidak ditemukan di akun Clerk" });
            }

            const firstName = clerkUser.firstName ?? "";
            const lastName = clerkUser.lastName ?? "";
            const username = firstName
                ? `${firstName}${lastName ? "_" + lastName : ""}`.toLowerCase().replace(/\s+/g, "_")
                : email.split("@")[0];

            // Cari user di DB berdasarkan email
            let user = await db.query.usersTable.findFirst({
                where: eq(usersTable.email, email),
            });

            if (!user) {
                // Auto-create user baru
                const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
                const [inserted] = await db
                    .insert(usersTable)
                    .values({ email, password: randomPassword })
                    .$returningId();

                await db.insert(profilesTable).values({
                    userId: inserted.id,
                    username,
                });

                user = await db.query.usersTable.findFirst({
                    where: eq(usersTable.id, inserted.id),
                });
            }

            if (!user) {
                return res.status(500).json({ success: false, message: "Gagal membuat user" });
            }

            const profile = await db.query.profilesTable.findFirst({
                where: eq(profilesTable.userId, user.id),
            });

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET as string,
                { expiresIn: "7d" }
            );

            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: profile?.username ?? username,
                        email: user.email,
                        role: user.role,
                    },
                },
            });
        } catch (error) {
            console.error("Clerk auth error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
            });
        }
    };
}

export default new AuthController();
