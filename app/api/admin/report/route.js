import { NextResponse } from "next/server";
import { getMonthlyReport, reportToCsv } from "../../../../lib/report";

export async function POST(req) {
  try {
    const { password, month, format } = await req.json();
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({message:"Mot de passe incorrect."}, {status:401});
    }

    const selectedMonth = month || new Date().toISOString().slice(0,7);
    const report = await getMonthlyReport(selectedMonth);

    if (format === "csv") {
      const csv = reportToCsv(selectedMonth, report);
      return new NextResponse(csv, {
        status:200,
        headers:{
          "Content-Type":"text/csv; charset=utf-8",
          "Content-Disposition":`attachment; filename="rapport_pointage_${selectedMonth}.csv"`
        }
      });
    }

    return NextResponse.json({month:selectedMonth, report});
  } catch (e) {
    return NextResponse.json({message:e.message || "Erreur serveur."}, {status:500});
  }
}
