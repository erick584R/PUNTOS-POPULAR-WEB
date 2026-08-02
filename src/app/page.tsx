"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/components/views/LoginPage";
import { GetSessionStorage } from "@/helpers/helpers";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = GetSessionStorage("user_token");
    const userName = GetSessionStorage("user_name");
    const userId = GetSessionStorage("user_id");
    const sessionInfo = GetSessionStorage("sesion_info");

    if (token && userName && userId && sessionInfo) {
      router.replace("/dashboard");
    }
  }, [router]);

  return <LoginPage />;
}