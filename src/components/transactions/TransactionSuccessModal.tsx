"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface ReciboItem {
  campo: string;
  valor: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  recibo: ReciboItem[] | null;
}

export default function TransactionSuccessModal({
  open,
  onClose,
  title,
  recibo,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 900,
          color: "#1f4d8f",
        }}
      >
        {title}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ color: "#2e7d32", fontWeight: 800, mb: 1 }}>
          Transacción realizada exitosamente.
        </Typography>

        <Typography sx={{ color: "#6b7280", mb: 2 }}>
          Comprobante generado desde un Agente Corresponsal.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gap: 1.2 }}>
          {recibo?.map((item, index) => (
            <Box
              key={`${item.campo}-${index}`}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
                gap: 1,
                py: 0.8,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Typography sx={{ fontWeight: 700, color: "#6b7280" }}>
                {item.campo}
              </Typography>
              <Typography sx={{ fontWeight: 800, color: "#111827" }}>
                {item.valor}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}