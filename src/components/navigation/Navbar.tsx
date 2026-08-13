"use client";

import React, { useEffect, useState } from "react";
import { GetSessionStorage } from "@/helpers/helpers";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ProductosServices from "@/services/productos.services";
import { useAlert } from "@/hooks/useAlert";
import { CuentaCorresponsalDetalle } from "@/interfaces/App/Productos.interfaces";
import CuentaCorresponsalPopover from "@/components/feedback/CuentaCorresponsalPopover";
import AlertPanel from "../feedback/AlertPanel";

export default function PopularNavbar() {
  const [userName, setUserName] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [detalleCuenta, setDetalleCuenta] = useState<CuentaCorresponsalDetalle | null>(null);
  const [openPopover, setOpenPopover] = useState(false);

  const { showError } = useAlert();

  useEffect(() => {
    const name = GetSessionStorage("user_name_data") || "USUARIO";
    setUserName(name);
  }, []);

  const handleVerCuenta = async (event: React.MouseEvent<HTMLElement>) => {
    if (loading) return;

    setAnchorEl(event.currentTarget);
    setLoading(true);

    try {
      const cuenta = GetSessionStorage("user_account");

      if (!cuenta) {
        showError("Error", "No se encontró la cuenta del corresponsal en sesión.");
        return;
      }

      const service = new ProductosServices();
      const result = await service.ObtenerCuentaCorresponsalDetalle(cuenta);

      if (!result.ok || !result.detalle) {
  showError(
    `Error ${result.codigoError ?? "desconocido"}`,
    result.mensajeError || "No fue posible consultar la cuenta."
  );
  setOpenPopover(false);
  return;
}

      setDetalleCuenta(result.detalle);
      setOpenPopover(true);
    } catch {
      showError("Error", "Ocurrió un error consultando la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="popular-top-navbar">
        <div className="popular-navbar-spacer" />

        <button
          type="button"
          className="popular-navbar-user-box popular-navbar-user-box--clickable"
          onClick={handleVerCuenta}
          disabled={loading}
        >
          <AccountCircleIcon className="popular-navbar-user-icon" />
          <div className="popular-navbar-user-info">
            <span className="navbar-username">{userName}</span>
          </div>
        </button>
      </header>

      <CuentaCorresponsalPopover
        anchorEl={anchorEl}
        open={openPopover}
        onClose={() => setOpenPopover(false)}
        detalle={detalleCuenta}
      />
    </>
  );
}