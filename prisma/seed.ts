import path from "path";
import { createClient } from "@libsql/client";

const dbPath = path.resolve(process.cwd(), "dev.db");
const libsql = createClient({ url: `file:${dbPath}` });

const routines = [
  {
    id: "seed-agua",
    name: "Tomar água",
    description: "Hidratar o corpo",
    category: "FOOD",
    targetValue: 300,
    unit: "ml",
    frequency: "DAILY",
    days: null,
    times: JSON.stringify(["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"]),
    snoozeMinutes: 30,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-cafe",
    name: "Café da manhã",
    description: null,
    category: "FOOD",
    targetValue: null,
    unit: null,
    frequency: "DAILY",
    days: null,
    times: JSON.stringify(["08:00"]),
    snoozeMinutes: 15,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-almoco",
    name: "Almoço",
    description: null,
    category: "FOOD",
    targetValue: null,
    unit: null,
    frequency: "DAILY",
    days: null,
    times: JSON.stringify(["12:30"]),
    snoozeMinutes: 15,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-jantar",
    name: "Jantar",
    description: null,
    category: "FOOD",
    targetValue: null,
    unit: null,
    frequency: "DAILY",
    days: null,
    times: JSON.stringify(["19:30"]),
    snoozeMinutes: 15,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-remedio",
    name: "Remédio manhã",
    description: "Com café da manhã",
    category: "MEDICINE",
    targetValue: null,
    unit: null,
    frequency: "DAILY",
    days: null,
    times: JSON.stringify(["08:00"]),
    snoozeMinutes: 10,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-skincare-manha",
    name: "Skincare matinal",
    description: "Limpeza, hidratante, protetor solar",
    category: "SKIN_CARE",
    targetValue: null,
    unit: null,
    frequency: "DAILY",
    days: null,
    times: JSON.stringify(["07:30"]),
    snoozeMinutes: 15,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-skincare-noite",
    name: "Skincare noturno",
    description: "Limpeza e hidratação",
    category: "SKIN_CARE",
    targetValue: null,
    unit: null,
    frequency: "DAILY",
    days: null,
    times: JSON.stringify(["22:00"]),
    snoozeMinutes: 15,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-academia",
    name: "Academia",
    description: null,
    category: "SUPPLEMENT",
    targetValue: null,
    unit: null,
    frequency: "CUSTOM",
    days: JSON.stringify([1, 2, 3, 4, 5]),
    times: JSON.stringify(["06:30"]),
    snoozeMinutes: 10,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-sono",
    name: "Dormir",
    description: "Meta de sono",
    category: "SLEEP",
    targetValue: 8,
    unit: "horas",
    frequency: "DAILY",
    days: null,
    times: JSON.stringify(["23:00"]),
    snoozeMinutes: 20,
    notifyBefore: 0,
    isActive: 1,
  },
  {
    id: "seed-relatorio",
    name: "Relatório diário",
    description: null,
    category: "WORK",
    targetValue: null,
    unit: null,
    frequency: "CUSTOM",
    days: JSON.stringify([1, 2, 3, 4, 5]),
    times: JSON.stringify(["17:30"]),
    snoozeMinutes: 15,
    notifyBefore: 0,
    isActive: 1,
  },
];

async function main() {
  console.log("🌱 Seeding routines...");
  const now = new Date().toISOString();

  for (const r of routines) {
    // Check if exists
    const existing = await libsql.execute({
      sql: "SELECT id FROM Routine WHERE id = ?",
      args: [r.id],
    });

    if (existing.rows.length === 0) {
      await libsql.execute({
        sql: `INSERT INTO Routine (id, name, description, category, targetValue, unit, isActive, frequency, days, times, notifyBefore, snoozeMinutes, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [r.id, r.name, r.description, r.category, r.targetValue, r.unit, r.isActive, r.frequency, r.days, r.times, r.notifyBefore, r.snoozeMinutes, now, now],
      });
      console.log(`  ✓ ${r.name}`);
    } else {
      console.log(`  ~ ${r.name} (já existe)`);
    }
  }

  console.log(`\n✅ Seed concluído`);
}

main().catch(console.error).finally(() => libsql.close());
