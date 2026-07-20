"use client";

import React, { useEffect, useState } from "react";
import {
  PaidOutlined,
  ReceiptLongOutlined,
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

interface Transaccion {
  id: number;
  tipo: "REMESAS" | "ACH" | "Servicios" | "Depósitos" | "Retiros";
  nombre: string;
  monto: number;
  fecha: string;
  IdMovimiento: string;
}

export default function DashboardPage() {
  const [filtroActivo, setFiltroActivo] = useState<
    "TODOS" | "REMESAS" | "ACH" | "Servicios" | "Depósitos" | "Retiros"
  >("TODOS");
  const [periodoActivo, setPeriodoActivo] = useState<string>("2026-07");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    if (existe) { existe.value += curr.monto; } else { acc.push({ label: curr.nombre, value: curr.monto }); }
    return acc;
  }, []);

  return (
    <>
      {/* ENCABEZADO DEL DASHBOARD */}
      <header className="popular-dashboard-header-container">
        <div>
          {/*<h1 className="popular-dashboard-title">Resumen de Operaciones</h1>*/}
          <p className="popular-dashboard-subtitle">Monitoreo Mensual de tus Transacciones.</p>
        </div>
      </header>

      {/* SECCIÓN DE FILTROS INTERACTIVOS */}
      <section className="popular-filters-panel">
        <div className="popular-filters-left">
          <FilterAltOutlined className="popular-primary-color-icon" />
          <span className="popular-filter-label">Filtrar panel por:</span>
          {(["TODOS", "REMESAS", "ACH", "Servicios", "Depósitos", "Retiros"] as const).map((filtro) => (
            <Chip
              key={filtro}
              label={filtro === "TODOS" ? "Ver Todo" : filtro}
              clickable
              className="popular-filter-chip popular-filter-chip-custom"
              color={filtroActivo === filtro ? "primary" : "default"}
              variant={filtroActivo === filtro ? "filled" : "outlined"}
              onClick={() => setFiltroActivo(filtro)}
            />
          ))}
        </div>

        <div>
          <input
            type="month"
            id="filtro-periodo"
            value={periodoActivo}
            onChange={(e) => setPeriodoActivo(e.target.value)}
            className="popular-input-month-native"
          />
        </div>
      </section>

      {/* TARJETAS DE MÉTRICAS */}
      <section className="popular-metrics-grid">
        <div className="popular-stat-card">
          <div className="popular-metric-title">Total Operaciones del Mes</div>
          <div className="popular-metric-value-container primary">
            <AccountBalanceWalletOutlined className="popular-sidebar-icon" />
            {totalOperaciones}
          </div>
        </div>
        <div className="popular-stat-card total">
          <div className="popular-metric-title">Monto Acumulado ({filtroActivo})</div>
          <div className="popular-metric-value-container accent">
            <PaidOutlined className="popular-sidebar-icon" />
            {formatMoneda(montoTotal)}
          </div>
        </div>
      </section>

      {/* GRÁFICO CIRCULAR INTERACTIVO */}
      <section className="popular-stat-card popular-chart-wrapper">
        <h3 className="popular-chart-title">📊 Distribución Porcentual por Volumen (Monto)</h3>
        {!isMounted ? (
          <p className="popular-chart-placeholder">Cargando análisis gráfico...</p>
        ) : dataGrafico.length > 0 ? (
          <PieChart
            series={[{
              data: dataGrafico.map((item, index) => ({ id: index, value: item.value, label: item.label })),
              innerRadius: 40,
              outerRadius: 110,
              paddingAngle: 2,
              cornerRadius: 4,
            }]}
            width={650}
            height={260}
          />
        ) : (
          <p className="popular-chart-placeholder">No existen transacciones registradas para este criterio.</p>
        )}
      </section>

      {/* TABLA DE TRANSACCIONES DETALLADAS ESTILO SLIM STRIPED AZUL PASTEL */}
      <section>
        <h3 className="popular-section-title">📋 Historial Detallado de Transacciones</h3>
        <TableContainer component={Paper} className="popular-table-clean-container" elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">N°</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Descripción del Servicio</TableCell>
                <TableCell>Movimiento</TableCell>
                <TableCell>Fecha Operación</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="center">Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transaccionesFiltradas.map((row) => (
                <TableRow key={row.id}>
                  <TableCell align="center" className="cell-regular">{row.id}</TableCell>
                  <TableCell className="cell-regular">{row.tipo}</TableCell>
                  <TableCell className="cell-regular">{row.nombre}</TableCell>
                  <TableCell className="cell-muted">{row.IdMovimiento}</TableCell>
                  <TableCell className="cell-muted">{row.fecha}</TableCell>
                  <TableCell align="right" className="cell-regular">{formatMoneda(row.monto)}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<ReceiptLongOutlined />}
                      className="popular-action-orange-btn"
                      onClick={() => console.log(`Generando recibo: #${row.IdMovimiento}`)}
                    >
                      Recibo
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </>
  );
}