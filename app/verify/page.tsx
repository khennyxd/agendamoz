"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Esta página recebe o callback do Supabase após magic link/OTP
export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase coloca o token na hash (#access_token=...) — o cliente trata automaticamente
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    // Fallback: se já tem sessão vai direto para dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });

    return () => authListener.subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", fontFamily: "Arial",
      background: "#F5F3FF",
    }}>
      <div style={{ fontSize: 48 }}>⏳</div>
      <h2 style={{ color: "#6D28D9", margin: "16px 0 8px" }}>A verificar sessão...</h2>
      <p style={{ color: "#888" }}>Aguarda um momento.</p>
    </div>
  );
}
