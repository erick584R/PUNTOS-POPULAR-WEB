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
import AlertPanel from "../feedback/AlertPanel";
import { useAlert } from "@/hooks/useAlert";
import {
    GetLocalStorage,
    RemoveLocalStorage,
    SaveLocalStorage,
    SaveSessionStorage,
    SetIp,
} from "@/helpers/helpers";
import PopularInput from "../forms/PopularInput";
import { useSignalR } from "@/hooks/useSignalR";

const LoginPage: React.FC = () => {
    const [initialLoad, setInitialLoad] = useState(true);
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const [pendingLoginData, setPendingLoginData] = useState<any>(null);
    const notifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { showError } = useAlert();
    const SesionService = new SesionServices();

    const initialValues: UserLoginProps = {
        user: "",
        password: "",
    };

    const { values, handleChange } = useFormHelper<UserLoginProps>(initialValues);

    // ✅ USAR HOOK DE SIGNALR
    const { connectionRef, FinalizarSesion, MensajeRecibido, isConnected } = useSignalR(currentUserId);

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

    // ✅ CUANDO RECIBE NOTIFICACIÓN DE OTRO DISPOSITIVO
    useEffect(() => {
        if (FinalizarSesion && MensajeRecibido) {
            console.log("📢 Sesión cerrada desde otro dispositivo");
            handleCloseSesion();
        }
    }, [FinalizarSesion, MensajeRecibido]);

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

        SaveSessionStorage("user_profile", JSON.stringify({
            idCorresponsal: response.idCorresponsal,
            idUsuario: response.idUsuario,
            identidad: response.identidad,
            primerNombre: response.primerNombre,
            segundoNombre: response.segundoNombre,
            primerApellido: response.primerApellido,
            segundoApellido: response.segundoApellido,
            correo: response.correo,
            cuentaBP: response.cuentaBP,
            ctnro: response.ctnro
        }));

        if (notifyTimeoutRef.current) {
            clearTimeout(notifyTimeoutRef.current);
        }

        window.location.href = "/dashboard";
    }

    function handleCloseSesion() {
        console.log("🚪 Cerrando sesión del dispositivo actual");
        RemoveLocalStorage("user_name");
        RemoveLocalStorage("device_id");
        SaveSessionStorage("user_name", "");
        SaveSessionStorage("user_token", "");
        SaveSessionStorage("user_id", "");
        setCurrentUserId("");

        showError(
            "Sesión Cerrada",
            "Tu sesión ha sido cerrada debido a un inicio de sesión desde otro dispositivo."
        );
    }

    async function notificarYProceder(usuario: string, response: any) {
        console.log(`📢 Notificando a otros dispositivos del usuario: ${usuario}`);
        
        let intentos = 0;
        const maxIntentos = 15;

        const interval = setInterval(async () => {
            intentos++;
            console.log(`⏳ Esperando SignalR... Intento ${intentos}/${maxIntentos} (Estado: ${connectionRef.current?.state})`);
            
            if (connectionRef.current?.state === "Connected") {
                console.log("✅ SignalR conectado, enviando notificación...");
                clearInterval(interval);

                try {
                    await connectionRef.current.invoke("NotificarDispositivos", usuario);
                    console.log("✅ Notificación enviada exitosamente");
                } catch (err) {
                    console.error("❌ Error enviando notificación:", err);
                }

                notifyTimeoutRef.current = setTimeout(() => {
                    procesoLoginExitoso(response);
                }, 500);
            } else if (intentos >= maxIntentos) {
                console.warn("⚠️ SignalR no conectó, procediendo sin notificación");
                clearInterval(interval);
                
                notifyTimeoutRef.current = setTimeout(() => {
                    procesoLoginExitoso(response);
                }, 300);
            }
        }, 200);
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await SesionService.IniciarSesionPEL(values);

            if (response.bpOutReq.codigoError === "0") {
                console.log("✅ Login exitoso - Código 0");
                console.log("Response:", response);

                const usuarioUpper = values.user.toUpperCase();
                console.log(`🔌 Estableciendo usuario para SignalR: ${usuarioUpper}`);
                
                setCurrentUserId(usuarioUpper);
                setPendingLoginData(response);

                if (response.tieneSesionActiva) {
                    console.log("⚠️ Había sesión activa en otro dispositivo, se cerró automáticamente");
                    await notificarYProceder(usuarioUpper, response);
                } else {
                    console.log("✅ No hay sesión activa previa");
                    procesoLoginExitoso(response);
                }
                return;
            }

            if (response.bpOutReq.codigoError === "27") {
                console.log("⚠️ Código 27 - Sesión activa en otro dispositivo");

                const usuarioUpper = values.user.toUpperCase();
                setCurrentUserId(usuarioUpper);
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
                                // ✅ IMPORTANTE: Pasar ctnro a ValidarSesionCorresponsal
                                const validateResponse = await SesionService.ValidarSesionCorresponsal(
                                    values,
                                    response.ctnro  // ← ENVIAR CTNRO
                                );

                                if (validateResponse.bpOutReq.codigoError === "0") {
                                    console.log("✅ Sesión anterior cerrada exitosamente");
                                    await notificarYProceder(usuarioUpper, response);
                                } else {
                                    console.error("❌ Error cerrando sesión:", validateResponse.bpOutReq.mensajeError);
                                    showError(
                                        "Error",
                                        "No se pudo cerrar la sesión anterior. Intente nuevamente."
                                    );
                                    setLoading(false);
                                }
                            } catch (error) {
                                console.error("❌ Excepción:", error);
                                showError("Error", "Ocurrió un error procesando su solicitud.");
                                setLoading(false);
                            }
                        },
                    }
                );
                return;
            }

            console.error("❌ Error de login:", response.bpOutReq.codigoError);
            showError(
                `Error ${response.bpOutReq.codigoError}`,
                response.bpOutReq.mensajeError
            );
        } catch (error) {
            console.error("❌ Excepción:", error);
            showError(
                "Error de Conexión",
                "No se pudo establecer conexión con el servidor. Intente más tarde."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="popular-login-page">
            <AlertPanel />
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
}

export default LoginPage;