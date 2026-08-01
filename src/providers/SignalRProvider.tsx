"use client";

import { useSignalRGlobal } from "@/hooks/useSignalRGlobal";

export function SignalRProvider({ children }: { children: React.ReactNode }) {
    // ✅ Esto inicia el hook global que conecta SignalR en toda la app
    useSignalRGlobal();

    return <>{children}</>;
}