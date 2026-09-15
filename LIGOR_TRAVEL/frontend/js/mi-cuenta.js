"use strict";

// =====================================================
// MI CUENTA - LIGOR TRAVEL
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    iniciarMiCuenta();
});


// =====================================================
// INICIALIZAR
// =====================================================

function iniciarMiCuenta() {

    console.log("Inicializando Mi Cuenta...");

    // -------------------------------------------------
    // VERIFICAR SESIÓN
    // -------------------------------------------------

    const token = obtenerToken();

    if (!token) {

        console.warn("No existe token de sesión.");

        mostrarMensaje(
            "Debes iniciar sesión para acceder a Mi cuenta.",
            "error"
        );

        setTimeout(() => {
            window.location.href = "./index.html";
        }, 1500);

        return;
    }

    console.log("Token encontrado.");

    // -------------------------------------------------
    // CARGAR INFORMACIÓN DEL USUARIO
    // -------------------------------------------------

    cargarMiCuenta();


    // -------------------------------------------------
    // FORMULARIO DATOS PERSONALES
    // -------------------------------------------------

    const formPerfil =
        document.getElementById("formPerfil");

    if (formPerfil) {

        formPerfil.addEventListener(
            "submit",
            guardarPerfil
        );
    }


    // -------------------------------------------------
    // FORMULARIO CONTRASEÑA
    // -------------------------------------------------

    const formPassword =
        document.getElementById("formPassword");

    if (formPassword) {

        formPassword.addEventListener(
            "submit",
            cambiarPassword
        );
    }


    // -------------------------------------------------
    // BOTONES MOSTRAR / OCULTAR CONTRASEÑA
    // -------------------------------------------------

    configurarBotonesPassword();


    // -------------------------------------------------
    // CERRAR SESIÓN
    // -------------------------------------------------

    const botonCerrarSesion =
        document.getElementById(
            "btnCerrarSesionCuenta"
        );

    if (botonCerrarSesion) {

        botonCerrarSesion.addEventListener(
            "click",
            cerrarSesionCuenta
        );
    }
}


// =====================================================
// OBTENER TOKEN
// =====================================================

function obtenerToken() {

    // -------------------------------------------------
    // PRIMERO: función de auth.js
    // -------------------------------------------------

    if (
        typeof obtenerTokenSesion === "function"
    ) {

        try {

            const token =
                obtenerTokenSesion();

            if (token) {
                return token;
            }

        } catch (error) {

            console.warn(
                "No se pudo obtener el token mediante auth.js:",
                error
            );
        }
    }


    // -------------------------------------------------
    // SEGUNDO: sessionStorage
    // -------------------------------------------------

    const tokenSession =
        sessionStorage.getItem(
            "ligor_token"
        );

    if (tokenSession) {
        return tokenSession;
    }


    // -------------------------------------------------
    // TERCERO: localStorage
    // -------------------------------------------------

    const tokenLocal =
        localStorage.getItem(
            "ligor_token"
        );

    if (tokenLocal) {
        return tokenLocal;
    }


    return null;
}


// =====================================================
// OBTENER URL API DE USUARIOS
// =====================================================

function obtenerUrlUsuarios() {

    // -------------------------------------------------
    // USAR CONFIG.JS SI EXISTE
    // -------------------------------------------------

    if (
        typeof obtenerUrlApi === "function" &&
        typeof API_CONFIG !== "undefined" &&
        API_CONFIG.endpoints &&
        API_CONFIG.endpoints.usuarios
    ) {

        return obtenerUrlApi(
            API_CONFIG.endpoints.usuarios
        );
    }


    // -------------------------------------------------
    // URL DIRECTA DEL BACKEND
    // -------------------------------------------------

    return "http://localhost:5232/api/Usuarios";
}


// =====================================================
// CARGAR MI CUENTA
// =====================================================

async function cargarMiCuenta() {

    const token = obtenerToken();

    if (!token) {

        manejarSesionExpirada();

        return;
    }


    const url =
        obtenerUrlUsuarios() +
        "/mi-cuenta";


    console.log(
        "Consultando información de mi cuenta:",
        url
    );


    try {

        const respuesta =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    cache: "no-store"
                }
            );


        console.log(
            "Respuesta Mi Cuenta:",
            respuesta.status
        );


        // -------------------------------------------------
        // SESIÓN EXPIRADA / TOKEN INVÁLIDO
        // -------------------------------------------------

        if (respuesta.status === 401) {

            manejarSesionExpirada();

            return;
        }


        // -------------------------------------------------
        // OTROS ERRORES
        // -------------------------------------------------

        if (!respuesta.ok) {

            const mensaje =
                await obtenerMensajeRespuesta(
                    respuesta
                );

            throw new Error(
                mensaje ||
                "No se pudieron cargar los datos de la cuenta."
            );
        }


        // -------------------------------------------------
        // LEER USUARIO
        // -------------------------------------------------

        const usuario =
            await respuesta.json();


        console.log(
            "Usuario recibido:",
            usuario
        );


        // -------------------------------------------------
        // MOSTRAR DATOS
        // -------------------------------------------------

        mostrarDatosUsuario(
            usuario
        );


    } catch (error) {

        console.error(
            "Error cargando mi cuenta:",
            error
        );


        mostrarMensaje(
            error.message ||
            "No se pudieron cargar los datos de tu cuenta.",
            "error"
        );
    }
}


// =====================================================
// MOSTRAR DATOS DEL USUARIO
// =====================================================

function mostrarDatosUsuario(usuario) {

    if (!usuario) {
        return;
    }


    // -------------------------------------------------
    // CAMPOS
    // -------------------------------------------------

    const nombres =
        document.getElementById(
            "nombres"
        );

    const apellidos =
        document.getElementById(
            "apellidos"
        );

    const correo =
        document.getElementById(
            "correo"
        );

    const telefono =
        document.getElementById(
            "telefono"
        );

    const rol =
        document.getElementById(
            "rolUsuario"
        );


    // -------------------------------------------------
    // NOMBRES
    // -------------------------------------------------

    if (nombres) {

        nombres.value =
            usuario.nombres ?? "";
    }


    // -------------------------------------------------
    // APELLIDOS
    // -------------------------------------------------

    if (apellidos) {

        apellidos.value =
            usuario.apellidos ?? "";
    }


    // -------------------------------------------------
    // CORREO
    // -------------------------------------------------

    if (correo) {

        correo.value =
            usuario.correo ?? "";
    }


    // -------------------------------------------------
    // TELEFONO
    // -------------------------------------------------

    if (telefono) {

        telefono.value =
            usuario.telefono ?? "";
    }


    // -------------------------------------------------
    // ROL
    // -------------------------------------------------

    if (rol) {

        rol.textContent =
            usuario.rol || "Cliente";
    }
}


// =====================================================
// GUARDAR PERFIL
// =====================================================

async function guardarPerfil(event) {

    event.preventDefault();


    const boton =
        document.getElementById(
            "btnGuardarPerfil"
        );


    // -------------------------------------------------
    // OBTENER DATOS
    // -------------------------------------------------

    const nombres =
        document.getElementById(
            "nombres"
        )?.value.trim();


    const apellidos =
        document.getElementById(
            "apellidos"
        )?.value.trim();


    const correo =
        document.getElementById(
            "correo"
        )?.value.trim();


    const telefono =
        document.getElementById(
            "telefono"
        )?.value.trim();


    // -------------------------------------------------
    // VALIDACIONES
    // -------------------------------------------------

    if (!nombres) {

        mostrarMensajePerfil(
            "Los nombres son obligatorios.",
            "error"
        );

        return;
    }


    if (!apellidos) {

        mostrarMensajePerfil(
            "Los apellidos son obligatorios.",
            "error"
        );

        return;
    }


    if (!correo) {

        mostrarMensajePerfil(
            "El correo es obligatorio.",
            "error"
        );

        return;
    }


    // -------------------------------------------------
    // VALIDAR FORMATO CORREO
    // -------------------------------------------------

    const formatoCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!formatoCorreo.test(correo)) {

        mostrarMensajePerfil(
            "Ingresa un correo electrónico válido.",
            "error"
        );

        return;
    }


    // -------------------------------------------------
    // DESACTIVAR BOTÓN
    // -------------------------------------------------

    cambiarEstadoBoton(
        boton,
        true,
        "Guardando..."
    );


    const token =
        obtenerToken();


    if (!token) {

        manejarSesionExpirada();

        return;
    }


    // -------------------------------------------------
    // DATOS
    // -------------------------------------------------

    const datos = {

        nombres: nombres,

        apellidos: apellidos,

        correo: correo,

        telefono: telefono
    };


    console.log(
        "Actualizando perfil..."
    );


    try {

        const respuesta =
            await fetch(
                obtenerUrlUsuarios() +
                "/mi-cuenta",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(
                            datos
                        )
                }
            );


        // -------------------------------------------------
        // SESIÓN EXPIRADA
        // -------------------------------------------------

        if (respuesta.status === 401) {

            manejarSesionExpirada();

            return;
        }


        // -------------------------------------------------
        // RESPUESTA
        // -------------------------------------------------

        const resultado =
            await obtenerRespuestaJson(
                respuesta
            );


        console.log(
            "Respuesta actualización:",
            resultado
        );


        if (!respuesta.ok) {

            throw new Error(
                resultado?.mensaje ||
                "No se pudieron guardar los cambios."
            );
        }


        // -------------------------------------------------
        // ACTUALIZAR FORMULARIO
        // -------------------------------------------------

        if (resultado?.usuario) {

            mostrarDatosUsuario(
                resultado.usuario
            );
        }


        // -------------------------------------------------
        // MENSAJE
        // -------------------------------------------------

        mostrarMensajePerfil(
            resultado?.mensaje ||
            "Tus datos fueron actualizados correctamente.",
            "success"
        );


    } catch (error) {

        console.error(
            "Error actualizando perfil:",
            error
        );


        mostrarMensajePerfil(
            error.message ||
            "Ocurrió un error al actualizar tu cuenta.",
            "error"
        );


    } finally {

        cambiarEstadoBoton(
            boton,
            false,
            "Guardar cambios"
        );
    }
}


// =====================================================
// CAMBIAR CONTRASEÑA
// =====================================================

async function cambiarPassword(event) {

    event.preventDefault();


    const boton =
        document.getElementById(
            "btnCambiarPassword"
        );


    // -------------------------------------------------
    // OBTENER CAMPOS
    // -------------------------------------------------

    const passwordActual =
        document.getElementById(
            "passwordActual"
        )?.value;


    const nuevaPassword =
        document.getElementById(
            "nuevaPassword"
        )?.value;


    const confirmarPassword =
        document.getElementById(
            "confirmarPassword"
        )?.value;


    // -------------------------------------------------
    // VALIDACIONES
    // -------------------------------------------------

    if (!passwordActual) {

        mostrarMensajePassword(
            "Ingresa tu contraseña actual.",
            "error"
        );

        return;
    }


    if (!nuevaPassword) {

        mostrarMensajePassword(
            "Ingresa una nueva contraseña.",
            "error"
        );

        return;
    }


    if (nuevaPassword.length < 6) {

        mostrarMensajePassword(
            "La nueva contraseña debe tener al menos 6 caracteres.",
            "error"
        );

        return;
    }


    if (!confirmarPassword) {

        mostrarMensajePassword(
            "Confirma tu nueva contraseña.",
            "error"
        );

        return;
    }


    if (
        nuevaPassword !==
        confirmarPassword
    ) {

        mostrarMensajePassword(
            "Las nuevas contraseñas no coinciden.",
            "error"
        );

        return;
    }


    // -------------------------------------------------
    // DESACTIVAR BOTÓN
    // -------------------------------------------------

    cambiarEstadoBoton(
        boton,
        true,
        "Cambiando..."
    );


    const token =
        obtenerToken();


    if (!token) {

        manejarSesionExpirada();

        return;
    }


    // -------------------------------------------------
    // DATOS
    // -------------------------------------------------

    const datos = {

        passwordActual:
            passwordActual,

        nuevaPassword:
            nuevaPassword,

        confirmarPassword:
            confirmarPassword
    };


    try {

        const respuesta =
            await fetch(
                obtenerUrlUsuarios() +
                "/cambiar-password",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(
                            datos
                        )
                }
            );


        // -------------------------------------------------
        // SESIÓN EXPIRADA
        // -------------------------------------------------

        if (respuesta.status === 401) {

            manejarSesionExpirada();

            return;
        }


        // -------------------------------------------------
        // RESPUESTA
        // -------------------------------------------------

        const resultado =
            await obtenerRespuestaJson(
                respuesta
            );


        console.log(
            "Respuesta cambio contraseña:",
            resultado
        );


        if (!respuesta.ok) {

            throw new Error(
                resultado?.mensaje ||
                "No se pudo cambiar la contraseña."
            );
        }


        // -------------------------------------------------
        // LIMPIAR FORMULARIO
        // -------------------------------------------------

        document
            .getElementById(
                "formPassword"
            )
            ?.reset();


        // -------------------------------------------------
        // MENSAJE
        // -------------------------------------------------

        mostrarMensajePassword(
            resultado?.mensaje ||
            "Tu contraseña fue cambiada correctamente.",
            "success"
        );


    } catch (error) {

        console.error(
            "Error cambiando contraseña:",
            error
        );


        mostrarMensajePassword(
            error.message ||
            "Ocurrió un error al cambiar la contraseña.",
            "error"
        );


    } finally {

        cambiarEstadoBoton(
            boton,
            false,
            "Cambiar contraseña"
        );
    }
}


// =====================================================
// MOSTRAR / OCULTAR CONTRASEÑAS
// =====================================================

function configurarBotonesPassword() {

    document
        .querySelectorAll(
            ".password-toggle"
        )
        .forEach(
            (boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        const id =
                            boton.dataset.target;


                        const input =
                            document.getElementById(
                                id
                            );


                        if (!input) {
                            return;
                        }


                        const icono =
                            boton.querySelector(
                                "i"
                            );


                        // -------------------------------------------------
                        // MOSTRAR
                        // -------------------------------------------------

                        if (
                            input.type ===
                            "password"
                        ) {

                            input.type =
                                "text";


                            icono?.classList.remove(
                                "fa-eye"
                            );

                            icono?.classList.remove(
                                "fa-eye-slash"
                            );

                            icono?.classList.add(
                                "fa-eye-slash"
                            );


                            boton.setAttribute(
                                "aria-label",
                                "Ocultar contraseña"
                            );


                        }

                        // -------------------------------------------------
                        // OCULTAR
                        // -------------------------------------------------

                        else {

                            input.type =
                                "password";


                            icono?.classList.remove(
                                "fa-eye-slash"
                            );

                            icono?.classList.add(
                                "fa-eye"
                            );


                            boton.setAttribute(
                                "aria-label",
                                "Mostrar contraseña"
                            );
                        }
                    }
                );
            }
        );
}


// =====================================================
// CERRAR SESIÓN
// =====================================================

function cerrarSesionCuenta() {

    const confirmar =
        window.confirm(
            "¿Estás seguro de que deseas cerrar sesión?"
        );


    if (!confirmar) {
        return;
    }


    // -------------------------------------------------
    // ELIMINAR TOKEN
    // -------------------------------------------------

    localStorage.removeItem(
        "ligor_token"
    );

    sessionStorage.removeItem(
        "ligor_token"
    );


    // -------------------------------------------------
    // ELIMINAR INFORMACIÓN DE USUARIO
    // -------------------------------------------------

    sessionStorage.removeItem(
        "ligor_usuario"
    );


    // -------------------------------------------------
    // USAR LOGOUT DE AUTH.JS SI EXISTE
    // -------------------------------------------------

    if (
        typeof cerrarSesion ===
        "function"
    ) {

        try {

            cerrarSesion();

        } catch (error) {

            console.warn(
                "No se pudo ejecutar cerrarSesion():",
                error
            );
        }
    }


    // -------------------------------------------------
    // REDIRECCIÓN
    // -------------------------------------------------

    window.location.href =
        "./index.html";
}


// =====================================================
// SESIÓN EXPIRADA
// =====================================================

function manejarSesionExpirada() {

    console.warn(
        "La sesión ha expirado."
    );


    localStorage.removeItem(
        "ligor_token"
    );

    sessionStorage.removeItem(
        "ligor_token"
    );

    sessionStorage.removeItem(
        "ligor_usuario"
    );


    mostrarMensaje(
        "Tu sesión ha expirado. Inicia sesión nuevamente.",
        "error"
    );


    setTimeout(() => {

        window.location.href =
            "./index.html";

    }, 1500);
}


// =====================================================
// MENSAJE PERFIL
// =====================================================

function mostrarMensajePerfil(
    mensaje,
    tipo = "success"
) {

    const elemento =
        document.getElementById(
            "mensajePerfil"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.className =
        "account-message " +
        (
            tipo === "error"
                ? "error"
                : "success"
        );


    elemento.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// =====================================================
// MENSAJE PASSWORD
// =====================================================

function mostrarMensajePassword(
    mensaje,
    tipo = "success"
) {

    const elemento =
        document.getElementById(
            "mensajePassword"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.className =
        "account-message " +
        (
            tipo === "error"
                ? "error"
                : "success"
        );


    elemento.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// =====================================================
// MENSAJE GENERAL
// =====================================================

function mostrarMensaje(
    mensaje,
    tipo = "success"
) {

    console.log(
        `[${tipo}] ${mensaje}`
    );


    window.alert(
        mensaje
    );
}


// =====================================================
// CAMBIAR ESTADO DEL BOTÓN
// =====================================================

function cambiarEstadoBoton(
    boton,
    cargando,
    texto
) {

    if (!boton) {
        return;
    }


    if (cargando) {

        boton.disabled =
            true;


        const icono =
            boton.querySelector(
                "i"
            );


        if (icono) {

            icono.className =
                "fa-solid fa-spinner fa-spin";
        }


        const span =
            boton.querySelector(
                "span"
            );


        if (span) {

            span.textContent =
                texto;

        } else {

            const textoNodo =
                Array.from(
                    boton.childNodes
                ).find(
                    (nodo) =>
                        nodo.nodeType ===
                        Node.TEXT_NODE
                );


            if (textoNodo) {

                textoNodo.textContent =
                    ` ${texto} `;
            }
        }


    } else {

        boton.disabled =
            false;


        const icono =
            boton.querySelector(
                "i"
            );


        // -------------------------------------------------
        // BOTÓN GUARDAR
        // -------------------------------------------------

        if (
            boton.id ===
            "btnGuardarPerfil"
        ) {

            if (icono) {

                icono.className =
                    "fa-solid fa-floppy-disk";
            }
        }


        // -------------------------------------------------
        // BOTÓN CONTRASEÑA
        // -------------------------------------------------

        else if (
            boton.id ===
            "btnCambiarPassword"
        ) {

            if (icono) {

                icono.className =
                    "fa-solid fa-key";
            }
        }


        const span =
            boton.querySelector(
                "span"
            );


        if (span) {

            span.textContent =
                texto;
        }
    }
}


// =====================================================
// OBTENER JSON DE RESPUESTA
// =====================================================

async function obtenerRespuestaJson(
    respuesta
) {

    const texto =
        await respuesta.text();


    if (!texto) {
        return {};
    }


    try {

        return JSON.parse(
            texto
        );

    } catch (error) {

        console.warn(
            "La API no devolvió JSON válido.",
            error
        );


        return {};
    }
}


// =====================================================
// OBTENER MENSAJE DE ERROR
// =====================================================

async function obtenerMensajeRespuesta(
    respuesta
) {

    const resultado =
        await obtenerRespuestaJson(
            respuesta
        );


    return (
        resultado?.mensaje ||
        resultado?.title ||
        ""
    );
}