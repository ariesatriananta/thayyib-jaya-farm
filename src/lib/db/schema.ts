import { pgTable, text, integer, real, timestamp, date, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
});

export const kandang = pgTable("kandang", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  initialChickenCount: integer("initial_chicken_count").notNull(),
  targetHDPPercent: real("target_hdp_percent").notNull(),
  targetFCR: real("target_fcr").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
});

export const recordings = pgTable("recordings", {
  id: uuid("id").primaryKey(),
  kandangId: uuid("kandang_id").notNull().references(() => kandang.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  feedInKg: real("feed_in_kg").notNull(),
  feedRemainingKg: real("feed_remaining_kg").notNull(),
  feedUsedKg: real("feed_used_kg").notNull(),
  eggsKg: real("eggs_kg").notNull(),
  eggsCount: integer("eggs_count").notNull(),
  deadChickenCount: integer("dead_chicken_count").notNull(),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
});

export const settings = pgTable("settings", {
  id: uuid("id").primaryKey(),
  farmName: text("farm_name").notNull(),
  defaultTargetHDPPercent: real("default_target_hdp_percent").notNull(),
  defaultTargetFCR: real("default_target_fcr").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
});

export const staffKandangAccess = pgTable(
  "staff_kandang_access",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kandangId: uuid("kandang_id").notNull().references(() => kandang.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => ({
    userKandangUnique: uniqueIndex("staff_kandang_access_user_kandang_unique").on(
      table.userId,
      table.kandangId
    ),
  })
);
