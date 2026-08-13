import { bpInReq, bpOutReq } from "./general.api";

export interface ObtenerDatosCuentaDestinoRequest {
  bpInReq: bpInReq;
  cuenta: string;
}

export interface ProductoPasivo {
  productoFormatoBP: string;
  tipoProducto: string;
  estado: string;
  subCuenta: string;
  operacionUId: number;
  saldo: number;
  idOperacionFmt: string;
  idOperacionBT: string;
  producto: {
    moneda: string;
    papel: string;
    productoUId: number;
    nombre: string;
  };
  sucursal: string;
}

export interface SdtPersona {
  ctnro: number;
  clienteUid: number;
  personaUid: number;
  paisDocumentoId: number;
  apartamento: string;
  sectorId: number;
  tipoDocumentoId: number;
  ingresos: number;
  nacionalidad: string;
  ocupacionId: number;
  sexo: string;
  barrio: string;
  estadoCivil: string;
  direccion: string;
  nroDocumento: string;
  localidad: string;
  segundoNombre: string;
  clasificacionInternaId: number;
  telefonoCelular: string;
  departamentoId: number;
  actividadLaboral: string;
  nacionalidadId: number;
  localidadId: number;
  clasificacionInterna: string;
  paisDomicilioId: number;
  sector: string;
  telefonoFijo: string;
  referencia: string;
  codigoPostal: string;
  primerNombre: string;
  fechaNacimiento: string;
  actividadLaboralId: number;
  primerApellido: string;
  estadoCivilId: string;
  segundoApellido: string;
  paisDocumento: string;
  fechaInicioActividad: string;
  ocupacion: string;
  paisDomicilio: string;
  departamento: string;
  fechaVencimiento: string | null;
  correoElectronico: string;
  numeroPuerta: string;
  calle: string;
  barrioId: number;
  tipoDocumento: string;
}

export interface ObtenerDatosCuentaDestinoResponse {
  bpOutReq: bpOutReq;
  productosPasivos: {
    productosPasivos: {
      productoPasivo: ProductoPasivo[];
    };
  } | null;
  sdtPersona: SdtPersona | null;
}