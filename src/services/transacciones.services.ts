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

export interface DepositoCorresponsalRequest {
  importe: number;
  cuentaCliente: string;
  cuentaAgente: string;
  agenteCorresponsal: string;
  usuarioCorresponsal: string;
  nombreCliente: string;
  documentoCliente: string;
}

export default class TransaccionesServices {
  private buildRequestBody(body: DepositoCorresponsalRequest) {
    return {
      bpInReq: buildBpInReq(),
      importe: body.importe,
      cuentaCliente: body.cuentaCliente,
      cuentaAgente: body.cuentaAgente,
      agenteCorresponsal: body.agenteCorresponsal,
      usuarioCorresponsal: body.usuarioCorresponsal,
      nombreCliente: body.nombreCliente,
      documentoCliente: body.documentoCliente,
    };
  }

  public async DepositoCorresponsal(body: DepositoCorresponsalRequest) {
    const requestBody = this.buildRequestBody(body);

    return new Promise<any>((resolve) => {
      Axios.post("/api/Transacciones/v1/BancoPopular/Deposito-Corresponsal", requestBody)
        .then((result) => resolve(result.data))
        .catch((err) =>
          resolve({
            bpOutReq: {
              codigoError: "4012",
              mensajeError: "No fue posible realizar la Transacción. Intenta de Nuevo.",
              fechaHora: new Date(),
            },
            movimientoUId: null,
            erroresnegocio: null,
            btoutreq: null,
            recibo: null,
            __error: err,
          })
        );
    });
  }

  public async RetiroCorresponsal(body: DepositoCorresponsalRequest) {
    const requestBody = this.buildRequestBody(body);

    return new Promise<any>((resolve) => {
      Axios.post("/api/Transacciones/v1/BancoPopular/Retiro-Corresponsal", requestBody)
        .then((result) => resolve(result.data))
        .catch((err) =>
          resolve({
            bpOutReq: {
              codigoError: "4012",
              mensajeError: "No fue posible realizar la Transacción. Intenta de Nuevo.",
              fechaHora: new Date(),
            },
            movimientoUId: null,
            erroresnegocio: null,
            btoutreq: null,
            recibo: null,
            __error: err,
          })
        );
    });
  }
}