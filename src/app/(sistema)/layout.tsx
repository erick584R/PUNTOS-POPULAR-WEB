"use client";

import React, { useState } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import Navbar from "@/components/navigation/Navbar";

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="popular-dashboard-layout">
      {/* El menú lateral se invoca una sola vez de forma global */}
      <Sidebar onToggle={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      
      {/* El contenedor derecho completo reacciona expandiéndose si el menú se minimiza */}
      <div className={`popular-content-wrapper ${isSidebarCollapsed ? "expanded" : ""}`}>
        {/* Navbar global fijo en la parte superior */}
        <Navbar />

        {/* Contenedor de las vistas internas con espaciado superior optimizado */}
        <main className="popular-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}