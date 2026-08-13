'use client';
import AlertPanel from "../feedback/AlertPanel";
import React from "react";
import {
  Popover,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { CuentaCorresponsalDetalle } from "@/interfaces/App/Productos.interfaces";

interface Props {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  detalle: CuentaCorresponsalDetalle | null;
}

const CuentaCorresponsalPopover: React.FC<Props> = ({
  anchorEl,
  open,
  onClose,
  detalle,
}) => {
  if (!detalle) return null;

  const saldoFormateado = new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: detalle.moneda || "HNL",
  }).format(detalle.saldo);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableScrollLock
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.1,
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
            border: "1px solid rgba(31,77,143,0.10)",
            background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
          },
        },
      }}
    >
      <Box sx={{ width: 344 }}>
        <Box
          sx={{
            px: 2,
            py: 1.1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%)",
            borderBottom: "1px solid rgba(31,77,143,0.08)",
          }}
        >
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 800,
              color: "#1f4d8f",
              letterSpacing: 0.15,
            }}
          >
            Información de la Cuenta
          </Typography>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "#7b8794",
              p: 0.3,
              "&:hover": {
                backgroundColor: "rgba(31,77,143,0.08)",
                color: "#1f4d8f",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2.2, py: 2.0 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #fff4e8 0%, #ffe8d1 100%)",
                border: "1px solid rgba(248, 134, 6, 0.22)",
                flexShrink: 0,
                mt: 0.1,
              }}
            >
              <AccountBalanceWalletOutlinedIcon sx={{ color: "#f88606", fontSize: 24 }} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
                <Typography
                  sx={{
                    fontSize: 12.2,
                    color: "#6b7280",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  Cuenta
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12.2,
                    color: "#111827",
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: 0.15,
                  }}
                >
                  {detalle.cuenta}
                </Typography>
              </Box>

              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 20.5,
                  fontWeight: 900,
                  color: "#0f172a",
                  lineHeight: 1.04,
                  letterSpacing: 0.1,
                }}
              >
                {saldoFormateado}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Popover>
  );
};

export default CuentaCorresponsalPopover;