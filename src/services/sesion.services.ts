"use client";

import {
  GetLocalStorage,
  GetSessionStorage,
  SetIp,
  getDeviceBrand,
  getDeviceModel,
  GetOrCreateDeviceFingerprint,
} from "@/helpers/helpers";
import { CodigosError } from "@/helpers/validators";
import { InicioSesionResponse } from "@/interfaces/Api/sesion.api";
import { UserLoginProps } from "@/interfaces/App/User.interfaces";
import { GenericResponse } from "@/interfaces/Api/general.api";
import Axios from "axios";

Axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL || "";
Axios.defaults.headers.post["Content-Type"] = "application/json";
Axios.defaults.headers.post["Accept"] = "application/json";

export default class SesionServices {
  public async IniciarSesionPEL(user: UserLoginProps): Promise<InicioSesionResponse> {
    await SetIp();

    const deviceBrand = getDeviceBrand();
    const deviceModel = getDeviceModel();
    const deviceFingerprint = GetOrCreateDeviceFingerprint();
    const deviceId = GetLocalStorage("device_id");

    const dispositivoFisico = `${deviceBrand}|${deviceModel}|${deviceFingerprint}|${navigator.platform}|WEB|NAVEGADOR|${deviceId}`;

    const requestBody = {
      BpinReq: {
        canal: process.env.NEXT_PUBLIC_CANAL_CORRESPONSAL || "3",
        dispositivoFisico: dispositivoFisico,
        ipDispositivo: GetSessionStorage("device_ip"),
        ctnro: "",
        usuario: user.user,
        token: user.password,
      },
      Dispositivo: {
        Modelo: deviceModel,
        Fabricante: deviceBrand,
        Nombre: navigator.appName,
        VersionOS: navigator.platform,
        Plataforma: "WEB",
        TipoDispositivo: "NAVEGADOR",
        Identificador: deviceId,
        TieneBiometria: false,
        Navegador: navigator.userAgent,
        VersionAplicacion: "PUNTOS POPULAR 2.0",
      },
    };

    console.log("📤 Enviando IniciarSesionPEL con dispositivo:", {
      Marca: deviceBrand,
      Modelo: deviceModel,
      Fingerprint: deviceFingerprint,
      DeviceID: deviceId,
      IP: GetSessionStorage("device_ip"),
    });

    return new Promise<InicioSesionResponse>((resolve) => {
      Axios.post(
        "/api/Seguridad/v1/BancoPopular/iniciar-sesion-corresponsal",
        requestBody
      )
        .then((result) => {
          console.log("✅ Respuesta IniciarSesionPEL:", result.data);
          resolve(result.data);
        })
        .catch((err) => {
          console.error("❌ Error en IniciarSesionPEL:", err);
          resolve({
            token: "",
            requiereAutorizacion: false,
            requiereCambioContraseña: false,
            tieneSesionActiva: false,
            dispositivoPrincipal: "",
            nombreCliente: "",
            ctnro: "",
            info: "",
            idCorresponsal: "",
            idUsuario: "",
            pass: null,
            identidad: "",
            primerNombre: "",
            segundoNombre: null,
            primerApellido: "",
            segundoApellido: null,
            cuentaBP: "",
            correo: "",
            bpOutReq: {
              codigoError: CodigosError.ErrorGeneral.Codigo.toString(),
              mensajeError: CodigosError.ErrorGeneral.Mensaje,
              fechaHora: new Date(),
            },
          });
        });
    });
  }

  public async ValidarSesionCorresponsal(
    usuario: string,
    token: string,
    ctnro: string
  ): Promise<GenericResponse> {
    const deviceBrand = getDeviceBrand();
    const deviceModel = getDeviceModel();
    const deviceFingerprint = GetOrCreateDeviceFingerprint();
    const deviceId = GetLocalStorage("device_id");

    const dispositivoFisico = `${deviceBrand}|${deviceModel}|${deviceFingerprint}|${navigator.platform}|WEB|NAVEGADOR|${deviceId}`;

    const requestBody = {
      bpInReq: {
        canal: parseInt(process.env.NEXT_PUBLIC_CANAL_CORRESPONSAL || "3"),
        dispositivoFisico: dispositivoFisico,
        ipDispositivo: GetSessionStorage("device_ip"),
        ctnro: ctnro,
        usuario: usuario,
        token: token,
      },
    };

    console.log("📤 Enviando ValidarSesionCorresponsal con:", {
      usuario: requestBody.bpInReq.usuario,
      ctnro: requestBody.bpInReq.ctnro,
      dispositivo: dispositivoFisico,
      token: `${token.substring(0, 20)}...`,
    });

    return new Promise<GenericResponse>((resolve) => {
      Axios.post(
        "/api/Seguridad/v1/BancoPopular/validar-sesion-corresponsal",
        requestBody
      )
        .then((result) => {
          console.log("✅ Respuesta ValidarSesionCorresponsal:", result.data);
          resolve(result.data);
        })
        .catch((err) => {
          console.error("❌ Error en ValidarSesionCorresponsal:", err);
          resolve({
            bpOutReq: {
              codigoError: CodigosError.ErrorGeneral.Codigo.toString(),
              mensajeError: CodigosError.ErrorGeneral.Mensaje,
              fechaHora: new Date(),
            },
          });
        });
    });
  }
}