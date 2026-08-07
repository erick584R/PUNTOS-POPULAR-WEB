"use client";

import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { GetSessionStorage } from "@/helpers/helpers";
import { useAlert } from "./useAlert";
import { useRouter } from "next/navigation";

export function useSignalRGlobal() {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { showError } = useAlert();
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            const userToken = GetSessionStorage("user_token");
            const userName = GetSessionStorage("user_name");

            if (!userToken || !userName) {
                return;
            }

            if (connectionRef.current) {
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

            connection.onclose((error) => {
                console.error("❌ SignalR global cerrado:", error?.message || "Sin detalles");
                setIsConnected(false);
                connectionRef.current = null;
                delete (window as any).__signalRConnection;
            });

            connection.on("RecibirNotificacion", async (message: string) => {
                console.log("🔔 Notificación recibida - Sesión cerrada desde otro dispositivo:", message);

                try {
                    await connection.stop();
                } catch {}

                // Limpieza selectiva: NO borrar device_id ni device_fingerprint
                try {
                    sessionStorage.removeItem("user_name");
                    sessionStorage.removeItem("user_token");
                    sessionStorage.removeItem("sesion_info");
                    sessionStorage.removeItem("user_id");
                    sessionStorage.removeItem("user_name_data");
                    sessionStorage.removeItem("user_main_disp");
                    sessionStorage.removeItem("user_account");
                    sessionStorage.removeItem("user_profile");
                    sessionStorage.removeItem("device_ip");
                } catch (e) {
                    console.error("Error limpiando sesión:", e);
                }

                showError(
                    "Sesión Cerrada",
                    "Tu sesión ha sido cerrada porque iniciaste sesión desde otro dispositivo."
                );

                setTimeout(() => {
                    router.push("/");
                    window.location.reload();
                }, 1200);
            });

            connection.start()
                .then(() => {
                    console.log("✅ SignalR global conectado exitosamente");
                    setIsConnected(true);
                    (window as any).__signalRConnection = connection;
                    connectionRef.current = connection;
                })
                .catch(err => {
                    console.error("❌ Error conectando SignalR global:", err);
                    setIsConnected(false);
                    connectionRef.current = null;
                    delete (window as any).__signalRConnection;
                });
        }, 1000);

        return () => {
            clearInterval(interval);
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
            delete (window as any).__signalRConnection;
        };
    }, []);

    return {
        connectionRef,
        isConnected,
    };
}