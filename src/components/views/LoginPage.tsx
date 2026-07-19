"use client";

import React, { useEffect, useState } from "react";
import { AccountCircleOutlined, LockOutline } from "@mui/icons-material";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";

import { UserLoginProps } from "@/src/interfaces/App/User.interfaces";
import useFormHelper from "@/src/helpers/useFormHelper";

import { DefaultValidator } from "@/src/helpers/validators";
import SesionServices from "@/src/services/sesion.services";
import PopularBackdrop from "../feedback/Backdrop";
import {
  GetLocalStorage,
  RemoveLocalStorage,
  SaveLocalStorage,
  SaveSessionStorage,
  SetIp,
} from "@/src/helpers/helpers";
import PopularInput from "../forms/PopularInput";

const LoginPage: React.FC = () => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorResponse, setErrorResponse] = useState("");

  const SesionService = new SesionServices();

  const initialValues: UserLoginProps = {
    user: "",
    password: "",
  };

  const { values, handleChange } = useFormHelper<UserLoginProps>(initialValues);

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);

      const user_name = GetLocalStorage("user_name");
      const device_id = GetLocalStorage("device_id");

      if (user_name !== "") {
        handleChange({ target: { name: "user", value: user_name } });
        setRemember(true);
      }

      if (device_id === "") {
        const randomId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        SaveLocalStorage("device_id", randomId);
      }

      SetIp();
    }
  }, [initialLoad, handleChange]);

  function handleRemembeme() {
    if (remember) {
      SaveLocalStorage("user_name", values.user.toUpperCase());
    } else {
      RemoveLocalStorage("user_name");
    }
  }

  function handleValidation() {
    return values.user.trim() === "" || values.password.trim() === "";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorResponse("");

    try {
      const response = await SesionService.IniciarSesionPEL(values);

      if (response.bpOutReq.codigoError === "0") {
        handleRemembeme();

        SaveSessionStorage("user_name", values.user.toUpperCase());
        SaveSessionStorage("user_token", response.token);
        SaveSessionStorage("sesion_info", response.info);
        SaveSessionStorage("user_id", response.ctnro);
        SaveSessionStorage("user_name_data", response.nombreCliente);
        SaveSessionStorage("user_main_disp", response.dispositivoPrincipal);

        window.location.href = "/welcome";
        return;
      }

      setErrorResponse(`${response.bpOutReq.codigoError} - ${response.bpOutReq.mensajeError}`);
    } catch {
      setErrorResponse("Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 420, margin: "40px auto", padding: 20 }}>
      {loading && <PopularBackdrop open={true} />}

      <form onSubmit={handleLogin}>
        <h2>Login - Puntos Popular</h2>

        <PopularInput
          className="mt-2 mb-2"
          label="Usuario"
          name="user"
          value={values.user}
          placeholder="Ingrese su usuario"
          type="text"
          disabled={remember}
          startAdornment={<AccountCircleOutlined />}
          regex={DefaultValidator}
          onChange={handleChange}
        />

        <PopularInput
          className="mb-1"
          label="Contraseña"
          name="password"
          value={values.password}
          placeholder="Ingrese su contraseña"
          startAdornment={<LockOutline />}
          isPassword={true}
          regex={DefaultValidator}
          onChange={handleChange}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            }
            label="Recordar usuario"
          />
        </div>

        <button type="submit" disabled={handleValidation()} style={{ width: "100%", marginTop: 12 }}>
          Ingresar
        </button>

        {handleValidation() && (
          <Alert variant="outlined" severity="info" sx={{ mt: 2 }}>
            Debes ingresar usuario y contraseña.
          </Alert>
        )}

        {errorResponse && (
          <Alert variant="outlined" severity="error" sx={{ mt: 2 }}>
            {errorResponse}
          </Alert>
        )}
      </form>
    </section>
  );
};

export default LoginPage;