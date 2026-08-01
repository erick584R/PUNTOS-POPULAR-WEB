import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR(userId: string) {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [FinalizarSesion, setFinalizarSesion] = useState<boolean>(false);
    const [MensajeRecibido, SetMensajeRecibido] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId || userId.trim() === "") {
            console.log("⏳ Esperando usuario para SignalR...");
            setIsConnected(false);
            return;
        }

        console.log(`🔌 Iniciando conexión SignalR para usuario: ${userId}`);
        console.log(`🌐 URL: ${process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL}/api/Notificaciones/v1/BancoPopular/inicio-sesion-corresponsal?access_token=${userId}`);

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(
                `${process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL}/api/Notificaciones/v1/BancoPopular/inicio-sesion-corresponsal?access_token=${encodeURIComponent(userId)}`,
                {
                    skipNegotiation: false,
                    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                    withCredentials: true,
                }
            )
            .withAutomaticReconnect([0, 0, 0, 3000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Debug) // Debug para ver más detalles
            .build();

        connection.onclose((error) => {
            console.error("❌ Conexión SignalR cerrada:", error?.message || "Sin detalles");
            setIsConnected(false);
        });

        connection.onreconnected((connectionId) => {
            console.log("✅ Reconectado a SignalR:", connectionId);
            setIsConnected(true);
        });

        connection.on("RecibirNotificacion", (message: string) => {
            console.log("🔔 Notificación recibida:", message);
            setFinalizarSesion(true);
            SetMensajeRecibido(message);
        });

        connection.start()
            .then(() => {
                console.log("✅ Conectado a SignalR exitosamente");
                setIsConnected(true);
            })
            .catch(err => {
                console.error("❌ Error conectando a SignalR:", err);
                console.error("Detalles del error:", err.message);
                setIsConnected(false);
            });

        connectionRef.current = connection;

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };

    }, [userId]);

    return {
        connectionRef,
        FinalizarSesion,
        MensajeRecibido,
        isConnected,
    };
}