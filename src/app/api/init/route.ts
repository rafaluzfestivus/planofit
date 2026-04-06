import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

function getClient() {
  const url = process.env.DATABASE_URL!;
  const match = url.match(/\?authToken=(.+)$/);
  const authToken = match ? match[1] : undefined;
  const cleanUrl = url.replace(/\?authToken=.+$/, "");
  return createClient({ url: cleanUrl, authToken });
}

const SQL = [
  `CREATE TABLE IF NOT EXISTS "Routine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "targetValue" REAL,
    "unit" TEXT,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "frequency" TEXT NOT NULL,
    "days" TEXT,
    "times" TEXT NOT NULL,
    "notifyBefore" INTEGER NOT NULL DEFAULT 0,
    "snoozeMinutes" INTEGER NOT NULL DEFAULT 10,
    "googleEventId" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    "updatedAt" TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS "RoutineLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routineId" TEXT NOT NULL,
    "scheduledAt" TEXT NOT NULL,
    "completedAt" TEXT,
    "targetValue" REAL,
    "actualValue" REAL,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint")`,
  `CREATE TABLE IF NOT EXISTS "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleCalendarSync" INTEGER NOT NULL DEFAULT 0,
    "googleRefreshToken" TEXT
  )`,
];

export async function GET() {
  try {
    const client = getClient();
    for (const sql of SQL) {
      await client.execute(sql);
    }
    client.close();
    return NextResponse.json({ success: true, message: "Banco de dados inicializado!" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
