import { NextResponse } from "next/server";
import { getMonthlyReport, reportToCsv } from "../../../../lib/report";

function previousMonth() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
}

export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({message:"Non autorisé"}, {status:401});
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.REPORT_EMAIL;
    const from = process.env.REPORT_FROM;
    if (!apiKey || !to || !from) {
      return NextResponse.json({
        message:"Rapport calculé, mais e-mail non configuré (RESEND_API_KEY / REPORT_EMAIL / REPORT_FROM)."
      }, {status:200});
    }

    const month = previousMonth();
    const report = await getMonthlyReport(month);
    const csv = reportToCsv(month, report);
    const base64 = Buffer.from(csv, "utf8").toString("base64");

    const r = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${apiKey}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        from,
        to:[to],
        subject:`Rapport mensuel des heures - ${month}`,
        text:`Rapport de pointage Garage Concorde pour ${month}.`,
        attachments:[{
          filename:`rapport_pointage_${month}.csv`,
          content:base64
        }]
      })
    });

    const data = await r.json();
    if (!r.ok) return NextResponse.json({message:"Erreur e-mail", data}, {status:500});
    return NextResponse.json({message:"Rapport envoyé", data});
  } catch (e) {
    return NextResponse.json({message:e.message || "Erreur"}, {status:500});
  }
}
