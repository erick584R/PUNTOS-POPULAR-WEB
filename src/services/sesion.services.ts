"use client";

import { GetLocalStorage, GetSessionStorage, SetIp } from "@/helpers/helpers";
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

        const requestBody = {
            BpinReq: {
                canal: process.env.NEXT_PUBLIC_CANAL_CORRESPONSAL || "3",
                dispositivoFisico: "",
                ipDispositivo: GetSessionStorage("device_ip"),
                ctnro: "",
                usuario: user.user,
                token: user.password,
            },
            Dispositivo: {
                Modelo: navigator.appVersion,
                Fabricante: "N/A",
                Nombre: navigator.appName,
                VersionOS: navigator.platform,
                Plataforma: "WEB",
                TipoDispositivo: "NAVEGADOR",
                Identificador: GetLocalStorage("device_id"),
                TieneBiometria: false,
                Navegador: navigator.userAgent,
                VersionAplicacion: "PUNTOS POPULAR 2.0",
            },
        };

        return new Promise<InicioSesionResponse>((resolve) => {
            Axios.post("/api/Seguridad/v1/BancoPopular/iniciar-sesion-corresponsal", requestBody)
                .then((result) => resolve(result.data))
                .catch(() =>
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
                    })
                );
        });
    }

    // ✅ NUEVO MÉTODO: Llamar a validar-sesion-corresponsal
    // Este endpoint desactiva la sesión anterior en otros dispositivos
    public async ValidarSesionCorresponsal(user: UserLoginProps): Promise<GenericResponse> {
        const requestBody = {
            bpInReq: {
                canal: parseInt(process.env.NEXT_PUBLIC_CANAL_CORRESPONSAL || "3"),
                dispositivoFisico: `${navigator.appName}|N/A|${navigator.appVersion}|${navigator.platform}|WEB|NAVEGADOR|${GetLocalStorage("device_id")}`,
                ipDispositivo: GetSessionStorage("device_ip"),
                ctnro: "",
                usuario: user.user,
                token: user.password,
            },
        };

        return new Promise<GenericResponse>((resolve) => {
            Axios.post("/api/Seguridad/v1/BancoPopular/validar-sesion-corresponsal", requestBody)
                .then((result) => resolve(result.data))
                .catch(() =>
                    resolve({
                        bpOutReq: {
                            codigoError: CodigosError.ErrorGeneral.Codigo.toString(),
                            mensajeError: CodigosError.ErrorGeneral.Mensaje,
                            fechaHora: new Date(),
                        },
                    })
                );
        });
    }
}