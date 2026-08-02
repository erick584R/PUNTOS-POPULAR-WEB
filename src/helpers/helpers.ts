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
  | "user_profile";

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
  const userAgent = navigator.userAgent;

  const iphoneMatch = userAgent.match(/iPhone OS (\d+)/);
  if (iphoneMatch) return `iPhone (iOS ${iphoneMatch[1]})`;

  const ipadMatch = userAgent.match(/iPad/);
  if (ipadMatch) return "iPad";

  const windowsMatch = userAgent.match(/Windows NT ([\d.]+)/);
  if (windowsMatch) return `Windows ${windowsMatch[1]}`;

  const androidMatch = userAgent.match(/Android ([\d.]+)/);
  if (androidMatch) return `Android ${androidMatch[1]}`;

  const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
  if (macMatch) return `macOS ${macMatch[1].replace(/_/g, ".")}`;

  return userAgent.substring(0, 50);
}

export function generateDeviceFingerprint(): string {
  const screenResolution = `${screen.width}x${screen.height}`;
  const platform = navigator.platform;
  const language = navigator.language;
  const hardwareConcurrency = navigator.hardwareConcurrency || "unknown";
  const deviceMemory = (navigator as any).deviceMemory || "unknown";

  const fingerprint = `${screenResolution}|${platform}|${language}|${hardwareConcurrency}|${deviceMemory}`;

  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

export function GetOrCreateDeviceFingerprint(): string {
  let fingerprint = GetLocalStorage("device_fingerprint");

  if (!fingerprint) {
    fingerprint = generateDeviceFingerprint();
    SaveLocalStorage("device_fingerprint", fingerprint);
  }

  return fingerprint;
}

export function DefaultBPinReq(): Promise<bpInReq> {
  return new Promise<bpInReq>(async (resolve) => {
    const deviceBrand = getDeviceBrand();
    const deviceModel = getDeviceModel();
    const deviceId = GetLocalStorage("device_id");
    const deviceFingerprint = GetOrCreateDeviceFingerprint();

    const disp = `${deviceBrand}|${deviceModel}|${deviceFingerprint}|${navigator.platform}|WEB|NAVEGADOR|${deviceId}`;

    const response = {
      canal: parseInt(process.env.NEXT_PUBLIC_CANAL || "3"),
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