import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

export interface JWTPayload {
  id: number
  email: string
  role: string
}

export function verifyToken(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "helloworld"
    ) as JWTPayload
    return decoded
  } catch {
    return null
  }
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET ?? "helloworld", {
    expiresIn: "7d",
  })
}
