"use client";

import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { RemoveLocalStorage, SaveSessionStorage, GetSessionStorage } from "@/helpers/helpers";
import { useAlert } from "./useAlert";
import { useRouter } from "next/navigation";

export function useSignalRGlobal() {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { showError } = useAlert();
    const router = useRouter();

    useEffect(() => {
        // ✅ Obtener usuario de sesión actual (solo cuando está en dashboard)
        const userToken = GetSessionStorage("user_token");
        const userName = GetSessionStorage("user_name");

        // Solo conectar si hay sesión activa (está logueado)
        if (!userToken || !userName) {
            console.log("⏳ Sin sesión activa, SignalR global no conecta");
            setIsConnected(false);
            return;
        }

        console.log(`🔌 Conectando SignalR global para usuario: ${userName}`);

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(
                `${process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL}/api/Notificaciones/v1/BancoPopular/inicio-sesion-corresponsal?access_token=${encodeURIComponent(userName)}`,
                {
                    skipNegotiation: false,
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                    withCredentials: true,
                }
            )
            .withAutomaticReconnect([0, 0, 0, 3000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // ✅ CUANDO CIERRE LA CONEXIÓN
        connection.onclose((error) => {
            console.error("❌ SignalR global cerrado:", error?.message || "Sin detalles");
            setIsConnected(false);
        });

        // ✅ CUANDO SE RECONECTE
        connection.onreconnected((connectionId) => {
            console.log("✅ SignalR global reconectado:", connectionId);
            setIsConnected(true);
        });

        // 📨 ESCUCHAR NOTIFICACIÓN DE CIERRE DE SESIÓN DESDE OTRO DISPOSITIVO
        connection.on("RecibirNotificacion", (message: string) => {
            console.log("🔔 Notificación recibida - Sesión cerrada desde otro dispositivo:", message);
            
            // ✅ LIMPIAR TODO EL LOCAL STORAGE
            RemoveLocalStorage("user_name");
            RemoveLocalStorage("device_id");

            // ✅ LIMPIAR TODO EL SESSION STORAGE
            const keysToRemove = [
                "user_name",
                "user_token",
                "sesion_info",
                "user_id",
                "user_name_data",
                "user_main_disp",
                "user_account",
                "user_profile",
                "device_ip"
            ];

            keysToRemove.forEach(key => {
                try {
                    sessionStorage.removeItem(key);
                } catch (e) {
                    console.error(`Error removiendo ${key}:`, e);
                }
            });

            console.log("✅ Session Storage limpiado completamente");

            // ✅ MOSTRAR ALERTA
            showError(
                "Sesión Cerrada",
                "Tu sesión ha sido cerrada porque iniciaste sesión desde otro dispositivo."
            );

            // ✅ REDIRIGIR A LOGIN después de 2 segundos
            setTimeout(() => {
                console.log("🚪 Redirigiendo a login...");
                router.push("/");
            }, 2000);
        });

        // 🚀 INICIAR CONEXIÓN
        connection.start()
            .then(() => {
                console.log("✅ SignalR global conectado exitosamente");
                setIsConnected(true);
                
                // ✅ EXPORTAR A WINDOW para que LoginPage pueda acceder
                (window as any).__signalRConnection = connection;
            })
            .catch(err => {
                console.error("❌ Error conectando SignalR global:", err);
                setIsConnected(false);
            });

        connectionRef.current = connection;

        // ✅ LIMPIAR AL DESMONTAR
        return () => {
            console.log("🧹 Limpiando SignalR global...");
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
            delete (window as any).__signalRConnection;
        };

    }, []); // ✅ Ejecutar solo una vez al montar

    return {
        connectionRef,
        isConnected,
    };
}