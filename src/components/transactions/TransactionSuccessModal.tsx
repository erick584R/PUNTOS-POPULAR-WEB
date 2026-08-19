"use client";

import React, { useState } from "react";
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
  CircularProgress,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { generateReceiptPdf, getPopularLogoDataUrl } from "@/helpers/receiptPdf";

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
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!recibo || recibo.length === 0) return;

    setDownloading(true);
    try {
      const logo = await getPopularLogoDataUrl();
      await generateReceiptPdf({
        title,
        subtitle: "Banco Popular - Comprobante de Agente Corresponsal",
        logoDataUrl: logo,
        items: recibo,
        footerLeft: "Firma Cliente",
        footerRight: "Firma Agente",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      sx={{
        "& .MuiDialog-container": {
          alignItems: "center",
        },
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.20)",
            maxHeight: "88vh",
            background: "#fff",
          },
        },
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%)",
          borderBottom: "1px solid rgba(31,77,143,0.10)",
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1.3,
            px: 2.3,
            color: "#1f4d8f",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #e8f5e9 0%, #d9f2dd 100%)",
                color: "#2e7d32",
                flexShrink: 0,
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 17, lineHeight: 1.1 }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#5f6470", mt: 0.1 }}>
                Comprobante generado exitosamente
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={onClose} sx={{ color: "#6b7280" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      </Box>

      <DialogContent
        sx={{
          p: 0,
          background: "#fafcff",
          overflowY: "auto",
        }}
      >
        <Box sx={{ px: 2.3, pt: 1.8, pb: 1.2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.8,
              borderRadius: 3,
              border: "1px solid rgba(31,77,143,0.10)",
              background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
            }}
          >
            <Typography sx={{ color: "#2e7d32", fontWeight: 800, mb: 0.5, fontSize: 14 }}>
              Transacción realizada exitosamente.
            </Typography>

            <Typography sx={{ color: "#6b7280", fontSize: 12.8 }}>
              Comprobante generado desde un Agente Corresponsal.
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: "grid", gap: 0.15 }}>
              {recibo?.map((item, index) => (
                <Box
                  key={`${item.campo}-${index}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "235px 1fr" },
                    gap: 1.2,
                    py: 0.85,
                    borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
                    alignItems: "start",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#667085",
                      fontSize: 13,
                    }}
                  >
                    {item.campo}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#101828",
                      fontSize: 13.2,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.valor}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.3,
          py: 1.8,
          gap: 1,
          background: "#fff",
          borderTop: "1px solid rgba(15, 23, 42, 0.06)",
          position: "sticky",
          bottom: 0,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={downloading}
          sx={{
            borderRadius: 2,
            px: 2,
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          Cerrar
        </Button>

        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={downloading || !recibo || recibo.length === 0}
          sx={{
            bgcolor: "#e53935",
            "&:hover": { bgcolor: "#c62828" },
            fontWeight: 900,
            borderRadius: 2,
            px: 2.2,
            textTransform: "uppercase",
            boxShadow: "0 8px 18px rgba(229,57,53,0.28)",
          }}
          startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {downloading ? "Generando PDF..." : "Descargar PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}