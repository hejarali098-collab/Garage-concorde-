import { NextResponse } from "next/server";
import { ensureSchema, sql } from "../../../../lib/db";

export async function POST(req) {
  try {
    await ensureSchema();
    const { password, month } = await req.json();
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Mot de passe incorrect." }, { status: 401 });
    }

    const selectedMonth = month || new Date().toISOString().slice(0,7);
    const [y,m] = selectedMonth.split("-").map(Number);
    const start = `${selectedMonth}-01T00:00:00.000Z`;
    const endDate = m === 12 ? `${y+1}-01-01T00:00:00.000Z` : `${y}-${String(m+1).padStart(2,"0")}-01T00:00:00.000Z`;

    const q = sql();
    const rows = await q`
      SELECT e.id, e.name, p.kind, p.punched_at
      FROM employees e
      LEFT JOIN punches p
        ON p.employee_id=e.id
        AND p.punched_at >= ${start}
        AND p.punched_at < ${endDate}
      WHERE e.active=TRUE
      ORDER BY e.name, p.punched_at
    `;

    return NextResponse.json({ month: selectedMonth, rows });
  } catch (e) {
    return NextResponse.json({ message: e.message || "Erreur serveur." }, { status: 500 });
  }
}
