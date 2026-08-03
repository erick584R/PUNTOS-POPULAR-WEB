import {
  GetSessionStorage,
  GetLocalStorage,
  getDeviceBrand,
  getDeviceModel,
  GetOrCreateDeviceFingerprint,
} from "@/helpers/helpers";

export async function cerrarSesionCorresponsal() {
  const token = GetSessionStorage("user_token");
  const usuario = GetSessionStorage("user_name");
  const ctnro = GetSessionStorage("user_id");
  const ipDispositivo = GetSessionStorage("device_ip");
  const deviceId = GetLocalStorage("device_id");

  const deviceBrand = getDeviceBrand();
  const deviceModel = getDeviceModel();
  const deviceFingerprint = GetOrCreateDeviceFingerprint();

  const dispositivoFisico = `${deviceBrand}|${deviceModel}|${deviceFingerprint}|${navigator.platform}|WEB|NAVEGADOR|${deviceId}`;

  const bpInReq = {
    canal: parseInt(process.env.NEXT_PUBLIC_CANAL_CORRESPONSAL || "3"),
    dispositivoFisico,
    ipDispositivo,
    ctnro,
    usuario,
    token,
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL}/api/Seguridad/v1/BancoPopular/cerrar-sesion-corresponsal`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ bpInReq }),
    }
  );

  const data = await res.json().catch(() => null);

  const codigo =
    data?.bpOutReq?.codigoError ??
    data?.bpOutReq?.CodigoError ??
    data?.codigoError ??
    data?.CodigoError ??
    (res.ok ? "0" : undefined);

  const mensaje =
    data?.bpOutReq?.mensajeError ??
    data?.bpOutReq?.MensajeError ??
    data?.mensajeError ??
    data?.MensajeError ??
    "Falló el cierre de la sesión.";

  return { ok: codigo === "0", codigo, mensaje };
}