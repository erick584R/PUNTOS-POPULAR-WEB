"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GetSessionStorage,
  RemoveLocalStorage,
  RemoveSessionStorage,
  ClearCurrentSession,
} from "@/helpers/helpers";
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
  const [mounted, setMounted] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const nombre = GetSessionStorage("user_name_data") || "";
    setNombreUsuario(nombre);
  }, []);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  const limpiarFrontend = () => {
    ClearCurrentSession();
    sessionStorage.removeItem("__signalRConnection");
    delete (window as any).__signalRConnection;
  };

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const token = GetSessionStorage("user_token");
    const usuario = GetSessionStorage("user_name");
    const ctnro = GetSessionStorage("user_id");
    const ipDispositivo = GetSessionStorage("device_ip");
    const dispositivoPrincipal = GetSessionStorage("user_main_disp");

    const bpInReq = {
      canal: parseInt(process.env.NEXT_PUBLIC_CANAL_CORRESPONSAL || "3"),
      dispositivoFisico: dispositivoPrincipal || "",
      ipDispositivo,
      ctnro,
      usuario,
      token,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL}/api/Seguridad/v1/BancoPopular/cerrar-sesion-corresponsal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ bpInReq }),
        }
      );

      const data = await response.json();
      const codigo =
        data?.bpOutReq?.codigoError ??
        data?.bpOutReq?.CodigoError ??
        data?.CodigoError ??
        data?.codigoError;

      const mensaje =
        data?.bpOutReq?.mensajeError ??
        data?.bpOutReq?.MensajeError ??
        data?.MensajeError ??
        data?.mensajeError ??
        "Falló el cierre de la sesión.";

      if (response.ok && codigo === "0") {
        limpiarFrontend();
        router.replace("/");
        return;
      }

      alert(`Error ${codigo ?? "desconocido"}: ${mensaje}`);
    } catch {
      alert("No se pudo cerrar la sesión. Intente nuevamente.");
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <BarChartOutlined className="popular-sidebar-icon" /> },
    { name: "Transacciones", href: "/transacciones", icon: <SwapHorizOutlined className="popular-sidebar-icon" /> },
    { name: "Servicios Públicos", href: "/servicios", icon: <ReceiptOutlined className="popular-sidebar-icon" /> },
  ];

  return (
    <aside className={`popular-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="popular-sidebar-toggle" onClick={handleToggle} title="Minimizar / Expandir Menú">
        {isCollapsed ? <MenuOutlined /> : <MenuOpenOutlined />}
      </button>

      <div className="popular-sidebar-header">
        <div className="popular-sidebar-brand-wrapper">
          <img
            src="/imgs/puntos-popular-logo.png"
            alt="Puntos Popular"
            className="popular-brand-logo-img"
          />
        </div>
      </div>

      <div className="popular-sidebar-profile">
        <div className="profile-avatar">
          <AccountCircleOutlined style={{ color: "#1f4d8f" }} />
        </div>
        {!isCollapsed && (
          <div className="profile-info">
            <span className="profile-name">{mounted ? nombreUsuario : ""}</span>
            <span className="profile-role">Agente Corresponsal</span>
          </div>
        )}
      </div>

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

      <div className="popular-sidebar-footer">
        <a href="/" className="popular-sidebar-item logout-item" onClick={handleLogout}>
          <LogoutOutlined className="popular-sidebar-icon" />
          <span className="menu-label">Cerrar Sesión</span>
        </a>
        {!isCollapsed && <p className="popular-copyright">© 2026 Banco Popular</p>}
      </div>
    </aside>
  );
}