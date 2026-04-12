"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });

    // Se já tem sessão activa, redireciona imediatamente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#F5F3FF",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 48 }}>⏳</div>
      <h2 style={{ color: "#6D28D9", margin: "16px 0 8px" }}>
        A verificar sessão...
      </h2>
      <p style={{ color: "#888" }}>Aguarda um momento.</p>
    </div>
  );
}
