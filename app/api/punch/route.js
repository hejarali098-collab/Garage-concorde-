import { NextResponse } from "next/server";
import { ensureSchema, sql, hashPin, lausanneNowText } from "../../../lib/db";

export async function POST(req) {
  try {
    await ensureSchema();
    const { employeeId, pin, kind } = await req.json();

    if (!["IN","OUT"].includes(kind)) {
      return NextResponse.json({message:"Action invalide."}, {status:400});
    }

    const q = sql();
    const rows = await q`
      SELECT id, name, pin_hash
      FROM employees
      WHERE id=${Number(employeeId)} AND active=TRUE
      LIMIT 1
    `;
    const emp = rows[0];

    if (!emp || hashPin(String(pin || "")) !== emp.pin_hash) {
      return NextResponse.json({message:"PIN incorrect."}, {status:401});
    }

    await q`
      INSERT INTO punches(employee_id, kind)
      VALUES (${emp.id}, ${kind})
    `;

    const action = kind === "IN" ? "Arrivée" : "Départ";
    return NextResponse.json({
      message:`${emp.name} — ${action} enregistré à ${lausanneNowText(new Date())}.`
    });
  } catch (e) {
    return NextResponse.json({message:e.message || "Erreur serveur."}, {status:500});
  }
}
