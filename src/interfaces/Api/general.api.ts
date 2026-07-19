export interface bpInReq {
  canal: number;
  dispositivoFisico: string;
  ipDispositivo: string;
  ctnro: string;
  usuario: string;
  token: string;
}

export interface bpOutReq {
  codigoError: string;
  mensajeError: string;
  fechaHora: Date;
}

export interface GenericResponse {
  bpOutReq: bpOutReq;
}