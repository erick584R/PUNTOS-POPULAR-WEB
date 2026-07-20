"use client";

import React, { useEffect, useState } from "react";
import {
  PaidOutlined,
  ReceiptLongOutlined,
  BarChartOutlined,
  LogoutOutlined,
  AccountBalanceWalletOutlined,
  FilterAltOutlined,
} from "@mui/icons-material";
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

// Interfaces locales para mockups
interface Transaccion {
  id: number;
  tipo: "REMESAS" | "ACH" | "Servicios" | "Depósitos" | "Retiros";
  nombre: string;
  monto: number;
  fecha: string;
  IdMovimiento: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("ERICK RAMIREZ");
  const [filtroActivo, setFiltroActivo] = useState<
    "TODOS" | "REMESAS" | "ACH" | "Servicios" | "Depósitos" | "Retiros"
  >("TODOS");

  // Estado para controlar el periodo seleccionado en formato nativo de HTML "YYYY-MM"
  const [periodoActivo, setPeriodoActivo] = useState<string>("2026-07");

  // Estado indispensable para evitar errores de hidratación en componentes dinámicos como gráficos SVG
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedName = sessionStorage.getItem("user_name_data");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // Tu lista de transacciones completa
  const transaccionesMes: Transaccion[] = [
    { id: 1, tipo: "REMESAS", nombre: "Envio de Giro", monto: 4500.0, IdMovimiento: "78909", fecha: "2026-07-29" },
    { id: 2, tipo: "REMESAS", nombre: "Pago de Giro", monto: 2000.0, IdMovimiento: "7898", fecha: "2026-07-28" },
    { id: 3, tipo: "REMESAS", nombre: "Pago de Remesa Western H2H", monto: 10500.0, IdMovimiento: "7897", fecha: "2026-07-28" },
    { id: 4, tipo: "REMESAS", nombre: "Pago de Remesa Western Manual", monto: 2800.0, IdMovimiento: "7896", fecha: "2026-07-25" },
    { id: 5, tipo: "ACH", nombre: "Transferencia ACH Enviada a Otro Banco", monto: 12000.0, IdMovimiento: "7895", fecha: "2026-07-25" },
    { id: 6, tipo: "ACH", nombre: "Pago de Préstamo a Otro Banco", monto: 3500.0, IdMovimiento: "7894", fecha: "2026-07-21" },
    { id: 7, tipo: "ACH", nombre: "Pago de Tarjeta de Débito a Otro Banco", monto: 12000.0, IdMovimiento: "7893", fecha: "2026-07-21" },
    { id: 8, tipo: "ACH", nombre: "Pago de Tarjeta de Crédito a Otro Banco", monto: 8300.0, IdMovimiento: "7892", fecha: "2026-07-19" },
    { id: 9, tipo: "Servicios", nombre: "Pago Factura ENEE", monto: 1450.0, IdMovimiento: "7891", fecha: "2026-07-17" },
    { id: 10, tipo: "Servicios", nombre: "Pago Factura UMAPS", monto: 380.0, IdMovimiento: "7890", fecha: "2026-07-17" },
    { id: 11, tipo: "Servicios", nombre: "Pago Aguas de San Pedro", monto: 620.0, IdMovimiento: "7809", fecha: "2026-07-14" },
    { id: 12, tipo: "Servicios", nombre: "Super Recarga Claro L.50", monto: 50.0, IdMovimiento: "7808", fecha: "2026-07-13" },
    { id: 13, tipo: "Servicios", nombre: "Recarga Tigo L.100", monto: 100.0, IdMovimiento: "7807", fecha: "2026-07-13" },
    { id: 14, tipo: "Servicios", nombre: "Pago Claro Postpago", monto: 750.0, IdMovimiento: "7806", fecha: "2026-07-10" },
    { id: 15, tipo: "Servicios", nombre: "Paquetigo L.25", monto: 25.0, IdMovimiento: "7805", fecha: "2026-07-10" },
    { id: 16, tipo: "Depósitos", nombre: "Deposito a Cuenta en Banco Popular", monto: 500.0, IdMovimiento: "7804", fecha: "2026-07-02" },
    { id: 17, tipo: "Depósitos", nombre: "Deposito a Cuenta en Banco Popular", monto: 5800.0, IdMovimiento: "7803", fecha: "2026-07-02" },
    { id: 18, tipo: "Retiros", nombre: "Retiro de Cuenta en Banco Popular", monto: 5800.0, IdMovimiento: "7802", fecha: "2026-07-01" },
    { id: 19, tipo: "Retiros", nombre: "Retiro de Cuenta en Banco Popular", monto: 15650.0, IdMovimiento: "7801", fecha: "2026-06-01" },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  const transaccionesFiltradas = transaccionesMes.filter((t) => {
    const periodoTransaccion = t.fecha.substring(0, 7);
    if (periodoTransaccion !== periodoActivo) return false;

    if (filtroActivo === "TODOS") return true;
    return t.tipo === filtroActivo;
  });

  const montoTotal = transaccionesFiltradas.reduce((acc, curr) => acc + curr.monto, 0);
  const totalOperaciones = transaccionesFiltradas.length;

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(valor);
  };

  const dataGrafico = transaccionesFiltradas.reduce((acc: any[], curr) => {
    const existe = acc.find((item) => item.label === curr.nombre);
    if (existe) {
      existe.value += curr.monto;
    } else {
      acc.push({ label: curr.nombre, value: curr.monto });
    }
    return acc;
  }, []);

  const getColorChip = (tipo: string) => {
    switch (tipo) {
      case "REMESAS":
        return { bg: "#e3f2fd", text: "#0d47a1" };
      case "ACH":
        return { bg: "#e8f5e9", text: "#1b5e20" };
      case "Servicios":
        return { bg: "#fff3e0", text: "#e65100" };
      case "Depósitos":
        return { bg: "#f3e5f5", text: "#4a148c" };
      case "Retiros":
        return { bg: "#ffebee", text: "#b71c1c" };
      default:
        return { bg: "#eee", text: "#333" };
    }
  };

  const handleGenerarRecibo = (idMovimiento: string) => {
    console.log(`Generando recibo para el movimiento: #${idMovimiento}`);
  };

  return (
    <div className="popular-dashboard-layout">
      {/* MENÚ LATERAL IZQUIERDO (SIDEBAR) */}
      <aside className="popular-sidebar">
        <div className="popular-sidebar-header">
          <h2 style={{ fontSize: "22px", margin: 0, fontWeight: 800, letterSpacing: "0.5px" }}>
            PUNT<span style={{ color: "#f88606" }}>O</span>S POPULAR
          </h2>
        </div>
        <nav className="popular-sidebar-menu">
          <div className="popular-sidebar-item active">
            <BarChartOutlined className="popular-sidebar-icon" />
            <span>Dashboard</span>
          </div>
          <div className="popular-sidebar-item">
            <PaidOutlined className="popular-sidebar-icon" />
            <span>Transacciones</span>
          </div>
          <div className="popular-sidebar-item">
            <ReceiptLongOutlined className="popular-sidebar-icon" />
            <span>Servicios Públicos</span>
          </div>
        </nav>
        <div className="popular-sidebar-footer">
          <div
            className="popular-sidebar-item"
            style={{ borderLeft: "none", color: "#ff9800" }}
            onClick={handleLogout}
          >
            <LogoutOutlined className="popular-sidebar-icon" style={{ color: "#ff9800" }} />
            <span>Cerrar Sesión</span>
          </div>
          <p style={{ marginTop: "10px" }}>© 2026 Banco Popular</p>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="popular-main-content">
        {/* ENCABEZADO DEL DASHBOARD */}
        <header
          className="popular-dashboard-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1 className="popular-dashboard-title">Resumen de Operaciones</h1>
            <p style={{ color: "#7a7f8c", margin: "4px 0 0 0" }}>
              Monitoreo Mensual de tus Transacciones.
            </p>
          </div>
          <div className="popular-user-badge">👤 {userName}</div>
        </header>

        {/* SECCIÓN DE FILTROS INTERACTIVOS */}
        <section
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            backgroundColor: "#ffffff",
            padding: "12px 16px",
            borderRadius: "12px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {/* Lado Izquierdo: Chips de Filtro */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <FilterAltOutlined style={{ color: "#1f4d8f" }} />
            <span style={{ fontWeight: "bold", color: "#5f6470", marginRight: "6px" }}>
              Filtrar panel por:
            </span>
            {(["TODOS", "REMESAS", "ACH", "Servicios", "Depósitos", "Retiros"] as const).map(
              (filtro) => (
                <Chip
                  key={filtro}
                  label={filtro === "TODOS" ? "Ver Todo" : filtro}
                  clickable
                  className="popular-filter-chip"
                  color={filtroActivo === filtro ? "primary" : "default"}
                  variant={filtroActivo === filtro ? "filled" : "outlined"}
                  onClick={() => setFiltroActivo(filtro)}
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    backgroundColor: filtroActivo === filtro ? "#1f4d8f" : undefined,
                    borderColor: "#1f4d8f",
                  }}
                />
              )
            )}
          </div>

          {/* Lado Derecho: Input Nativo tipo Month */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="month"
              id="filtro-periodo"
              name="periodo-dashboard"
              value={periodoActivo}
              onChange={(e) => setPeriodoActivo(e.target.value)}
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#1f4d8f",
                backgroundColor: "#f4f6f9",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                outline: "none",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            />
          </div>
        </section>

        {/* TARJETAS DE MÉTRICAS / RESUMEN */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <div className="popular-stat-card">
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#5f6470",
                textTransform: "uppercase",
              }}
            >
              Total Operaciones del Mes
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 800,
                color: "#1f4d8f",
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AccountBalanceWalletOutlined style={{ fontSize: "2.5rem", color: "#f88606" }} />
              {totalOperaciones}
            </div>
          </div>
          <div className="popular-stat-card total">
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#5f6470",
                textTransform: "uppercase",
              }}
            >
              Monto Acumulado ({filtroActivo})
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 800,
                color: "#f88606",
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <PaidOutlined style={{ fontSize: "2.5rem", color: "#1f4d8f" }} />
              {formatMoneda(montoTotal)}
            </div>
          </div>
        </section>

        {/* GRÁFICO CIRCULAR INTERACTIVO (Con protección ante Hydration Mismatch) */}
        <section
          className="popular-stat-card"
          style={{
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "320px",
            justifyContent: "center",
          }}
        >
          <h3 style={{ margin: "0 0 20px 0", alignSelf: "flex-start", color: "#1f4d8f" }}>
            📊 Distribución Porcentual por Volumen (Monto)
          </h3>
          {!isMounted ? (
            <p style={{ color: "#8c8c8c" }}>Cargando análisis gráfico...</p>
          ) : dataGrafico.length > 0 ? (
            <PieChart
              series={[
                {
                  data: dataGrafico.map((item, index) => ({
                    id: index,
                    value: item.value,
                    label: item.label,
                  })),
                  innerRadius: 40,
                  outerRadius: 110,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
              width={650}
              height={260}
            />
          ) : (
            <p style={{ color: "#8c8c8c" }}>
              No existen transacciones registradas para este criterio en el periodo seleccionado.
            </p>
          )}
        </section>

        {/* TABLA DE TRANSACCIONES DETALLADAS */}
        <section>
          <h3 style={{ margin: "0 0 16px 0", color: "#1f4d8f" }}>
            📋 Historial Detallado de Transacciones
          </h3>
          <TableContainer component={Paper} className="popular-table-container">
            <Table>
              <TableHead className="popular-table-header">
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Descripción del Servicio</TableCell>
                  <TableCell>Movimiento</TableCell>
                  <TableCell>Fecha Operación</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaccionesFiltradas.map((row) => {
                  const colors = getColorChip(row.tipo);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell style={{ fontWeight: 600 }}>#{row.id}</TableCell>

                      <TableCell>
                        <Chip
                          label={row.tipo}
                          size="small"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            fontWeight: "bold",
                          }}
                        />
                      </TableCell>

                      <TableCell style={{ fontWeight: 600, color: "#333" }}>
                        {row.nombre}
                      </TableCell>

                      <TableCell style={{ color: "#5f6470", fontWeight: 500 }}>
                        #{row.IdMovimiento}
                      </TableCell>

                      <TableCell style={{ color: "#777" }}>{row.fecha}</TableCell>

                      <TableCell align="right" style={{ fontWeight: 700, color: "#1f4d8f" }}>
                        {formatMoneda(row.monto)}
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<ReceiptLongOutlined />}
                          onClick={() => handleGenerarRecibo(row.IdMovimiento)}
                          style={{
                            fontWeight: 700,
                            color: "#f88606",
                            textTransform: "none",
                            borderRadius: "6px",
                          }}
                        >
                          Recibo
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </section>
      </main>
    </div>
  );
}