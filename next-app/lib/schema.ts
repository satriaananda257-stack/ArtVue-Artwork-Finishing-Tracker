import {
  mysqlTable,
  mysqlEnum,
  int,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core"

export const USER_ROLES = ["user", "admin"] as const

export const WORK_STATUS = [
  "Sketch",
  "Line Art",
  "Coloring",
  "Shading",
  "Background",
  "Final Touch",
  "Done",
] as const

export const usersTable = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", USER_ROLES).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
})

export const profilesTable = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 100 }).notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
})

export const worksTable = mysqlTable("works", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  imagePublicId: varchar("image_public_id", { length: 255 }),
  description: text("description"),
  notes: text("notes"),
  status: mysqlEnum("status", WORK_STATUS).notNull().default("Sketch"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
})
