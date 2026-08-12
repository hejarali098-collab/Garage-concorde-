import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

export function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL manquant. Connectez une base Postgres/Neon dans Vercel.");
  }
  return neon(process.env.DATABASE_URL);
}

export function hashPin(pin) {
  const salt = process.env.PIN_SALT || "garage-concorde";
  return crypto.createHash("sha256").update(`${salt}:${pin}`).digest("hex");
}

export async function ensureSchema() {
  const q = sql();

  await q`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      pin_hash TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await q`
    CREATE TABLE IF NOT EXISTS punches (
      id BIGSERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('IN','OUT')),
      punched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const defaults = [
    ["Youssef Althiab", "1111"],
    ["Hatem Hussein", "2222"],
    ["Faisel Azizi", "3333"],
    ["Ali Abdullah", "4444"],
    ["Ali Amiri Asghar", "5555"]
  ];

  for (const [name, pin] of defaults) {
    await q`
      INSERT INTO employees (name, pin_hash)
      VALUES (${name}, ${hashPin(pin)})
      ON CONFLICT (name) DO NOTHING
    `;
  }
}

export function lausanneNowText(d = new Date()) {
  return new Intl.DateTimeFormat("fr-CH", {
    timeZone: "Europe/Zurich",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(d);
}
