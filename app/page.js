"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/employees")
      .then(r => r.json())
      .then(d => setEmployees(d.employees || []))
      .catch(() => setMsg({ type:"err", text:"Impossible de charger les employés." }));
  }, []);

  async function punch(kind) {
    if (!selected) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/punch", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ employeeId:selected.id, pin, kind })
      });
      const d = await r.json();
      setMsg({ type:r.ok ? "ok" : "err", text:d.message || "Erreur" });
      if (r.ok) { setPin(""); setSelected(null); }
    } catch {
      setMsg({ type:"err", text:"Erreur de connexion." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <section className="brand">
        <img src="/garage-concorde-logo.jpeg" alt="Garage Concorde Sàrl" className="logo" />
      </section>

      <section className="hero center">
        <h1>Pointage des employés</h1>
        <p>Cliquez sur votre nom</p>
      </section>

      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <section className="employee-grid">
        {employees.map(e => (
          <button key={e.id}
            className={`employee-card ${selected?.id === e.id ? "selected" : ""}`}
            onClick={() => { setSelected(e); setMsg(null); }}
            type="button">
            <span className="person-icon">●</span>
            <strong>{e.name}</strong>
            <span className="tap-hint">Cliquer ici</span>
          </button>
        ))}
      </section>

      {selected && (
        <section className="panel">
          <h2>{selected.name}</h2>
          <label>PIN personnel</label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={pin}
            onChange={e=>setPin(e.target.value)}
            autoFocus
          />
          <div className="actions">
            <button className="in" disabled={busy || !pin} onClick={()=>punch("IN")}>Entrée</button>
            <button className="out" disabled={busy || !pin} onClick={()=>punch("OUT")}>Sortie</button>
          </div>
        </section>
      )}

      <p className="admin-link"><a href="/admin">Administrateur</a></p>
    </main>
  );
}
