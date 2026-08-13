import { bpInReq } from "@/interfaces/Api/general.api";

type LocalStorageCodes = "device_id" | "user_name" | "device_fingerprint";
type SessionStorageCodes =
  | "user_id"
  | "user_account"
  | "user_token"
  | "sesion_info"
  | "device_ip"
  | "user_name"
  | "user_name_data"
  | "user_main_disp"
  | "user_profile"
  | "session_closed_by_other_device"
  | "session_closed_message";
  

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

export function getDeviceBrand(): string {
  const userAgent = navigator.userAgent;

  if (userAgent.includes("Windows")) return "Microsoft";
  if (userAgent.includes("Mac OS X")) return "Apple";
  if (userAgent.includes("Linux")) {
    if (userAgent.includes("Android")) return "Android";
    return "Linux";
  }
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "Apple";

  return "N/A";
}

export function getDeviceModel(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows PC";
  if (ua.includes("Mac OS X")) return "Mac";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone")) return "iPhone";
  if (ua.includes("iPad")) return "iPad";
  if (ua.includes("Linux")) return "Linux";
  return "N/A";
}

export function GetOrCreateDeviceFingerprint(): string {
  const existing = GetLocalStorage("device_fingerprint");
  if (existing) return existing;

  const fingerprint =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  SaveLocalStorage("device_fingerprint", fingerprint);
  return fingerprint;
}

export function HasActiveSession(): boolean {
  if (typeof window === "undefined") return false;

  const token = sessionStorage.getItem("user_token");
  const userName = sessionStorage.getItem("user_name");
  const userId = sessionStorage.getItem("user_id");
  const sessionInfo = sessionStorage.getItem("sesion_info");

  return !!token && !!userName && !!userId && !!sessionInfo;
}

export function ClearCurrentSession(): void {
  if (typeof window === "undefined") return;

  const sessionKeys = [
    "user_id",
    "user_account",
    "user_token",
    "sesion_info",
    "device_ip",
    "user_name",
    "user_name_data",
    "user_main_disp",
    "user_profile",
  ] as const;

  sessionKeys.forEach((key) => sessionStorage.removeItem(key));
}