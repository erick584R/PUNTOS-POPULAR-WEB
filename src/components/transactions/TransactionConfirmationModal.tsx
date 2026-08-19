"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import {
  GetSessionStorage,
  SaveSessionStorage,
} from "@/helpers/helpers";
import ProductosServices from "@/services/productos.services";
import { useAlert } from "@/hooks/useAlert";
import { CuentaCorresponsalDetalle } from "@/interfaces/App/Productos.interfaces";
import TransactionConfirmationModal from "@/components/transactions/TransactionConfirmationModal";

type OperacionCuenta = "DEPOSITO" | "RETIRO";

const operaciones = [
  { value: "DEPOSITO", label: "Depósito" },
  { value: "RETIRO", label: "Retiro" },
] as const;

export default function OperacionesCuentaPage() {
  const router = useRouter();
  const { showError } = useAlert();

  const [operacion, setOperacion] = useState<OperacionCuenta>("DEPOSITO");
  const [cuenta, setCuenta] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState<CuentaCorresponsalDetalle | null>(null);
  const [consultada, setConsultada] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const token = GetSessionStorage("user_token");
    const userName = GetSessionStorage("user_name");
    const userId = GetSessionStorage("user_id");
    const sessionInfo = GetSessionStorage("sesion_info");

    const valid = !!token && !!userName && !!userId && !!sessionInfo;
    if (!valid) {
      router.replace("/");
    }
  }, [router]);

  const tituloOperacion = useMemo(() => {
    return operacion === "DEPOSITO" ? "Depósito" : "Retiro";
  }, [operacion]);

  const montoNumero = useMemo(() => {
    const value = Number(monto);
    return Number.isFinite(value) ? value : 0;
  }, [monto]);

  const montoFormateado = useMemo(() => {
    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: detalle?.moneda || "HNL",
    }).format(montoNumero);
  }, [montoNumero, detalle]);

  const guardarDatosFuturos = (info: CuentaCorresponsalDetalle) => {
    SaveSessionStorage("user_account", info.cuenta);
    SaveSessionStorage(
      "transaction_target_account",
      JSON.stringify({
        nombreCliente: info.nombre,
        nroDocumento: info.nroDocumento,
        cuentaBP: info.cuenta,
      })
    );
  };

  const handleBuscar = async () => {
    const cuentaLimpia = cuenta.trim();

    if (!cuentaLimpia) {
      showError("Error", "Ingrese una cuenta para continuar.");
      return;
    }

    setLoading(true);
    setConsultada(false);
    setDetalle(null);

    try {
      const service = new ProductosServices();
      const result = await service.ObtenerCuentaCorresponsalDetalle(cuentaLimpia);

      if (!result.ok || !result.detalle) {
        showError(
          `Error ${result.codigoError ?? "desconocido"}`,
          result.mensajeError || "No fue posible consultar la cuenta."
        );
        return;
      }

      setDetalle(result.detalle);
      setConsultada(true);
      guardarDatosFuturos(result.detalle);
    } catch {
      showError("Error", "Ocurrió un error consultando la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirConfirmacion = () => {
    if (!detalle) {
      showError("Error", "Primero debe consultar una cuenta válida.");
      return;
    }

    if (!monto || montoNumero <= 0) {
      showError("Error", "Ingrese un monto válido mayor a cero.");
      return;
    }

    setConfirmOpen(true);
  };

  const limpiarBusqueda = () => {
    setCuenta("");
    setMonto("");
    setDetalle(null);
    setConsultada(false);
    setConfirmOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, color: "#1f4d8f", mb: 0.5 }}>
          Operaciones de Cuenta
        </Typography>
        <Typography sx={{ color: "#6b7280" }}>
          Selecciona la operación, consulta la cuenta y prepara la transacción antes de ejecutarla.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(31,77,143,0.12)",
          overflow: "hidden",
          background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
        }}
      >
        <Box sx={{ px: 3, py: 2, background: "linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%)" }}>
          <Typography sx={{ fontWeight: 800, color: "#1f4d8f" }}>Consulta de Cuenta</Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 3, display: "grid", gap: 2.5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="operacion-label">Tipo de operación</InputLabel>
              <Select
                labelId="operacion-label"
                value={operacion}
                label="Tipo de operación"
                onChange={(e) => setOperacion(e.target.value as OperacionCuenta)}
              >
                {operaciones.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Número de cuenta"
              value={cuenta}
              onChange={(e) => setCuenta(e.target.value.slice(0, 30))}
              placeholder="Ingrese la cuenta a consultar"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleBuscar();
                }
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={handleBuscar}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchOutlinedIcon />}
              sx={{
                bgcolor: "#1f4d8f",
                "&:hover": { bgcolor: "#163b6c" },
                minWidth: 170,
                borderRadius: 999,
                fontWeight: 800,
              }}
            >
              {loading ? "Consultando..." : "Consultar cuenta"}
            </Button>

            <Button
              variant="outlined"
              onClick={limpiarBusqueda}
              disabled={loading}
              sx={{
                borderColor: "rgba(31,77,143,0.28)",
                color: "#1f4d8f",
                minWidth: 170,
                borderRadius: 999,
                fontWeight: 800,
              }}
            >
              Limpiar
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(31,77,143,0.12)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, py: 2, background: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccountBalanceWalletOutlinedIcon sx={{ color: "#f88606" }} />
            <Box>
              <Typography sx={{ fontWeight: 900, color: "#111827" }}>
                Resultado de la consulta
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                {tituloOperacion} - información de la cuenta destino
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          {!consultada && !loading && (
            <Alert severity="info" variant="outlined">
              Ingresa una cuenta y presiona <b>Consultar cuenta</b> para ver la información.
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#f88606" }} />
            </Box>
          )}

          {!loading && detalle && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "220px 1fr" },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(248,134,6,0.18)",
                  background: "linear-gradient(180deg, #fff7ef 0%, #fffdf9 100%)",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#6b7280" }}>
                  Operación seleccionada
                </Typography>

                <Chip
                  label={tituloOperacion}
                  sx={{
                    width: "fit-content",
                    bgcolor: operacion === "DEPOSITO" ? "#e8f2ff" : "#fff2e5",
                    color: operacion === "DEPOSITO" ? "#1f4d8f" : "#f88606",
                    fontWeight: 800,
                  }}
                />

                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  Cuenta consultada
                </Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#111827", wordBreak: "break-word" }}>
                  {detalle.cuenta}
                </Typography>

                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  {detalle.moneda}
                </Typography>
              </Box>

              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(31,77,143,0.12)",
                  background: "#ffffff",
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#6b7280", mb: 0.5 }}>
                  Información de la cuenta
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "grid", gap: 1.2 }}>
                  <InfoRow label="Nombre" value={detalle.nombre} />
                  <InfoRow label="Dirección" value={detalle.direccion} />
                  <InfoRow label="Número de documento" value={detalle.nroDocumento} />
                  <InfoRow label="Moneda" value={detalle.moneda} />
                </Box>

                <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Monto a transaccionar"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, "").slice(0, 12))}
                    placeholder="Ingrese el monto"
                  />

                  <Button
                    variant="contained"
                    onClick={handleAbrirConfirmacion}
                    disabled={!detalle || !monto}
                    endIcon={<ArrowForwardOutlinedIcon />}
                    sx={{
                      bgcolor: "#f88606",
                      "&:hover": { bgcolor: "#e07600" },
                      minWidth: 220,
                      borderRadius: 999,
                      fontWeight: 800,
                      alignSelf: "flex-start",
                    }}
                  >
                    Revisar transacción
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      <TransactionConfirmationModal
        open={confirmOpen}
        title={tituloOperacion}
        operation={operacion}
        account={detalle?.cuenta || ""}
        name={detalle?.nombre || ""}
        document={detalle?.nroDocumento || ""}
        amount={montoFormateado}
        onBack={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          showError("Pendiente", "El siguiente paso será ejecutar la API real de transacción.");
        }}
      />
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", flexWrap: "wrap" }}>
      <Typography sx={{ color: "#6b7280", fontWeight: 700, minWidth: 160 }}>{label}</Typography>
      <Typography sx={{ color: "#111827", fontWeight: 800, textAlign: "right", wordBreak: "break-word" }}>
        {value || "-"}
      </Typography>
    </Box>
  );
}