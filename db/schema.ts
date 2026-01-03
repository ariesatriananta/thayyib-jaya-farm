import {
  pgTable,
  text,
  integer,
  real,
  date,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const kandang = pgTable("kandang", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  initialChickenCount: integer("initial_chicken_count").notNull(),
  targetHDPPercent: real("target_hdp_percent").notNull(),
  targetFCR: real("target_fcr").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const recordings = pgTable(
  "recordings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kandangId: uuid("kandang_id")
      .notNull()
      .references(() => kandang.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    feedInKg: real("feed_in_kg").notNull(),
    feedRemainingKg: real("feed_remaining_kg").notNull(),
    feedUsedKg: real("feed_used_kg").notNull(),
    eggsKg: real("eggs_kg").notNull(),
    eggsCount: integer("eggs_count").notNull(),
    deadChickenCount: integer("dead_chicken_count").notNull(),
    notes: text("notes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    uniqueKandangDate: uniqueIndex("recordings_kandang_date_unique").on(
      table.kandangId,
      table.date
    ),
  })
);

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  farmName: text("farm_name").notNull(),
  defaultTargetHDPPercent: real("default_target_hdp_percent").notNull(),
  defaultTargetFCR: real("default_target_fcr").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
