"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  operation: string;
  account: string;
  name: string;
  document: string;
  amount: string;
  onBack: () => void;
  onConfirm: () => void;
}

export default function TransactionConfirmationModal({
  open,
  title,
  operation,
  account,
  name,
  document,
  amount,
  onBack,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={onBack} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 900, color: "#1f4d8f" }}>
        Verificación de la transacción
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ color: "#6b7280", mb: 2 }}>
          Verifica que los datos sean correctos antes de continuar.
        </Typography>

        <Box sx={{ display: "grid", gap: 1.2 }}>
          <Row label="Operación" value={operation} />
          <Row label="Cuenta" value={account} />
          <Row label="Nombre" value={name} />
          <Row label="Documento" value={document} />
          <Row label="Monto" value={amount} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
          {title} será ejecutado solo si confirmas.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onBack} variant="outlined">
          Volver
        </Button>
        <Button onClick={onConfirm} variant="contained" sx={{ bgcolor: "#f88606" }}>
          Confirmar y ejecutar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography sx={{ fontWeight: 700, color: "#6b7280" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, color: "#111827", textAlign: "right" }}>
        {value || "-"}
      </Typography>
    </Box>
  );
}