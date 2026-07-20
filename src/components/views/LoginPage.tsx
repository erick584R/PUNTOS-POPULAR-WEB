"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AccountCircleOutlined, LockOutlined } from "@mui/icons-material";
import { Checkbox, FormControlLabel } from "@mui/material";

import { UserLoginProps } from "@/interfaces/App/User.interfaces";
import useFormHelper from "@/helpers/useFormHelper";
import { DefaultValidator } from "@/helpers/validators";
import SesionServices from "@/services/sesion.services";
import PopularBackdrop from "../feedback/Backdrop";
import {
  GetLocalStorage,
  RemoveLocalStorage,
  SaveLocalStorage,
  SaveSessionStorage,
  SetIp,
} from "@/helpers/helpers";
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

  function handleRememberMe() {
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
        handleRememberMe();

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
    <main className="popular-login-page">
      {loading && <PopularBackdrop open={true} />}

      <div className="popular-login-bg" />

      <section className="popular-login-card">
        <div className="popular-login-left">
          <div className="popular-login-logo-wrap">
            <Image
              src="/imgs/puntos-popular-logo.png"
              alt="Puntos Popular"
              width={280}
              height={280}
              className="popular-login-logo"
              priority
            />
          </div>
        </div>

        <div className="popular-login-right">
          <form className="popular-login-form" onSubmit={handleLogin}>
            <PopularInput
              className="popular-field"
              label="Usuario Corresponsal"
              name="user"
              value={values.user}
              placeholder="Ingrese su usuario"
              type="text"
              startAdornment={<AccountCircleOutlined />}
              regex={DefaultValidator}
              onChange={handleChange}
            />

            <PopularInput
              className="popular-field"
              label="Contraseña"
              name="password"
              value={values.password}
              placeholder="Ingrese su contraseña"
              startAdornment={<LockOutlined />}
              isPassword={true}
              regex={DefaultValidator}
              onChange={handleChange}
            />

            <div className="popular-login-row">
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                }
                label="Recordar"
              />

              <button type="button" className="popular-link-btn">
                Registrarse
              </button>
            </div>

            <button
              type="submit"
              disabled={handleValidation()}
              className="popular-submit-btn"
            >
              Ingresar
            </button>

            <button type="button" className="popular-forgot-btn">
              ¿Olvidaste tu contraseña?
            </button>

            {errorResponse && (
              <div className="popular-error-message">{errorResponse}</div>
            )}
          </form>
        </div>
      </section>

      <footer className="popular-login-footer">
        ©2026 Banco Popular Honduras. Todos los derechos reservados.
      </footer>
    </main>
  );
};

export default LoginPage;