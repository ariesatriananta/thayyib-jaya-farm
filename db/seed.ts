import { db } from "./index.ts";
import { kandang, recordings, settings } from "./schema.ts";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function main() {
  if (!db) {
    throw new Error("DATABASE_URL is not set");
  }

  const now = new Date();

  const settingsSeed = {
    id: "00000000-0000-0000-0000-000000000001",
    farmName: "Thayyib Jaya Farm",
    defaultTargetHDPPercent: 90,
    defaultTargetFCR: 2.2,
    createdAt: now,
    updatedAt: now,
  };

  const kandangSeed = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Kandang A1",
      initialChickenCount: 5000,
      targetHDPPercent: 90,
      targetFCR: 2.2,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Kandang B1",
      initialChickenCount: 4500,
      targetHDPPercent: 88,
      targetFCR: 2.3,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const twoDaysAgo = formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));

  const recordingsSeed = [
    {
      id: "33333333-3333-3333-3333-333333333333",
      kandangId: kandangSeed[0].id,
      date: twoDaysAgo,
      feedInKg: 120,
      feedRemainingKg: 10,
      feedUsedKg: 110,
      eggsKg: 85,
      eggsCount: 1400,
      deadChickenCount: 2,
      notes: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      kandangId: kandangSeed[0].id,
      date: yesterday,
      feedInKg: 118,
      feedRemainingKg: 8,
      feedUsedKg: 110,
      eggsKg: 87,
      eggsCount: 1450,
      deadChickenCount: 1,
      notes: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      kandangId: kandangSeed[0].id,
      date: today,
      feedInKg: 122,
      feedRemainingKg: 9,
      feedUsedKg: 113,
      eggsKg: 88,
      eggsCount: 1460,
      deadChickenCount: 0,
      notes: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "66666666-6666-6666-6666-666666666666",
      kandangId: kandangSeed[1].id,
      date: twoDaysAgo,
      feedInKg: 110,
      feedRemainingKg: 12,
      feedUsedKg: 98,
      eggsKg: 78,
      eggsCount: 1250,
      deadChickenCount: 3,
      notes: "Produksi menurun - cuaca panas",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "77777777-7777-7777-7777-777777777777",
      kandangId: kandangSeed[1].id,
      date: yesterday,
      feedInKg: 112,
      feedRemainingKg: 10,
      feedUsedKg: 102,
      eggsKg: 80,
      eggsCount: 1280,
      deadChickenCount: 1,
      notes: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "88888888-8888-8888-8888-888888888888",
      kandangId: kandangSeed[1].id,
      date: today,
      feedInKg: 115,
      feedRemainingKg: 9,
      feedUsedKg: 106,
      eggsKg: 82,
      eggsCount: 1300,
      deadChickenCount: 0,
      notes: "",
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db
    .insert(settings)
    .values(settingsSeed)
    .onConflictDoNothing({ target: settings.id });

  await db
    .insert(kandang)
    .values(kandangSeed)
    .onConflictDoNothing({ target: kandang.id });

  await db
    .insert(recordings)
    .values(recordingsSeed)
    .onConflictDoNothing({ target: [recordings.kandangId, recordings.date] });

  console.log("Seed completed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
