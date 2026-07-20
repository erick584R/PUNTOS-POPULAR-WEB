"use client";

import { useEffect, useState } from "react";

export default function WelcomePage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedName = sessionStorage.getItem("user_name_data") || "";
    setUserName(storedName);
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>Bienvenido</h1>
      <p>{userName !== "" ? userName : "Cargando usuario..."}</p>
    </main>
  );
}