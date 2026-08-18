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
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import {
  GetSessionStorage,
  SaveSessionStorage,
} from "@/helpers/helpers";
import ProductosServices from "@/services/productos.services";
import { useAlert } from "@/hooks/useAlert";
import { CuentaCorresponsalDetalle } from "@/interfaces/App/Productos.interfaces";

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
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState<CuentaCorresponsalDetalle | null>(null);
  const [consultada, setConsultada] = useState(false);

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

  const guardarDatosFuturos = (info: CuentaCorresponsalDetalle) => {
    SaveSessionStorage("user_account", info.cuenta);
    SaveSessionStorage(
      "user_profile",
      JSON.stringify({
        ctnro: info.ctnro,
        clienteUid: info.clienteUid,
        saldo: info.saldo,
        tipoProducto: info.tipoProducto,
        telefonoCelular: info.telefonoCelular,
        correoElectronico: info.correoElectronico,
        direccion: info.direccion,
        nroDocumento: info.nroDocumento,
        moneda: info.moneda,
        sucursal: info.sucursal,
        estado: info.estado,
        nombre: info.nombre,
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

  const limpiarBusqueda = () => {
    setCuenta("");
    setDetalle(null);
    setConsultada(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, color: "#1f4d8f", mb: 0.5 }}>
          Operaciones de Cuenta
        </Typography>
        <Typography sx={{ color: "#6b7280" }}>
          Selecciona la operación y consulta la cuenta antes de continuar con la transacción.
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
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
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