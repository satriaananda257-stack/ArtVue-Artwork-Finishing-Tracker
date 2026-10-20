import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from './schema';
import dotenv from "dotenv";
dotenv.config();

// Support Aiven (DATABASE_URL) atau variabel terpisah
const isAiven = !!process.env.DATABASE_URL;

const pool = isAiven
    ? mysql.createPool({
          uri: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: true },
          waitForConnections: true,
          connectionLimit: 10,
      })
    : mysql.createPool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
          waitForConnections: true,
          connectionLimit: 10,
      });

export const db = drizzle(pool, { schema, mode: "default" });
