import { sql, ensureSchema } from "./db";

function monthBounds(month) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1, 0, 0, 0));
  return { start, end };
}

export async function getMonthlyReport(month) {
  await ensureSchema();
  const q = sql();
  const { start, end } = monthBounds(month);

  const rows = await q`
    SELECT e.id, e.name, p.kind, p.punched_at
    FROM employees e
    LEFT JOIN punches p
      ON p.employee_id = e.id
      AND p.punched_at >= ${start.toISOString()}
      AND p.punched_at < ${end.toISOString()}
    WHERE e.active = TRUE
    ORDER BY e.name, p.punched_at
  `;

  const byEmp = new Map();

  for (const r of rows) {
    if (!byEmp.has(r.id)) {
      byEmp.set(r.id, { id: r.id, employee: r.name, days: {}, totalSeconds: 0 });
    }
    if (!r.punched_at) continue;

    const emp = byEmp.get(r.id);
    const t = new Date(r.punched_at);
    const dateKey = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Zurich",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(t);

    const timeText = new Intl.DateTimeFormat("fr-CH", {
      timeZone: "Europe/Zurich",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(t);

    emp.days[dateKey] ||= { ins: [], outs: [], pairs: [] };
    if (r.kind === "IN") emp.days[dateKey].ins.push({ raw: t, text: timeText });
    if (r.kind === "OUT") emp.days[dateKey].outs.push({ raw: t, text: timeText });
  }

  for (const emp of byEmp.values()) {
    for (const day of Object.values(emp.days)) {
      const n = Math.min(day.ins.length, day.outs.length);
      for (let i = 0; i < n; i++) {
        const a = day.ins[i].raw;
        const b = day.outs[i].raw;
        if (b > a) {
          const sec = (b - a) / 1000;
          emp.totalSeconds += sec;
          day.pairs.push({
            in: day.ins[i].text,
            out: day.outs[i].text,
            hours: Math.round((sec / 3600) * 100) / 100
          });
        }
      }
    }
  }

  return Array.from(byEmp.values()).map(e => ({
    id: e.id,
    employee: e.employee,
    hours: Math.round((e.totalSeconds / 3600) * 100) / 100,
    days: Object.entries(e.days).sort(([a], [b]) => a.localeCompare(b)).map(([date, d]) => ({
      date,
      arrivals: d.ins.map(x => x.text),
      departures: d.outs.map(x => x.text),
      pairs: d.pairs
    }))
  }));
}

export function reportToCsv(month, report) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const lines = [
    ["Mois", month],
    ["Employé", "Date", "Arrivées", "Départs", "Heures jour", "Total mois"]
  ];
  for (const emp of report) {
    if (!emp.days.length) {
      lines.push([emp.employee, "", "", "", "", emp.hours]);
      continue;
    }
    emp.days.forEach((d, idx) => {
      const dayHours = d.pairs.reduce((s, p) => s + p.hours, 0);
      lines.push([
        emp.employee,
        d.date,
        d.arrivals.join(", "),
        d.departures.join(", "),
        Math.round(dayHours * 100) / 100,
        idx === 0 ? emp.hours : ""
      ]);
    });
  }
  return "\ufeff" + lines.map(r => r.map(esc).join(";")).join("\n");
}
