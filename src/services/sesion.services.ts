"use client";

// ==========================================================
// Este archivo corre del lado del cliente.
// Eso es importante porque aquí se usan:
// - navigator
// - sessionStorage
// - localStorage
// - funciones que dependen del navegador
// ==========================================================

import { GetLocalStorage, GetSessionStorage, SetIp } from "@/helpers/helpers";
// ----------------------------------------------------------
// GetLocalStorage(key):
//   lee un valor guardado en localStorage.
//
// GetSessionStorage(key):
//   lee un valor guardado en sessionStorage.
//
// SetIp():
//   obtiene la IP pública del usuario y la guarda en sessionStorage.
// ----------------------------------------------------------

import { CodigosError } from "@/helpers/validators";
// ----------------------------------------------------------
// CodigosError contiene mensajes/códigos por defecto para errores.
// Aquí se usa cuando la petición al backend falla completamente.
// ----------------------------------------------------------

import { InicioSesionResponse } from "@/interfaces/Api/sesion.api";
// ----------------------------------------------------------
// Este tipo describe cómo debe verse la respuesta del backend
// cuando intentamos iniciar sesión.
// ----------------------------------------------------------

import { UserLoginProps } from "@/interfaces/App/User.interfaces";
// ----------------------------------------------------------
// Este tipo describe el objeto que recibe el login:
// {
//   user: string,
//   password: string
// }
// ----------------------------------------------------------

import Axios from "axios";
// ----------------------------------------------------------
// Axios es una librería para hacer peticiones HTTP.
// La usamos para enviar el login al backend.
// ----------------------------------------------------------

// ==========================================================
// Configuración global de Axios
// ==========================================================

// La URL base del backend se toma de una variable de entorno.
// Si no existe, usa string vacío.
Axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_GATEWAY || "";

// Todas las peticiones POST enviarán JSON
Axios.defaults.headers.post["Content-Type"] = "application/json";

// Indicamos que esperamos JSON como respuesta
Axios.defaults.headers.post["Accept"] = "application/json";

// ==========================================================
// Clase de servicios de sesión
// ==========================================================
export default class SesionServices {
  // ========================================================
  // Método principal para iniciar sesión
  // ========================================================
  public async IniciarSesionPEL(user: UserLoginProps): Promise<InicioSesionResponse> {
    // ------------------------------------------------------
    // Antes de hacer login, nos aseguramos de tener la IP.
    // SetIp() la obtiene y la guarda en sessionStorage
    // si todavía no existe.
    // ------------------------------------------------------
    await SetIp();

    // ------------------------------------------------------
    // requestBody es el objeto que le mandaremos al backend.
    // Aquí estamos armando la estructura exacta que la API espera.
    // ------------------------------------------------------
    const requestBody = {
      BpinReq: {
        // Canal desde variable de entorno.
        // Si no existe, usa "1".
        canal: process.env.NEXT_PUBLIC_CANAL || "1",

        // Campo reservado para descripción del dispositivo físico.
        // Actualmente va vacío.
        dispositivoFisico: "",

        // IP pública guardada en sessionStorage.
        ipDispositivo: GetSessionStorage("device_ip"),

        // ctnro va vacío al momento del login.
        // Parece ser un identificador del cliente/usuario
        // que se completa luego cuando el backend responde.
        ctnro: "",

        // Usuario digitado en el formulario
        usuario: user.user,

        // Contraseña digitada en el formulario