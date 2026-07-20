"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChartOutlined,
  SwapHorizOutlined,
  ReceiptOutlined,
  LogoutOutlined,
  MenuOpenOutlined,
  MenuOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
}

export default function Sidebar({ onToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <BarChartOutlined className="popular-sidebar-icon" /> },
    { name: "Transacciones", href: "/transacciones", icon: <SwapHorizOutlined className="popular-sidebar-icon" /> },
    { name: "Servicios Públicos", href: "/servicios", icon: <ReceiptOutlined className="popular-sidebar-icon" /> },
  ];

  const nombreUsuario = typeof window !== "undefined" ? sessionStorage.getItem("user_name_data") || "ERICK RAMIREZ" : "ERICK RAMIREZ";

  return (
    <aside className={`popular-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Botón flotante para colapsar/expandir */}
      <button className="popular-sidebar-toggle" onClick={handleToggle} title="Minimizar / Expandir Menú">
        {isCollapsed ? <MenuOutlined /> : <MenuOpenOutlined />}
      </button>

      {/* Encabezado con el Logo Real */}
      <div className="popular-sidebar-header">
        <div className="popular-sidebar-brand-wrapper">
          <img 
            src="/imgs/puntos-popular-logo.png" 
            alt="Puntos Popular" 
            className="popular-brand-logo-img" 
          />
        </div>
      </div>

      {/* Perfil del Agente */}
      <div className="popular-sidebar-profile">
        <div className="profile-avatar">
          <AccountCircleOutlined style={{ color: "#1f4d8f" }} />
        </div>
        {!isCollapsed && (
          <div className="profile-info">
            <span className="profile-name">{nombreUsuario}</span>
            <span className="profile-role">Agente Corresponsal</span>
          </div>
        )}
      </div>

      {/* Navegación del Menú */}
      <nav className="popular-sidebar-menu">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`popular-sidebar-item ${isActive ? "active" : ""}`}
            >
              {item.icon}
              <span className="menu-label">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar con opción de Cerrar Sesión */}
      <div className="popular-sidebar-footer">
        <Link href="/" className="popular-sidebar-item logout-item">
          <LogoutOutlined className="popular-sidebar-icon" />
          <span className="menu-label">Cerrar Sesión</span>
        </Link>
        {!isCollapsed && <p className="popular-copyright">© 2026 Banco Popular</p>}
      </div>
    </aside>
  );
}