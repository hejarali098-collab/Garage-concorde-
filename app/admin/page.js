"use client";
import { useState } from "react";

export default function Admin() {
  const now = new Date();
  const [password, setPassword] = useState("");
  const [month, setMonth] = useState(now.toISOString().slice(0,7));
  const [report, setReport] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/admin/report", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({password, month})
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Erreur");
      setReport(d.report || []);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally { setBusy(false); }
  }

  async function downloadCsv() {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/admin/report", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({password, month, format:"csv"})
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.message || "Erreur");
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `rapport_pointage_${month}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally { setBusy(false); }
  }

  return (
    <main className="wide">
      <section className="hero">
        <h1>Administration</h1>
        <p>Rapport mensuel des heures</p>
      </section>

      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <section className="panel">
        <div className="row">
          <div>
            <label>Mot de passe administrateur</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div>
            <label>Mois</label>
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
          </div>
          <button disabled={busy} onClick={load}>Afficher</button>
          <button disabled={busy} onClick={downloadCsv}>Télécharger CSV</button>
        </div>
      </section>

      {report.length > 0 && <>
        <section className="panel">
          <h2>Total du mois</h2>
          <div className="grid">
            {report.map(r => (
              <div className="stat" key={r.id}>
                <strong>{r.employee}</strong>
                <span>{r.hours.toFixed(2)} h</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Détail</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employé</th><th>Date</th><th>Arrivées</th><th>Départs</th></tr></thead>
              <tbody>
                {report.flatMap(r => r.days.map(d => (
                  <tr key={`${r.id}-${d.date}`}>
                    <td>{r.employee}</td>
                    <td>{d.date}</td>
                    <td>{d.arrivals.join(", ")}</td>
                    <td>{d.departures.join(", ")}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </section>
      </>}

      <p><a href="/">← Retour au pointage</a></p>
    </main>
  );
}
