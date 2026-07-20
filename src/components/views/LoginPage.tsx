"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";
import { AccountCircleOutlined, LockOutlined } from "@mui/icons-material";

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
  const [loaded, setLoaded] = useState(true);
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
        handleChange({
          target: { name: "user", value: user_name },
        } as React.ChangeEvent<HTMLInputElement>);
        setRemember(true);
      }

      if (device_id === "") {
        const randomId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        SaveLocalStorage("device_id", randomId);
      }

      (async () => {
        await SetIp();
      })();
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
    setLoaded(false);
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

      setErrorResponse(
        `${response.bpOutReq.codigoError} - ${response.bpOutReq.mensajeError}`
      );
    } catch {
      setErrorResponse("Error al iniciar sesión. Por favor, inténtelo de nuevo.");
    } finally {
      setLoaded(true);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <section className="px-3 px-md-0 login-shell">
      <div className="login-grain" />

      {!loaded && <PopularBackdrop open={true} />}

      <div className="login-card-modern shadow-lg rounded">
        <div className="row g-0 h-100">
          <div className="col-md-5 d-none d-md-flex login-brand-panel">
            <div className="text-center brand-content">
              <Image
                src="/imgs/puntos-popular-logo.png"
                priority
                alt="Puntos Popular"
                width={320}
                height={170}
                className="img-fluid brand-logo"
              />
            </div>
          </div>

          <div className="col-md-7 col-12 login-form-panel">
            <form className="w-100 login-form-modern" autoComplete="off" onSubmit={handleLogin}>
              <input
                type="text"
                name="fakeusernameremembered"
                style={{ display: "none" }}
                autoComplete="off"
              />

              <PopularInput
                className="mt-1 mb-2"
                label="Usuario Corresponsal"
                name="user"
                value={values.user}
                placeholder="Ingrese su usuario"
                type="text"
                disabled={remember}
                startAdornment={<AccountCircleOutlined className="icon-popular" />}
                endAdornment={null}
                regex={DefaultValidator}
                onChange={handleChange}
              />

              <PopularInput
                className="mb-1"
                label="Contraseña"
                name="password"
                value={values.password}
                placeholder="Ingrese su contraseña"
                startAdornment={<LockOutlined className="icon-popular" />}
                isPassword={true}
                regex={DefaultValidator}
                onChange={handleChange}
              />

              <div className="mb-3 d-flex justify-content-between align-items-center">
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

                <button type="button" className="btn btn-link p-0 forgot-link">
                  Registrarse
                </button>
              </div>

              <button
                type="submit"
                id="login-button"
                className="btn w-100 btn-login-modern"
                disabled={handleValidation()}
              >
                Ingresar
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link p-0 mx-1 forgot-link"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {handleValidation() && (
                <Alert className="mt-3" variant="outlined" severity="info">
                  Debes ingresar usuario y contraseña.
                </Alert>
              )}

              {errorResponse && (
                <Alert className="mt-3" variant="outlined" severity="error">
                  {errorResponse}
                </Alert>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="my-3 text-center">
        <p className="text-sm mb-0 login-footer-text">
          ©{currentYear} Banco Popular Honduras. Todos los derechos reservados.
        </p>
      </div>
    </section>
  );
};

export default LoginPage;