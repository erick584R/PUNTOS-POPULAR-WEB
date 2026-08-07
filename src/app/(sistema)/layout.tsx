"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import Navbar from "@/components/navigation/Navbar";
import { GetSessionStorage } from "@/helpers/helpers";
import { useSignalRGlobal } from "@/hooks/useSignalRGlobal";

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = GetSessionStorage("user_token");
    const userName = GetSessionStorage("user_name");
    const userId = GetSessionStorage("user_id");
    const sessionInfo = GetSessionStorage("sesion_info");

    const valid = !!token && !!userName && !!userId && !!sessionInfo;
    setHasValidSession(valid);

    if (!valid) {
      router.replace("/");
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return null;
  }

  if (!hasValidSession) {
    return null;
  }

  return (
    <SistemaContent
      isSidebarCollapsed={isSidebarCollapsed}
      setIsSidebarCollapsed={setIsSidebarCollapsed}
    >
      {children}
    </SistemaContent>
  );
}

function SistemaContent({
  children,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: {
  children: React.ReactNode;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  useSignalRGlobal();

  return (
    <div className="popular-dashboard-layout">
      <Sidebar onToggle={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      <div className={`popular-content-wrapper ${isSidebarCollapsed ? "expanded" : ""}`}>
        <Navbar />
        <main className="popular-main-content">{children}</main>
      </div>
    </div>
  );
}