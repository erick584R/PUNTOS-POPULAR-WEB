"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  telefonoMasked: string;
  onResend: () => Promise<void>;
  onValidate: (token: string) => Promise<void>;
  loading: boolean;
  resendLoading: boolean;
}

export default function TransactionTokenModal({
  open,
  onClose,
  telefonoMasked,
  onResend,
  onValidate,
  loading,
  resendLoading,
}: Props) {
  const [token, setToken] = useState("");

  const handleValidate = async () => {
    if (!token.trim()) return;
    await onValidate(token.trim());
  };

  const handleResend = async () => {
    await onResend();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
    >
      <DialogTitle
        sx={{
          fontWeight: 900,
          color: "#1f4d8f",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Validación de Token
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ mb: 1, color: "#2e7d32", fontWeight: 800 }}>
          Se envió un token al teléfono:
        </Typography>

        <Typography sx={{ mb: 2, fontWeight: 900, color: "#111827" }}>
          {telefonoMasked}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            fullWidth
            label="Token"
            value={token}
            onChange={(e) =>
              setToken(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
            }
            placeholder="Ingrese el token recibido"
            slotProps={{
              htmlInput: {
                maxLength: 6,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading || resendLoading}
        >
          Cerrar
        </Button>

        <Button
          variant="text"
          onClick={handleResend}
          disabled={loading || resendLoading}
          sx={{ fontWeight: 800 }}
          startIcon={
            resendLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : null
          }
        >
          {resendLoading ? "Reenviando..." : "Reenviar token"}
        </Button>

        <Button
          variant="contained"
          onClick={handleValidate}
          disabled={loading || token.trim().length < 4}
          sx={{
            bgcolor: "#f88606",
            "&:hover": { bgcolor: "#e07600" },
            fontWeight: 800,
          }}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {loading ? "Validando..." : "Validar token"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
