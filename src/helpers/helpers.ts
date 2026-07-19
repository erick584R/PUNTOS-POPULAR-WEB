import { bpInReq } from "@/interfaces/Api/general.api";

type LocalStorageCodes = "device_id" | "user_name";
type SessionStorageCodes =
  | "user_id"
  | "user_token"
  | "sesion_info"
  | "device_ip"
  | "user_name"
  | "user_name_data"
  | "user_main_disp";

export function SaveLocalStorage(key: LocalStorageCodes, value: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
}

export function SaveSessionStorage(key: SessionStorageCodes, value: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, value);
  }
}

export function GetLocalStorage(key: LocalStorageCodes): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) || "";
  }
  return "";
}

export function GetSessionStorage(key: SessionStorageCodes): string {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(key) || "";
  }
  return "";
}

export function RemoveLocalStorage(key: LocalStorageCodes): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}

export function RemoveSessionStorage(key: SessionStorageCodes): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(key);
  }
}

export async function SetIp() {
  try {
    const local_ip = GetSessionStorage("device_ip");
    if (!local_ip) {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      SaveSessionStorage("device_ip", data.ip);
    }
  } catch {
    SaveSessionStorage("device_ip", "0.0.0.0");
  }
}

export function DefaultBPinReq(): Promise<bpInReq> {
  return new Promise<bpInReq>(async (resolve) => {
    const disp = `${navigator.appName}|N/A|${navigator.appVersion}|${navigator.platform}|WEB|NAVEGADOR|${GetLocalStorage("device_id")}`;

    const response = {
      canal: parseInt(process.env.NEXT_PUBLIC_CANAL || "1"),
      dispositivoFisico: disp,
      ipDispositivo: "",
      ctnro: GetSessionStorage("user_id"),
      usuario: GetSessionStorage("user_name"),
      token: GetSessionStorage("user_token"),
    };

    await SetIp();
    response.ipDispositivo = GetSessionStorage("device_ip");

    if (response.ctnro === "") response.ctnro = "0";

    resolve(response);
  });
}