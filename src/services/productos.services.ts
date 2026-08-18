"use client";

import Axios from "axios";
import {
  GetSessionStorage,
  GetLocalStorage,
  getDeviceBrand,
  getDeviceModel,
  GetOrCreateDeviceFingerprint,
} from "@/helpers/helpers";
import { CodigosError } from "@/helpers/validators";
import { bpInReq } from "@/interfaces/Api/general.api";
import {
  ObtenerDatosCuentaDestinoRequest,
  ObtenerDatosCuentaDestinoResponse,
  ProductoPasivo,
  SdtPersona,
} from "@/interfaces/Api/productos.api";
import { CuentaCorresponsalDetalle } from "@/interfaces/App/Productos.interfaces";

Axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_GATEWAY_CORRESPONSAL || "";
Axios.defaults.headers.post["Content-Type"] = "application/json";
Axios.defaults.headers.post["Accept"] = "application/json";

function buildBpInReq(): bpInReq {
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

function mapProductoToDetalle(
  producto: ProductoPasivo,
  persona: SdtPersona | null,
  nombreFallback: string
): CuentaCorresponsalDetalle {
  const nombreCompleto = [
    persona?.primerNombre,
    persona?.segundoNombre,
    persona?.primerApellido,
    persona?.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    nombre: nombreCompleto || nombreFallback,
    cuenta: producto.productoFormatoBP,
    direccion: persona?.direccion || "",
    nroDocumento: persona?.nroDocumento || "",
    moneda: producto.producto.moneda,
    tipoProducto: producto.tipoProducto,
    estado: producto.estado,
    sucursal: producto.sucursal,
    saldo: producto.saldo,
    ctnro: persona?.ctnro?.toString() || GetSessionStorage("user_id"),
    clienteUid: persona?.clienteUid?.toString() || "",
    telefonoCelular: persona?.telefonoCelular || "",
    correoElectronico: persona?.correoElectronico || "",
  };
}

export default class ProductosServices {
  public async ObtenerDatosCuentaDestino(
    cuenta: string
  ): Promise<ObtenerDatosCuentaDestinoResponse> {
    const requestBody: ObtenerDatosCuentaDestinoRequest = {
      bpInReq: buildBpInReq(),
      cuenta,
    };

    return new Promise((resolve) => {
      Axios.post(
        "/api/ProductosCorresponsal/v1/BancoPopular/obtener-datos-cuenta-destino",
        requestBody
      )
        .then((result) => resolve(result.data))
        .catch(() =>
          resolve({
            bpOutReq: {
              codigoError: CodigosError.ErrorGeneral.Codigo.toString(),
              mensajeError: CodigosError.ErrorGeneral.Mensaje,
              fechaHora: new Date(),
            },
            productosPasivos: null,
            sdtPersona: null,
          })
        );
    });
  }

  public async ObtenerCuentaCorresponsalDetalle(cuenta: string): Promise<{
    ok: boolean;
    detalle?: CuentaCorresponsalDetalle;
    mensajeError?: string;
    codigoError?: string;
  }> {
    const response = await this.ObtenerDatosCuentaDestino(cuenta);

    if (response.bpOutReq.codigoError !== "0") {
      return {
        ok: false,
        codigoError: response.bpOutReq.codigoError,
        mensajeError: response.bpOutReq.mensajeError,
      };
    }

    const producto =
      response.productosPasivos?.productosPasivos?.productoPasivo?.[0];

    if (!producto) {
      return {
        ok: false,
        mensajeError: "No se encontró información de la cuenta.",
      };
    }

    const nombreFallback =
      GetSessionStorage("user_name_data") || GetSessionStorage("user_name") || "";

    return {
      ok: true,
      detalle: mapProductoToDetalle(producto, response.sdtPersona, nombreFallback),
    };
  }
}