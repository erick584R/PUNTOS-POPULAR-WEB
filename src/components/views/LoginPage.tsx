"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { AccountCircleOutlined, LockOutlined } from "@mui/icons-material";
import { Checkbox, FormControlLabel } from "@mui/material";
import { UserLoginProps } from "@/interfaces/App/User.interfaces";
import useFormHelper from "@/helpers/useFormHelper";
import { DefaultValidator } from "@/helpers/validators";
import SesionServices from "@/services/sesion.services";
import PopularBackdrop from "../feedback/Backdrop";
import { useAlert } from "@/hooks/useAlert";
import {
  GetLocalStorage,
  GetSessionStorage,
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
  const [pendingLoginData, setPendingLoginData] = useState<any>(null);
  const notifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { showError, showSuccess } = useAlert();
  const SesionService = new SesionServices();

  const initialValues: UserLoginProps = {
    user: "",
    password: "",
  };

  const { values, handleChange } = useFormHelper<UserLoginProps>(initialValues);

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);

      const closedFlag = GetSessionStorage("session_closed_by_other_device");
      const closedMessage = GetSessionStorage("session_closed_message");
      const logoutFlag = GetSessionStorage("logout_success");
      const logoutMessage = GetSessionStorage("logout_success_message");

      if (closedFlag === "1") {
        showError(
          "Sesión Cerrada",
          closedMessage ||
            "Tu sesión ha sido cerrada porque iniciaste sesión desde otro dispositivo."
        );

        sessionStorage.removeItem("session_closed_by_other_device");
        sessionStorage.removeItem("session_closed_message");
      }

      if (logoutFlag === "1") {
        showSuccess(
          "Éxito",
          logoutMessage || "Se ha cerrado la sesión exitosamente."
        );

        sessionStorage.removeItem("logout_success");
        sessionStorage.removeItem("logout_success_message");
      }

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
  }, [initialLoad, handleChange, showError, showSuccess]);

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

  async function procesoLoginExitoso(response: any) {
    handleRememberMe();

    SaveSessionStorage("user_name", values.user.toUpperCase());
    SaveSessionStorage("user_token", response.token);
    SaveSessionStorage("sesion_info", response.info);
    SaveSessionStorage("user_id", response.ctnro);
    SaveSessionStorage("user_name_data", response.nombreCliente);
    SaveSessionStorage("user_main_disp", response.dispositivoPrincipal);
    SaveSessionStorage("user_account", response.cuentaBP);

    SaveSessionStorage(
      "user_profile",
      JSON.stringify({
        idCorresponsal: response.idCorresponsal,
        idUsuario: response.idUsuario,
        identidad: response.identidad,
        primerNombre: response.primerNombre,
        segundoNombre: response.segundoNombre,
        primerApellido: response.primerApellido,
        segundoApellido: response.segundoApellido,
        correo: response.correo,
        cuentaBP: response.cuentaBP,
        ctnro: response.ctnro,
      }),
    );

    if (notifyTimeoutRef.current) {
      clearTimeout(notifyTimeoutRef.current);
    }

    console.log("✅ Login completado, redirigiendo a dashboard...");
    window.location.href = "/dashboard";
  }

  async function notificarYProceder(usuario: string, response: any) {
    console.log(`📢 Notificando a otros dispositivos del usuario: ${usuario}`);

    let intentos = 0;
    const maxIntentos = 20;

    const interval = setInterval(async () => {
      intentos++;

      const globalConnection = (window as any).__signalRConnection;

      console.log(
        `⏳ Intento ${intentos}/${maxIntentos} - Estado SignalR: ${globalConnection?.state || "No disponible"}`,
      );

      if (globalConnection && globalConnection.state === "Connected") {
        console.log("✅ SignalR global conectado, enviando notificación...");
        clearInterval(interval);

        try {
          await globalConnection.invoke("NotificarDispositivos", usuario);
          console.log("✅ Notificación enviada exitosamente a otros dispositivos");
        } catch (err) {
          console.error("❌ Error enviando notificación:", err);
        }

        notifyTimeoutRef.current = setTimeout(() => {
          procesoLoginExitoso(response);
        }, 800);
      } else if (intentos >= maxIntentos) {
        console.warn(
          "⚠️ SignalR no conectó después de varios intentos, procediendo sin notificación",
        );
        clearInterval(interval);

        notifyTimeoutRef.current = setTimeout(() => {
          procesoLoginExitoso(response);
        }, 300);
      }
    }, 250);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await SesionService.IniciarSesionPEL(values);

      if (response.bpOutReq.codigoError === "0") {
        const usuarioUpper = values.user.toUpperCase();
        setPendingLoginData(response);

        if (response.tieneSesionActiva) {
          await notificarYProceder(usuarioUpper, response);
        } else {
          procesoLoginExitoso(response);
        }
        return;
      }

      if (response.bpOutReq.codigoError === "27") {
        const usuarioUpper = values.user.toUpperCase();
        setPendingLoginData(response);

        showError(
          `Advertencia - ${response.bpOutReq.codigoError}`,
          response.bpOutReq.mensajeError,
          {
            showAcceptButton: true,
            onAccept: async () => {
              console.log("✅ Usuario aceptó cerrar sesión anterior");
              setLoading(true);

              try {
                const validateResponse = await SesionService.ValidarSesionCorresponsal(
                  values.user,
                  response.token,
                  response.ctnro
                );

                if (validateResponse.bpOutReq.codigoError !== "0") {
                  showError(
                    "Error",
                    "No se pudo cerrar la sesión anterior. Intente nuevamente."
                  );
                  setLoading(false);
                  return;
                }

                const globalConnection = (window as any).__signalRConnection;

                if (globalConnection && globalConnection.state === "Connected") {
                  try {
                    await globalConnection.invoke("NotificarDispositivos", usuarioUpper);
                  } catch (err) {
                    console.error("❌ Error enviando notificación SignalR:", err);
                  }
                } else {
                  try {
                    const signalR = await import("@microsoft/signalr");

                    const tempConnection = new signalR.HubConnectionBuilder()
                      .withUrl(
                        `${process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL}/api/Notificaciones/v1/BancoPopular/inicio-sesion-corresponsal?access_token=${encodeURIComponent(usuarioUpper)}`,
                        {
                          skipNegotiation: false,
                          transport:
                            signalR.HttpTransportType.WebSockets |
                            signalR.HttpTransportType.LongPolling,
                          withCredentials: true,
                        }
                      )
                      .build();

                    await tempConnection.start();
                    await tempConnection.invoke("NotificarDispositivos", usuarioUpper);
                    await tempConnection.stop();
                  } catch (err) {
                    console.error("❌ Error creando conexión temporal SignalR:", err);
                    showError(
                      "Error",
                      "No se pudo conectar SignalR para cerrar la sesión anterior."
                    );
                    setLoading(false);
                    return;
                  }
                }

                const retryResponse = await SesionService.IniciarSesionPEL(values);

                if (retryResponse.bpOutReq.codigoError === "0") {
                  if (retryResponse.tieneSesionActiva) {
                    await notificarYProceder(usuarioUpper, retryResponse);
                  } else {
                    procesoLoginExitoso(retryResponse);
                  }
                } else {
                  showError(
                    "Error",
                    retryResponse.bpOutReq.mensajeError || "No se pudo completar el ingreso."
                  );
                }
              } catch (error) {
                console.error("❌ Excepción:", error);
                showError("Error", "Ocurrió un error procesando su solicitud.");
              } finally {
                setLoading(false);
              }
            },
          }
        );
        return;
      }

      showError(
        `Error ${response.bpOutReq.codigoError}`,
        response.bpOutReq.mensajeError,
      );
    } catch (error) {
      console.error("❌ Excepción en handleLogin:", error);
      showError(
        "Error de Conexión",
        "No se pudo establecer conexión con el servidor. Intente más tarde.",
      );
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