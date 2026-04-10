"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      window.location.href = `/api/auth/verify?token=${token}`;
    } else {
      router.push("/login?error=token_missing");
    }
  }, []);

  return <p>Verificando...</p>;
}