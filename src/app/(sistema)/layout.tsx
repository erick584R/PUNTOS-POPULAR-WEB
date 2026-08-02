"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/navigation/Sidebar";
import Navbar from "@/components/navigation/Navbar";
import { GetSessionStorage } from "@/helpers/helpers";

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = GetSessionStorage("user_token");
    const userName = GetSessionStorage("user_name");
    const userId = GetSessionStorage("user_id");
    const sessionInfo = GetSessionStorage("sesion_info");

    const hasValidSession = !!token && !!userName && !!userId && !!sessionInfo;

    if (!hasValidSession) {
      router.replace("/");
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return null;
  }

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