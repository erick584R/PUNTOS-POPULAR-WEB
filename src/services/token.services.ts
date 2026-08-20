"use client";

import Axios from "axios";
import {
  GetSessionStorage,
  GetLocalStorage,
  getDeviceBrand,
  getDeviceModel,
  GetOrCreateDeviceFingerprint,
} from "@/helpers/helpers";

Axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL || "";
Axios.defaults.headers.post["Content-Type"] = "application/json";
Axios.defaults.headers.post["Accept"] = "application/json";

function buildBpInReq() {
  const ctnro = GetSessionStorage("user_id");
  const usuario = GetSessionStorage("user_name");
  const token = GetSessionStorage("user_token");
  const ipDispositivo = GetSessionStorage("device_ip");
  const deviceId = GetLocalStorage("device_id");

  const deviceBrand = getDeviceBrand();
  const deviceModel = getDeviceModel();
  const deviceFingerprint = GetOrCreateDeviceFingerprint();

  const dispositivoFisico = `${deviceBrand}|${deviceModel}|${deviceFingerprint}|${navigator.platform}|WEB|NAVEGADOR|${deviceId}`;

  return {
    canal: parseInt(process.env.NEXT_PUBLIC_CANAL_CORRESPONSAL || "3"),
    dispositivoFisico,
    ipDispositivo: ipDispositivo || "",
    ctnro: ctnro || "",
    usuario: usuario || "",
    token: token || "",
  };
}

export interface GenerarTokenCorresponsalRequest {
  cuentaCliente: string;
  enviarEmail: boolean;
  enviarSMS: boolean;
}

export interface ValidarTokenCorresponsalRequest {
  cuentaCliente: string;
  tokenBP: string;
}

export default class TokenServices {
  public async GenerarTokenCorresponsal(body: GenerarTokenCorresponsalRequest) {
    const requestBody = {
      bpInReq: buildBpInReq(),
      cuentaCliente: body.cuentaCliente,
      enviarEmail: body.enviarEmail,
      enviarSMS: body.enviarSMS,
    };

    return new Promise<any>((resolve) => {
      Axios.post("/api/Token/v1/BancoPopular/Generar-Token-Corresponsal", requestBody)
        .then((result) => resolve(result.data))
        .catch((err) =>
          resolve({
            bpOutReq: {
              codigoError: "4016",
              mensajeError: "No se pudo enviar el Token. Intenta de Nuevo.",
              fechaHora: new Date(),
            },
            __error: err,
          })
        );
    });
  }

  public async ValidarTokenCorresponsal(body: ValidarTokenCorresponsalRequest) {
    const requestBody = {
      bpInReq: buildBpInReq(),
      cuentaCliente: body.cuentaCliente,
      tokenBP: body.tokenBP,
    };

    return new Promise<any>((resolve) => {
      Axios.post("/api/Token/v1/BancoPopular/Validar-Token-Corresponsal", requestBody)
        .then((result) => resolve(result.data))
        .catch((err) =>
          resolve({
            bpOutReq: {
              codigoError: "4018",
              mensajeError: "No se pudo validar el Token. Intenta de Nuevo.",
              fechaHora: new Date(),
            },
            __error: err,
          })
        );
    });
  }
}