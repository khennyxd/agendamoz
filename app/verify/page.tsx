"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      window.location.href = `/api/auth/verify?token=${token}`;
    } else {
      router.push("/login?error=token_missing");
    }
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", fontFamily: "Arial",
      background: "#F5F3FF",
    }}>
      <div style={{ fontSize: 48 }}>⏳</div>
      <h2 style={{ color: "#6D28D9" }}>A verificar o teu acesso...</h2>
      <p style={{ color: "#888" }}>Aguarda um momento.</p>
    </div>
  );
}
