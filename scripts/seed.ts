import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { db } from "../src/lib/db/index";
import { kandang, recordings, settings, users, staffKandangAccess } from "../src/lib/db/schema";
import { initialKandang, initialRecordings, initialSettings } from "../src/lib/mock/mockData";
import { SETTINGS_ID } from "../src/lib/db/constants";

async function seed() {
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash("thayyib123", 10);

  await db.delete(recordings);
  await db.delete(staffKandangAccess);
  await db.delete(kandang);
  await db.delete(settings);
  await db.delete(users);

  const adminId = randomUUID();
  const staffId = randomUUID();

  await db.insert(users).values([
    {
      id: adminId,
      username: "thayyib",
      name: "Thayyib",
      role: "admin",
      passwordHash,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: staffId,
      username: "staff",
      name: "Staff Farm",
      role: "staff",
      passwordHash: await bcrypt.hash("staff123", 10),
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.insert(settings).values({
    id: SETTINGS_ID,
    farmName: initialSettings.farmName,
    defaultTargetHDPPercent: initialSettings.defaultTargetHDPPercent,
    defaultTargetFCR: initialSettings.defaultTargetFCR,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(kandang).values(
    initialKandang.map((item) => ({
      id: item.id,
      name: item.name,
      initialChickenCount: item.initialChickenCount,
      targetHDPPercent: item.targetHDPPercent,
      targetFCR: item.targetFCR,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  );

  await db.insert(recordings).values(
    initialRecordings.map((item) => ({
      id: item.id,
      kandangId: item.kandangId,
      date: item.date,
      feedInKg: item.feedInKg,
      feedRemainingKg: item.feedRemainingKg,
      feedUsedKg: item.feedUsedKg,
      eggsKg: item.eggsKg,
      eggsCount: item.eggsCount,
      deadChickenCount: item.deadChickenCount,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  );

  await db.insert(staffKandangAccess).values([
    {
      id: randomUUID(),
      userId: staffId,
      kandangId: initialKandang[0].id,
      createdAt: now,
    },
    {
      id: randomUUID(),
      userId: staffId,
      kandangId: initialKandang[2].id,
      createdAt: now,
    },
  ]);
}

seed()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
