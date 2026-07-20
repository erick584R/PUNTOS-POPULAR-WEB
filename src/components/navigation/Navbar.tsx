"use client";

import React, { useEffect, useState } from "react";
import { AccountCircleOutlined } from "@mui/icons-material";

export default function Navbar() {
  const [agente, setAgente] = useState({ nombre: "Cargando...", cuenta: "..." });

  useEffect(() => {
    // Obtenemos los campos guardados durante el inicio de sesión exitoso
    const nombreGuardado = sessionStorage.getItem("user_name_data") || "AGENTE POPULAR";
    const cuentaGuardada = sessionStorage.getItem("user_id") || "000000";
    
    setAgente({
      nombre: nombreGuardado,
      cuenta: cuentaGuardada,
    });
  }, []);

  return (
    <header className="popular-top-navbar">
      <div className="popular-navbar-spacer" />
      <div className="popular-navbar-user-box">
        <AccountCircleOutlined className="popular-navbar-user-icon" />
        <div className="popular-navbar-user-info">
          <span className="navbar-username">{agente.nombre}</span>
          <span className="navbar-user-account">Cuenta: {agente.cuenta}</span>
        </div>
      </div>
    </header>
  );
}