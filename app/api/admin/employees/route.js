import { NextResponse } from "next/server";
import { ensureSchema, sql } from "../../../../lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const q = sql();
    const employees = await q`
      SELECT id, name FROM employees
      WHERE active=TRUE
      ORDER BY name
    `;
    return NextResponse.json({employees});
  } catch (e) {
    return NextResponse.json({employees:[], error:e.message}, {status:500});
  }
}
