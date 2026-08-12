"use client";
import { useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState(null);

  async function load() {
    setMsg(null);
    const r = await fetch("/api/admin/report", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ password, month })
    });
    const d = await r.json();
    if (!r.ok) return setMsg(d.message || "Erreur");
    setRows(d.rows || []);
  }

  return (
    <main className="wide">
      <section className="hero">
        <h1>Administration</h1>
        <p>Rapport des heures</p>
      </section>

      <section className="panel">
        <label>Mot de passe administrateur</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <label>Mois</label>
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
        <button onClick={load}>Afficher</button>
      </section>

      {msg && <div className="msg err">{msg}</div>}

      <section className="panel">
        <h2>Pointages</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employé</th><th>Type</th><th>Date/heure</th></tr></thead>
            <tbody>
              {rows.filter(r=>r.punched_at).map((r,i)=>(
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{r.kind === "IN" ? "Entrée" : "Sortie"}</td>
                  <td>{new Date(r.punched_at).toLocaleString("fr-CH")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p><a href="/">← Retour</a></p>
    </main>
  );
}
