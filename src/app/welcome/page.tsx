"use client";

import { GetSessionStorage } from "@/src/helpers/helpers";
import { useEffect } from "react";

export default function WelcomePage() {
  useEffect(() => {
    const token = GetSessionStorage("user_token");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>Bienvenido a Puntos Popular</h1>
      <p>Hola, {GetSessionStorage("user_name_data") || GetSessionStorage("user_name")}</p>
      <p>Has iniciado sesión correctamente.</p>
    </main>
  );
}