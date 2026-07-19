import { bpOutReq } from "./general.api";

export interface InicioSesionResponse {
  token: string;
  requiereAutorizacion: boolean;
  requiereCambioContraseña: boolean;
  tieneSesionActiva: boolean;
  nombreCliente: string;
  dispositivoPrincipal: string;
  ctnro: string;
  info: string;
  bpOutReq: bpOutReq;
}