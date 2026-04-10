"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.ok) {
      setSent(true);
    } else {
      setError(data.error || "Erro desconhecido");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: 48 }}>📬</div>
          <h2 style={styles.title}>Verifica o teu email</h2>
          <p style={styles.subtitle}>
            Enviámos um link de acesso para <strong>{email}</strong>.<br />
            O link expira em 15 minutos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ ...styles.title, color: "#6D28D9" }}>AgendaMoz</h1>
        <p style={styles.subtitle}>Entra com o teu email — sem senha</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="teu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "A enviar..." : "Enviar link de acesso"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#F5F3FF",
  },
  card: {
    background: "white", borderRadius: 16, padding: 40,
    maxWidth: 400, width: "100%", textAlign: "center",
    boxShadow: "0 4px 24px rgba(109,40,217,0.1)",
  },
  title: { margin: "0 0 8px", fontSize: 28, fontWeight: 700 },
  subtitle: { color: "#666", marginBottom: 24, lineHeight: 1.6 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    padding: "12px 16px", borderRadius: 8, fontSize: 16,
    border: "1.5px solid #D1D5DB", outline: "none",
  },
  button: {
    padding: "12px 24px", background: "#6D28D9", color: "white",
    border: "none", borderRadius: 8, fontSize: 16,
    fontWeight: 600, cursor: "pointer",
  },
};
