"use client";

// ==========================================================
// Este componente es del lado del cliente.
// Eso permite usar:
// - useState
// - useEffect
// - localStorage
// - sessionStorage
// - window.location
// ==========================================================

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AccountCircleOutlined, LockOutlined } from "@mui/icons-material";
import { Checkbox, FormControlLabel } from "@mui/material";

// Tipo que define la forma del formulario de login:
// {
//   user: string;
//   password: string;
// }
import { UserLoginProps } from "@/interfaces/App/User.interfaces";

// Hook helper para manejar formularios fácilmente.
// Nos da:
// - values: valores actuales
// - handleChange: función para actualizar valores
import useFormHelper from "@/helpers/useFormHelper";

// Validador por defecto para los inputs.
// En tu proyecto actual este arreglo está vacío,
// pero se sigue enviando al componente input.
import { DefaultValidator } from "@/helpers/validators";

// Servicio que se comunica con el backend para iniciar sesión.
import SesionServices from "@/services/sesion.services";

// Componente visual que muestra un loading overlay
// cuando loading = true.
import PopularBackdrop from "../feedback/Backdrop";

// Helpers para trabajar con localStorage y sessionStorage.
// También incluye SetIp(), que obtiene la IP pública.
import {
  GetLocalStorage,
  RemoveLocalStorage,
  SaveLocalStorage,
  SaveSessionStorage,
  SetIp,
} from "@/helpers/helpers";

// Input personalizado reutilizable para usuario y contraseña.
import PopularInput from "../forms/PopularInput";

// ==========================================================
// Componente principal de la pantalla de login
// ==========================================================
const LoginPage: React.FC = () => {
  // --------------------------------------------------------
  // Estado para saber si esta es la primera carga
  // del componente.
  // Lo usamos para ejecutar cierta lógica solo una vez.
  // --------------------------------------------------------
  const [initialLoad, setInitialLoad] = useState(true);

  // --------------------------------------------------------
  // Estado de loading:
  // true  = mostrar backdrop de carga
  // false = ocultarlo
  // --------------------------------------------------------
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------------
  // Estado del checkbox "Recordar"
  // true  = guardar usuario en localStorage
  // false = no guardarlo
  // --------------------------------------------------------
  const [remember, setRemember] = useState(false);

  // --------------------------------------------------------
  // Estado para guardar mensajes de error y mostrarlos
  // debajo del formulario.
  // --------------------------------------------------------
  const [errorResponse, setErrorResponse] = useState("");

  // --------------------------------------------------------
  // Creamos una instancia del servicio de sesión.
  // Desde aquí luego llamaremos al método:
  // IniciarSesionPEL(...)
  // --------------------------------------------------------
  const SesionService = new SesionServices();

  // --------------------------------------------------------
  // Valores iniciales del formulario.
  // Ambos campos empiezan vacíos.
  // --------------------------------------------------------
  const initialValues: UserLoginProps = {
    user: "",
    password: "",
  };

  // --------------------------------------------------------
  // Hook helper para manejar el formulario.
  //
  // values:
  //   guarda lo que el usuario escribe.
  //
  // handleChange:
  //   actualiza automáticamente el campo correcto.
  // --------------------------------------------------------
  const { values, handleChange } = useFormHelper<UserLoginProps>(initialValues);

  // ========================================================
  // useEffect de carga inicial
  // ========================================================
  useEffect(() => {
    // Solo corremos esta lógica si es la primera carga
    if (initialLoad) {
      // Marcamos que ya se ejecutó esta primera carga
      setInitialLoad(false);

      // Intentamos recuperar del navegador:
      // - el usuario recordado
      // - el identificador del dispositivo
      const user_name = GetLocalStorage("user_name");
      const device_id = GetLocalStorage("device_id");

      // Si hay un usuario guardado en localStorage...
      if (user_name !== "") {
        // Lo ponemos en el input "user"
        handleChange({ target: { name: "user", value: user_name } });

        // Y marcamos el checkbox "Recordar"
        setRemember(true);
      }

      // Si todavía no existe un device_id...
      if (device_id === "") {
        // Generamos un identificador aleatorio simple
        const randomId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        // Lo guardamos en localStorage para reutilizarlo
        SaveLocalStorage("device_id", randomId);
      }

      // Obtenemos y guardamos la IP pública del usuario.
      // Esto se usa luego en el login.
      SetIp();
    }
  }, [initialLoad, handleChange]);

  // ========================================================
  // Función para recordar o borrar el usuario
  // ========================================================
  function handleRememberMe() {
    // Si el checkbox está activo...
    if (remember) {
      // Guardamos el usuario en localStorage
      // en mayúsculas.
      SaveLocalStorage("user_name", values.user.toUpperCase());
    } else {
      // Si no está activo, borramos el usuario recordado
      RemoveLocalStorage("user_name");
    }
  }

  // ========================================================
  // Validación mínima del formulario
  // ========================================================
  function handleValidation() {
    // Devuelve true si:
    // - user está vacío
    // o
    // - password está vacío
    //
    // Se usa para deshabilitar el botón "Ingresar"
    return values.user.trim() === "" || values.password.trim() === "";
  }

  // ========================================================
  // Función principal de login
  // ========================================================
  async function handleLogin(e: React.FormEvent) {
    // Evita que el formulario recargue la página
    e.preventDefault();

    // Activa el loading visual
    setLoading(true);

    // Limpia cualquier error previo
    setErrorResponse("");

    try {
      // Llama al backend usando el servicio de sesión.
      // Le mandamos todo el objeto values:
      // {
      //   user: "...",
      //   password: "..."
      // }
      const response = await SesionService.IniciarSesionPEL(values);

      // Si el backend responde código "0",
      // significa que el login fue exitoso
      if (response.bpOutReq.codigoError === "0") {
        // Guarda o borra el usuario según el checkbox
        handleRememberMe();

        // Guardamos datos de sesión en sessionStorage
        SaveSessionStorage("user_name", values.user.toUpperCase());
        SaveSessionStorage("user_token", response.token);
        SaveSessionStorage("sesion_info", response.info);
        SaveSessionStorage("user_id", response.ctnro);
        SaveSessionStorage("user_name_data", response.nombreCliente);
        SaveSessionStorage("user_main_disp", response.dispositivoPrincipal);

        // Redirigimos a la pantalla welcome
        window.location.href = "/welcome";

        // Terminamos aquí la función
        return;
      }

      // Si no fue código 0, mostramos el error
      // que vino del backend
      setErrorResponse(
        `${response.bpOutReq.codigoError} - ${response.bpOutReq.mensajeError}`
      );
    } catch {
      // Si hubo error técnico (red, servidor, excepción),
      // mostramos un error genérico
      setErrorResponse("Error al iniciar sesión.");
    } finally {
      // Siempre quitamos el loading al final,
      // haya salido bien o mal
      setLoading(false);
    }
  }

  // ========================================================
  // Render de la pantalla
  // ========================================================
  return (
    <main className="popular-login-page">
      {/* ---------------------------------------------------
          Si loading = true, mostramos el backdrop con spinner
         --------------------------------------------------- */}
      {loading && <PopularBackdrop open={true} />}

      {/* ---------------------------------------------------
          Capa visual de fondo decorativo
         --------------------------------------------------- */}
      <div className="popular-login-bg" />

      {/* ---------------------------------------------------
          Tarjeta principal del login
         --------------------------------------------------- */}
      <section className="popular-login-card">
        {/* -------------------------------------------------
            Lado izquierdo de la tarjeta:
            muestra el logo
           ------------------------------------------------- */}
        <div className="popular-login-left">
          <div className="popular-login-logo-wrap">
            <Image
              src="/imgs/puntos-popular-logo.png"
              alt="Puntos Popular"
              width={280}
              height={280}
              className="popular-login-logo"
              priority
            />
          </div>
        </div>

        {/* -------------------------------------------------
            Lado derecho de la tarjeta:
            contiene el formulario
           ------------------------------------------------- */}
        <div className="popular-login-right">
          {/* -----------------------------------------------
              Formulario principal.
              onSubmit ejecuta handleLogin
             ----------------------------------------------- */}
          <form className="popular-login-form" onSubmit={handleLogin}>
            {/* ---------------------------------------------
                Input de usuario
               --------------------------------------------- */}
            <PopularInput
              className="popular-field"
              label="Usuario Corresponsal"
              name="user"
              value={values.user}
              placeholder="Ingrese su usuario"
              type="text"
              startAdornment={<AccountCircleOutlined />}
              regex={DefaultValidator}
              onChange={handleChange}
            />

            {/* ---------------------------------------------
                Input de contraseña
               --------------------------------------------- */}
            <PopularInput
              className="popular-field"
              label="Contraseña"
              name="password"
              value={values.password}
              placeholder="Ingrese su contraseña"
              startAdornment={<LockOutlined />}
              isPassword={true}
              regex={DefaultValidator}
              onChange={handleChange}
            />

            {/* ---------------------------------------------
                Fila del checkbox "Recordar"
               --------------------------------------------- */}
            <div className="popular-login-row">
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                }
                label="Recordar"
              />
            </div>

            {/* ---------------------------------------------
                Botón de enviar login
                Se deshabilita si falta usuario o contraseña
               --------------------------------------------- */}
            <button
              type="submit"
              disabled={handleValidation()}
              className="popular-submit-btn"
            >
              Ingresar
            </button>

            {/* ---------------------------------------------
                Botón visual de "Olvidaste tu contraseña?"
                Actualmente no ejecuta ninguna lógica real.
               --------------------------------------------- */}
            <button type="button" className="popular-forgot-btn">
              ¿Olvidaste tu contraseña?
            </button>

            {/* ---------------------------------------------
                Si existe errorResponse, lo mostramos
                debajo del formulario
               --------------------------------------------- */}
            {errorResponse && (
              <div className="popular-error-message">{errorResponse}</div>
            )}
          </form>
        </div>
      </section>

      {/* ---------------------------------------------------
          Footer inferior
         --------------------------------------------------- */}
      <footer className="popular-login-footer">
        ©2026 Banco Popular Honduras. Todos los derechos reservados.
      </footer>
    </main>
  );
};

// Exportamos el componente para poder usarlo
// desde src/app/page.tsx
export default LoginPage;