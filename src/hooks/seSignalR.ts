import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR(userId: string) {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [FinalizarSesion, setFinalizarSesion] = useState<boolean>(false);
    const [MensajeRecibido, SetMensajeRecibido] = useState<string>("");

    useEffect(() => {
        if (!userId) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(
                `${process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL}/api/Notificaciones/v1/BancoPopular/inicio-sesion-corresponsal`,
                {
                    accessTokenFactory: () => userId, // Pasar usuario como token
                    transport: signalR.HttpTransportType.WebSockets,
                }
            )
            .withAutomaticReconnect([0, 0, 0, 3000, 5000, 10000]) // Reconectar automáticamente
            .build();

        connection.onclose((error) => {
            if (error) {
                console.error("❌ Conexión SignalR cerrada inesperadamente:", error);
            } else {
                console.log("✅ Conexión SignalR cerrada normalmente");
            }
        });

        // Evento: Recibir notificación de sesión en otro dispositivo
        connection.on("RecibirNotificacion", (message: string) => {
            console.log("🔔 Notificación recibida:", message);
            setFinalizarSesion(true);
            SetMensajeRecibido(message);
        });

        // Iniciar conexión
        connection.start()
            .then(() => console.log("✅ Conectado a SignalR"))
            .catch(err => console.error("❌ Error conectando a SignalR:", err));

        connectionRef.current = connection;

        return () => {
            connection.stop();
        };

    }, [userId]);

    return {
        connectionRef,
        FinalizarSesion,
        MensajeRecibido,
    };
}