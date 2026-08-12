"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/employees")
      .then(r => r.json())
      .then(d => {
        setEmployees(d.employees || []);
        if (d.employees?.[0]) setEmployeeId(String(d.employees[0].id));
      })
      .catch(() => setMsg({type:"err", text:"Impossible de charger les employés."}));
  }, []);

  async function punch(kind) {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/punch", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ employeeId, pin, kind })
      });
      const d = await r.json();
      setMsg({type:r.ok ? "ok":"err", text:d.message || "Erreur"});
      if (r.ok) setPin("");
    } catch {
      setMsg({type:"err", text:"Erreur de connexion."});
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <h1>Garage Concorde</h1>
        <p>Pointage des heures</p>
      </section>

      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <section className="panel">
        <h2>Pointage employé</h2>
        <label>Votre nom</label>
        <select value={employeeId} onChange={e=>setEmployeeId(e.target.value)}>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <label>PIN personnel</label>
        <input
          type="password"
          inputMode="numeric"
          placeholder="••••"
          value={pin}
          onChange={e=>setPin(e.target.value)}
        />

        <div className="actions">
          <button className="in" disabled={busy} onClick={()=>punch("IN")}>Je commence</button>
          <button className="out" disabled={busy} onClick={()=>punch("OUT")}>Je termine</button>
        </div>
      </section>

      <p className="small" style={{textAlign:"center"}}>
        <a href="/admin">Espace administrateur</a>
      </p>
    </main>
  );
}
