"use strict";

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    configurarModalesAutenticacion();
    configurarFormularioLogin();
    configurarFormularioRegistro();
    configurarMostrarPasswords();
    configurarGeneradorPassword();
    configurarTelefono();
    configurarBotonesSociales();
    configurarMenuUsuario();
    restaurarSesion();
});


// =====================================================
// MODALES DE AUTENTICACIÓN
// =====================================================

function configurarModalesAutenticacion() {
    const modalLogin =
        document.getElementById("modalLogin");

    const modalRegistro =
        document.getElementById("modalRegistro");

    const botonCerrarLogin =
        document.getElementById("btnCerrarLogin");

    const botonCerrarRegistro =
        document.getElementById("btnCerrarRegistro");

    const botonIrRegistro =
        document.getElementById("btnIrRegistro");

    const botonIrLogin =
        document.getElementById("btnIrLogin");


    botonCerrarLogin?.addEventListener(
        "click",
        () => cerrarModalAuth(modalLogin)
    );


    botonCerrarRegistro?.addEventListener(
        "click",
        () => cerrarModalAuth(modalRegistro)
    );


    botonIrRegistro?.addEventListener(
        "click",
        () => {
            cerrarModalAuth(modalLogin);
            abrirModalAuth(modalRegistro);
        }
    );


    botonIrLogin?.addEventListener(
        "click",
        () => {
            cerrarModalAuth(modalRegistro);
            abrirModalAuth(modalLogin);
        }
    );


    modalLogin?.addEventListener(
        "click",
        (event) => {
            if (event.target === modalLogin) {
                cerrarModalAuth(modalLogin);
            }
        }
    );


    modalRegistro?.addEventListener(
        "click",
        (event) => {
            if (event.target === modalRegistro) {
                cerrarModalAuth(modalRegistro);
            }
        }
    );


    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key !== "Escape") {
                return;
            }

            if (
                modalLogin?.classList.contains("open")
            ) {
                cerrarModalAuth(modalLogin);
            }

            if (
                modalRegistro?.classList.contains("open")
            ) {
                cerrarModalAuth(modalRegistro);
            }

            cerrarMenuUsuario();
        }
    );
}


function abrirModalAuth(modal) {
    if (!modal) {
        return;
    }

    modal.classList.add("open");

    document.body.classList.add(
        "no-scroll"
    );

    setTimeout(() => {
        const primerInput =
            modal.querySelector("input");

        primerInput?.focus();
    }, 100);
}


function cerrarModalAuth(modal) {
    if (!modal) {
        return;
    }

    modal.classList.remove("open");

    const existeOtroModalAbierto =
        document.querySelector(
            ".modal-overlay.open, .ia-module.open"
        );

    if (!existeOtroModalAbierto) {
        document.body.classList.remove(
            "no-scroll"
        );
    }
}


// =====================================================
// LOGIN
// =====================================================

function configurarFormularioLogin() {
    const formulario =
        document.getElementById(
            "formLogin"
        );

    if (!formulario) {
        return;
    }

    formulario.addEventListener(
        "submit",
        iniciarSesion
    );
}


async function iniciarSesion(event) {
    event.preventDefault();

    const correoInput =
        document.getElementById(
            "loginCorreo"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    const recordarInput =
        document.getElementById(
            "loginRecordarme"
        );

    const boton =
        document.getElementById(
            "btnIniciarSesion"
        );


    const correo =
        correoInput?.value
            .trim()
            .toLowerCase() || "";

    const password =
        passwordInput?.value || "";


    limpiarErroresLogin();


    let formularioValido = true;


    if (!correo) {
        mostrarErrorCampo(
            "errorLoginCorreo",
            "Ingresa tu correo electrónico."
        );

        formularioValido = false;
    }
    else if (!validarCorreo(correo)) {
        mostrarErrorCampo(
            "errorLoginCorreo",
            "Ingresa un correo electrónico válido."
        );

        formularioValido = false;
    }


    if (!password) {
        mostrarErrorCampo(
            "errorLoginPassword",
            "Ingresa tu contraseña."
        );

        formularioValido = false;
    }


    if (!formularioValido) {
        return;
    }


    cambiarEstadoBoton(
        boton,
        true,
        "Ingresando..."
    );


    mostrarMensajeAuth(
        "mensajeLogin",
        "Verificando tus credenciales...",
        "info"
    );


    try {
        const urlLogin =
            AUTH_ENDPOINTS.login;


        console.log(
            "Enviando inicio de sesión a:",
            urlLogin
        );


        const respuesta =
            await fetch(
                urlLogin,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            correo,
                            password
                        })
                }
            );


        const resultado =
            await leerRespuestaApi(
                respuesta
            );


        console.log(
            "Respuesta login:",
            respuesta.status,
            resultado
        );


        if (!respuesta.ok) {
            const mensaje =
                resultado?.mensaje ||
                resultado?.message ||
                resultado?.error ||
                obtenerMensajeEstado(
                    respuesta.status
                );

            throw new Error(mensaje);
        }


        if (!resultado?.token) {
            throw new Error(
                "El servidor no devolvió el token de acceso."
            );
        }


        if (!resultado?.usuario) {
            throw new Error(
                "El servidor no devolvió los datos del usuario."
            );
        }


        guardarSesion(
            resultado.token,
            resultado.usuario,
            Boolean(
                recordarInput?.checked
            )
        );


        actualizarInterfazUsuario(
            resultado.usuario
        );


        mostrarMensajeAuth(
            "mensajeLogin",
            `Bienvenido, ${
                resultado.usuario.nombres ||
                "usuario"
            }.`,
            "success"
        );


        setTimeout(() => {
            document
                .getElementById(
                    "formLogin"
                )
                ?.reset();


            cerrarModalAuth(
                document.getElementById(
                    "modalLogin"
                )
            );


            redirigirSegunRol(
                resultado.usuario
            );

        }, 700);

    }
    catch (error) {
        console.error(
            "Error al iniciar sesión:",
            error
        );


        mostrarMensajeAuth(
            "mensajeLogin",
            error.message ||
                "No se pudo iniciar sesión.",
            "error"
        );

    }
    finally {
        cambiarEstadoBoton(
            boton,
            false,
            "Iniciar sesión"
        );
    }
}


// =====================================================
// REGISTRO
// =====================================================

function configurarFormularioRegistro() {
    const formulario =
        document.getElementById(
            "formRegistro"
        );

    if (!formulario) {
        return;
    }


    formulario.addEventListener(
        "submit",
        registrarUsuario
    );


    const password =
        document.getElementById(
            "registroPassword"
        );


    password?.addEventListener(
        "input",
        actualizarSeguridadPassword
    );
}


async function registrarUsuario(event) {
    event.preventDefault();


    const nombres =
        obtenerValor(
            "registroNombres"
        );

    const apellidos =
        obtenerValor(
            "registroApellidos"
        );

    const correo =
        obtenerValor(
            "registroCorreo"
        ).toLowerCase();

    const telefono =
        obtenerTelefonoCompleto();

    const password =
        obtenerValor(
            "registroPassword",
            false
        );

    const confirmarPassword =
        obtenerValor(
            "registroConfirmarPassword",
            false
        );

    const terminos =
        document.getElementById(
            "registroTerminos"
        )?.checked;

    const boton =
        document.getElementById(
            "btnCrearCuenta"
        );


    limpiarErroresRegistro();


    let formularioValido = true;


    if (!validarNombre(nombres)) {
        mostrarErrorCampo(
            "errorRegistroNombres",
            "Ingresa nombres válidos."
        );

        formularioValido = false;
    }


    if (!validarNombre(apellidos)) {
        mostrarErrorCampo(
            "errorRegistroApellidos",
            "Ingresa apellidos válidos."
        );

        formularioValido = false;
    }


    if (!validarCorreo(correo)) {
        mostrarErrorCampo(
            "errorRegistroCorreo",
            "Ingresa un correo electrónico válido."
        );

        formularioValido = false;
    }


    if (
        !validarTelefonoSeleccionado()
    ) {
        formularioValido = false;
    }


    if (
        !validarPasswordSegura(
            password
        )
    ) {
        mostrarErrorCampo(
            "errorRegistroPassword",
            "La contraseña debe cumplir todos los requisitos."
        );

        formularioValido = false;
    }


    if (
        password !==
        confirmarPassword
    ) {
        mostrarErrorCampo(
            "errorConfirmarPassword",
            "Las contraseñas no coinciden."
        );

        formularioValido = false;
    }


    if (!terminos) {
        mostrarErrorCampo(
            "errorRegistroTerminos",
            "Debes aceptar los términos y condiciones."
        );

        formularioValido = false;
    }


    if (!formularioValido) {
        return;
    }


    cambiarEstadoBoton(
        boton,
        true,
        "Creando cuenta..."
    );


    mostrarMensajeAuth(
        "mensajeRegistro",
        "Creando tu cuenta...",
        "info"
    );


    try {
        const respuesta =
            await fetch(
                AUTH_ENDPOINTS.registro,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            nombres,
                            apellidos,
                            correo,
                            telefono,
                            password,

                            // El backend debe decidir
                            // finalmente el rol público.
                            rol: "Cliente"
                        })
                }
            );


        const resultado =
            await leerRespuestaApi(
                respuesta
            );


        if (!respuesta.ok) {
            const mensaje =
                resultado?.mensaje ||
                resultado?.message ||
                resultado?.error ||
                `No se pudo crear la cuenta. Código ${respuesta.status}.`;

            throw new Error(mensaje);
        }


        mostrarMensajeAuth(
            "mensajeRegistro",
            "Cuenta creada correctamente. Ahora puedes iniciar sesión.",
            "success"
        );


        setTimeout(() => {
            document
                .getElementById(
                    "formRegistro"
                )
                ?.reset();


            cerrarModalAuth(
                document.getElementById(
                    "modalRegistro"
                )
            );


            abrirModalAuth(
                document.getElementById(
                    "modalLogin"
                )
            );


            const correoLogin =
                document.getElementById(
                    "loginCorreo"
                );


            if (correoLogin) {
                correoLogin.value =
                    correo;
            }

        }, 1000);

    }
    catch (error) {
        console.error(
            "Error al registrar usuario:",
            error
        );


        mostrarMensajeAuth(
            "mensajeRegistro",
            error.message ||
                "No se pudo crear la cuenta.",
            "error"
        );

    }
    finally {
        cambiarEstadoBoton(
            boton,
            false,
            "Crear mi cuenta"
        );
    }
}


// =====================================================
// SESIÓN
// =====================================================

function guardarSesion(
    token,
    usuario,
    recordar
) {
    limpiarDatosSesion();


    const almacenamiento =
        recordar
            ? localStorage
            : sessionStorage;


    almacenamiento.setItem(
        "ligor_token",
        token
    );


    almacenamiento.setItem(
        "ligor_usuario",
        JSON.stringify(usuario)
    );
}


function limpiarDatosSesion() {
    localStorage.removeItem(
        "ligor_token"
    );

    localStorage.removeItem(
        "ligor_usuario"
    );

    sessionStorage.removeItem(
        "ligor_token"
    );

    sessionStorage.removeItem(
        "ligor_usuario"
    );
}


function obtenerAlmacenamientoSesion() {
    if (
        localStorage.getItem(
            "ligor_token"
        )
    ) {
        return localStorage;
    }


    if (
        sessionStorage.getItem(
            "ligor_token"
        )
    ) {
        return sessionStorage;
    }


    return null;
}


function obtenerTokenSesion() {
    const almacenamiento =
        obtenerAlmacenamientoSesion();


    return almacenamiento?.getItem(
        "ligor_token"
    ) || null;
}


function obtenerUsuarioSesion() {
    const almacenamiento =
        obtenerAlmacenamientoSesion();


    if (!almacenamiento) {
        return null;
    }


    try {
        const usuario =
            almacenamiento.getItem(
                "ligor_usuario"
            );


        return usuario
            ? JSON.parse(usuario)
            : null;

    }
    catch (error) {
        console.error(
            "No se pudo leer el usuario:",
            error
        );

        return null;
    }
}


async function restaurarSesion() {
    const token = obtenerTokenSesion();
    const usuario = obtenerUsuarioSesion();

    if (!token || !usuario) {
        restaurarInterfazSinSesion();
        return;
    }

    // Verificar que el token siga siendo válido y que la cuenta exista.
    // Esto evita que el frontend conserve una sesión fantasma después de
    // eliminar/desactivar una cuenta o cambiar la configuración de JWT.
    try {
        const respuesta = await fetch(
            obtenerUrlApi('/Usuarios/mi-cuenta'),
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (respuesta.status === 401 || respuesta.status === 403 || respuesta.status === 404) {
            limpiarDatosSesion();
            restaurarInterfazSinSesion();
            return;
        }

        if (!respuesta.ok) {
            // Si el servidor está temporalmente fuera de servicio, no
            // destruimos la sesión local del usuario.
            actualizarInterfazUsuario(usuario);
            return;
        }

        const cuenta = await leerRespuestaApi(respuesta);
        if (cuenta?.id) {
            const almacenamiento = obtenerAlmacenamientoSesion();
            almacenamiento?.setItem('ligor_usuario', JSON.stringify(cuenta));
            actualizarInterfazUsuario(cuenta);
        } else {
            actualizarInterfazUsuario(usuario);
        }
    } catch (error) {
        console.warn('No se pudo validar la sesión con la API:', error);
        actualizarInterfazUsuario(usuario);
    }
}


// =====================================================
// ACTUALIZAR INTERFAZ DEL USUARIO
// =====================================================

function actualizarInterfazUsuario(usuario) {
    if (!usuario) {
        return;
    }


    const botonLogin =
        document.getElementById(
            "btnLogin"
        );


    if (botonLogin) {
        const nombres =
            escaparHtmlAuth(
                usuario.nombres ||
                "Usuario"
            );


        botonLogin.innerHTML = `
            <i class="fa-solid fa-circle-user"></i>

            <span>
                ${nombres}
            </span>

            <i class="fa-solid fa-chevron-down"></i>
        `;


        botonLogin.classList.add(
            "usuario-autenticado"
        );


        botonLogin.dataset.usuarioId =
            String(
                usuario.id || ""
            );


        botonLogin.dataset.rol =
            String(
                usuario.rol || ""
            );
    }


    const nombreCompleto = [
        usuario.nombres,
        usuario.apellidos
    ]
        .filter(Boolean)
        .join(" ");


    const nombreMenu =
        document.getElementById(
            "nombreMenuUsuario"
        );

    const correoMenu =
        document.getElementById(
            "correoMenuUsuario"
        );

    const rolMenu =
        document.getElementById(
            "rolMenuUsuario"
        );


    if (nombreMenu) {
        nombreMenu.textContent =
            nombreCompleto ||
            "Usuario";
    }


    if (correoMenu) {
        correoMenu.textContent =
            usuario.correo || "";
    }


    if (rolMenu) {
        rolMenu.textContent =
            usuario.rol ||
            "Cliente";
    }


    // =================================================
    // OPCIONES DE ADMINISTRADOR
    // =================================================

    const botonAdministrarPaquetes =
        document.getElementById(
            "btnAdministrarPaquetes"
        );


    const botonAdministrarSitio =
        document.getElementById(
            "btnAdministrarSitio"
        );


    const administrador =
        esAdministrador(usuario);


    if (botonAdministrarPaquetes) {
        botonAdministrarPaquetes.hidden =
            !administrador;
    }


    if (botonAdministrarSitio) {
        botonAdministrarSitio.hidden =
            !administrador;
    }


    // Actualiza automáticamente la navegación principal
    // según el rol del usuario que inició sesión.
    actualizarMenuNavegacionPorRol(usuario);
}


// =====================================================
// NAVEGACIÓN PRINCIPAL SEGÚN ROL
// =====================================================


function marcarEnlaceAdminActivo(navigation) {
    const actual = (window.location.pathname.split("/").pop() || "").toLowerCase();
    if (!actual || actual === "index.html") return;
    navigation.querySelectorAll(".nav-link").forEach(enlace => {
        const destino = (enlace.getAttribute("href") || "").split("#")[0].split("/").pop().toLowerCase();
        enlace.classList.toggle("active", destino === actual);
    });
}


function actualizarMenuNavegacionPorRol(usuario) {
    const navigation = document.getElementById("navigation");
    if (!navigation) return;

    // Las rutas se calculan según la página actual para que el mismo
    // encabezado funcione en Inicio, Detalle de paquete y páginas admin.
    const enCarpetaAdmin = window.location.pathname.toLowerCase().includes("/admin/");
    const baseFrontend = enCarpetaAdmin ? "../" : "./";
    const inicio = `${baseFrontend}index.html#inicio`;
    const destinos = `${baseFrontend}index.html#destinos`;
    const experiencias = `${baseFrontend}index.html#experiencias`;
    const paquetesPublicos = `${baseFrontend}index.html#paquetes`;
    const nosotros = `${baseFrontend}index.html#nosotros`;
    const contacto = `${baseFrontend}index.html#contacto`;
    const admin = `${baseFrontend}admin/`;

    const rol = String(usuario?.rol || "").trim().toLowerCase();

    // ADMINISTRADOR: conserva exactamente sus accesos principales.
    if (rol === "administrador") {
        navigation.innerHTML = `
            <a href="${inicio}" class="nav-link active">Inicio</a>
            <a href="${admin}dashboard.html" class="nav-link">Dashboard</a>
            <a href="${admin}paquetes.html" class="nav-link">Paquetes</a>
            <a href="${admin}reservas.html" class="nav-link">Reservas</a>
            <a href="${admin}usuarios.html" class="nav-link">Usuarios</a>
            <a href="${admin}opiniones.html" class="nav-link">Opiniones</a>
            <a href="${admin}sitio.html" class="nav-link">Editar sitio</a>
        `;
        marcarEnlaceAdminActivo(navigation);
        configurarMenuNavegacionDinamico();
        return;
    }

    // VENDEDOR: mantiene su navegación comercial también en el detalle.
    if (rol === "vendedor") {
        navigation.innerHTML = `
            <a href="${inicio}" class="nav-link active">Inicio</a>
            <a href="${destinos}" class="nav-link">Destinos</a>
            <a href="${experiencias}" class="nav-link">Experiencias</a>
            <a href="${paquetesPublicos}" class="nav-link">Paquetes</a>
            <a href="${contacto}" class="nav-link">Contacto</a>
        `;
        configurarMenuNavegacionDinamico();
        return;
    }

    // CLIENTE / visitante: mismo encabezado del sitio principal.
    navigation.innerHTML = `
        <a href="${inicio}" class="nav-link active">Inicio</a>
        <a href="${destinos}" class="nav-link">Destinos</a>
        <a href="${experiencias}" class="nav-link">Experiencias</a>
        <a href="${paquetesPublicos}" class="nav-link">Paquetes</a>
        <a href="${nosotros}" class="nav-link">Nosotros</a>
        <a href="${contacto}" class="nav-link">Contacto</a>
    `;
    configurarMenuNavegacionDinamico();
}

function restaurarMenuNavegacionPublico() {
    actualizarMenuNavegacionPorRol(null);
}

function configurarMenuNavegacionDinamico() {
    const navigation =
        document.getElementById(
            "navigation"
        );

    const botonMenu =
        document.getElementById(
            "btnMenu"
        );

    if (!navigation) {
        return;
    }

    const enlaces =
        navigation.querySelectorAll(
            ".nav-link"
        );

    enlaces.forEach((enlace) => {
        enlace.addEventListener(
            "click",
            () => {
                // Cerrar el menú responsive.
                navigation.classList.remove(
                    "open"
                );

                if (botonMenu) {
                    botonMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    const icono =
                        botonMenu.querySelector(
                            "i"
                        );

                    if (icono) {
                        icono.classList.add(
                            "fa-bars"
                        );

                        icono.classList.remove(
                            "fa-xmark"
                        );
                    }
                }

                enlaces.forEach((item) => {
                    item.classList.remove(
                        "active"
                    );
                });

                enlace.classList.add(
                    "active"
                );
            }
        );
    });
}


// =====================================================
// ROL
// =====================================================

function esAdministrador(usuario) {
    return String(
        usuario?.rol || ""
    )
        .trim()
        .toLowerCase() ===
        "administrador";
}


function esVendedor(usuario) {
    return String(
        usuario?.rol || ""
    )
        .trim()
        .toLowerCase() ===
        "vendedor";
}


function esCliente(usuario) {
    return String(
        usuario?.rol || ""
    )
        .trim()
        .toLowerCase() ===
        "cliente";
}


// =====================================================
// REDIRECCIÓN DESPUÉS DEL LOGIN
// =====================================================

function redirigirSegunRol(usuario) {
    const rol =
        String(
            usuario?.rol || ""
        )
            .trim()
            .toLowerCase();


    if (rol === "administrador") {
        console.log(
            "Inicio de sesión como Administrador."
        );

        // Permanecemos en la página principal.
        // El administrador utiliza su menú.

        return;
    }


    if (rol === "vendedor") {
        console.log(
            "Inicio de sesión como Vendedor."
        );

        return;
    }


    console.log(
        "Inicio de sesión como Cliente."
    );
}


// =====================================================
// MENÚ DEL USUARIO
// =====================================================

function configurarMenuUsuario() {
    const botonLogin =
        document.getElementById(
            "btnLogin"
        );

    const menuUsuario =
        document.getElementById(
            "menuUsuario"
        );

    const botonMiCuenta =
        document.getElementById(
            "btnMiCuenta"
        );

    const botonAdministrarPaquetes =
        document.getElementById(
            "btnAdministrarPaquetes"
        );

    // ESTE ERA UNO DE LOS QUE FALTABAN
    const botonAdministrarSitio =
        document.getElementById(
            "btnAdministrarSitio"
        );

    const botonCambiarCuenta =
        document.getElementById(
            "btnCambiarCuenta"
        );

    const botonCerrarSesion =
        document.getElementById(
            "btnCerrarSesion"
        );


    // -------------------------------------------------
    // BOTÓN DEL USUARIO
    // -------------------------------------------------

    botonLogin?.addEventListener(
        "click",
        (event) => {
            const usuario =
                obtenerUsuarioSesion();


            /*
             * Si NO hay usuario dejamos que app.js
             * abra el modal del login.
             */
            if (!usuario) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();

            alternarMenuUsuario();
        }
    );


    // -------------------------------------------------
    // EVITAR CIERRE AL HACER CLIC DENTRO
    // -------------------------------------------------

    menuUsuario?.addEventListener(
        "click",
        (event) => {
            event.stopPropagation();
        }
    );


    // -------------------------------------------------
    // MI CUENTA
    // -------------------------------------------------

    botonMiCuenta?.addEventListener(
        "click",
        () => {

            cerrarMenuUsuario();

            const usuario =
                obtenerUsuarioSesion();

            if (!usuario) {
                return;
            }

            // Abrir página de edición de cuenta
            window.location.href = "./mi-cuenta.html";
        }
    );


    // -------------------------------------------------
    // ADMINISTRAR PAQUETES
    // -------------------------------------------------

    botonAdministrarPaquetes
        ?.addEventListener(
            "click",
            () => {
                cerrarMenuUsuario();


                const usuario =
                    obtenerUsuarioSesion();


                if (!usuario) {
                    return;
                }


                if (
                    !esAdministrador(
                        usuario
                    )
                ) {
                    window.alert(
                        "No tienes permisos para administrar paquetes."
                    );

                    return;
                }


                window.location.href =
                    "./admin/paquetes.html";
            }
        );


    // -------------------------------------------------
    // EDITAR PÁGINA PRINCIPAL
    // ESTA PARTE FALTABA EN TU ARCHIVO
    // -------------------------------------------------

    botonAdministrarSitio
        ?.addEventListener(
            "click",
            () => {
                cerrarMenuUsuario();


                const usuario =
                    obtenerUsuarioSesion();


                if (!usuario) {
                    return;
                }


                if (
                    !esAdministrador(
                        usuario
                    )
                ) {
                    window.alert(
                        "No tienes permisos para modificar la página principal."
                    );

                    return;
                }


                console.log(
                    "Abriendo editor de la página principal..."
                );


                window.location.href =
                    "./admin/sitio.html";
            }
        );


    // -------------------------------------------------
    // CAMBIAR CUENTA
    // -------------------------------------------------

    botonCambiarCuenta
        ?.addEventListener(
            "click",
            cambiarCuenta
        );


    // -------------------------------------------------
    // CERRAR SESIÓN
    // -------------------------------------------------

    botonCerrarSesion
        ?.addEventListener(
            "click",
            solicitarCerrarSesion
        );


    // -------------------------------------------------
    // CERRAR HACIENDO CLIC FUERA
    // -------------------------------------------------

    document.addEventListener(
        "click",
        (event) => {
            if (
                !menuUsuario
                    ?.classList
                    .contains("open")
            ) {
                return;
            }


            const contenedor =
                document.querySelector(
                    ".user-session-container"
                );


            if (
                !contenedor?.contains(
                    event.target
                )
            ) {
                cerrarMenuUsuario();
            }
        }
    );
}


// =====================================================
// ABRIR / CERRAR MENÚ
// =====================================================

function alternarMenuUsuario() {
    const menu =
        document.getElementById(
            "menuUsuario"
        );

    const boton =
        document.getElementById(
            "btnLogin"
        );


    if (!menu || !boton) {
        return;
    }


    const abrir =
        !menu.classList.contains(
            "open"
        );


    menu.classList.toggle(
        "open",
        abrir
    );


    boton.classList.toggle(
        "menu-open",
        abrir
    );


    menu.setAttribute(
        "aria-hidden",
        String(!abrir)
    );


    boton.setAttribute(
        "aria-expanded",
        String(abrir)
    );
}


function cerrarMenuUsuario() {
    const menu =
        document.getElementById(
            "menuUsuario"
        );

    const boton =
        document.getElementById(
            "btnLogin"
        );


    menu?.classList.remove(
        "open"
    );


    boton?.classList.remove(
        "menu-open"
    );


    menu?.setAttribute(
        "aria-hidden",
        "true"
    );


    boton?.setAttribute(
        "aria-expanded",
        "false"
    );
}


// =====================================================
// CAMBIAR DE CUENTA
// =====================================================

function cambiarCuenta() {
    cerrarMenuUsuario();


    const confirmar =
        window.confirm(
            "¿Deseas cerrar la sesión actual e ingresar con otra cuenta?"
        );


    if (!confirmar) {
        return;
    }


    limpiarDatosSesion();

    restaurarInterfazSinSesion();


    const modalLogin =
        document.getElementById(
            "modalLogin"
        );


    abrirModalAuth(
        modalLogin
    );


    const formulario =
        document.getElementById(
            "formLogin"
        );


    formulario?.reset();

    limpiarErroresLogin();


    setTimeout(() => {
        document
            .getElementById(
                "loginCorreo"
            )
            ?.focus();

    }, 150);
}


// =====================================================
// CERRAR SESIÓN
// =====================================================

function solicitarCerrarSesion() {
    cerrarMenuUsuario();


    const confirmar =
        window.confirm(
            "¿Estás seguro de que deseas cerrar sesión?"
        );


    if (!confirmar) {
        return;
    }


    cerrarSesion();
}


function cerrarSesion() {
    limpiarDatosSesion();

    restaurarInterfazSinSesion();

    cerrarMenuUsuario();


    window.alert(
        "Sesión cerrada correctamente."
    );
}


// =====================================================
// INTERFAZ SIN SESIÓN
// =====================================================

function restaurarInterfazSinSesion() {
    const botonLogin =
        document.getElementById(
            "btnLogin"
        );


    if (botonLogin) {
        botonLogin.innerHTML = `
            <i class="fa-regular fa-user"></i>
            <span>Iniciar sesión</span>
        `;


        botonLogin.classList.remove(
            "usuario-autenticado",
            "menu-open"
        );


        botonLogin.setAttribute(
            "aria-expanded",
            "false"
        );


        delete botonLogin.dataset.usuarioId;
        delete botonLogin.dataset.rol;
    }


    const menu =
        document.getElementById(
            "menuUsuario"
        );


    menu?.classList.remove(
        "open"
    );


    menu?.setAttribute(
        "aria-hidden",
        "true"
    );


    const nombre =
        document.getElementById(
            "nombreMenuUsuario"
        );

    const correo =
        document.getElementById(
            "correoMenuUsuario"
        );

    const rol =
        document.getElementById(
            "rolMenuUsuario"
        );


    if (nombre) {
        nombre.textContent =
            "Usuario";
    }


    if (correo) {
        correo.textContent =
            "correo@ejemplo.com";
    }


    if (rol) {
        rol.textContent =
            "Cliente";
    }


    // Ocultamos TODAS las funciones de administrador.

    const botonAdministrarPaquetes =
        document.getElementById(
            "btnAdministrarPaquetes"
        );

    const botonAdministrarSitio =
        document.getElementById(
            "btnAdministrarSitio"
        );


    if (botonAdministrarPaquetes) {
        botonAdministrarPaquetes.hidden =
            true;
    }


    if (botonAdministrarSitio) {
        botonAdministrarSitio.hidden =
            true;
    }


    // Al cerrar sesión recuperamos el menú público original.
    restaurarMenuNavegacionPublico();


    cerrarMenuUsuario();
}


// =====================================================
// MOSTRAR / OCULTAR CONTRASEÑAS
// =====================================================

function configurarMostrarPasswords() {
    document
        .querySelectorAll(
            ".password-toggle"
        )
        .forEach((boton) => {

            boton.addEventListener(
                "click",
                () => {
                    const idInput =
                        boton.dataset
                            .passwordTarget;


                    const input =
                        document.getElementById(
                            idInput
                        );


                    if (!input) {
                        return;
                    }


                    const mostrar =
                        input.type ===
                        "password";


                    input.type =
                        mostrar
                            ? "text"
                            : "password";


                    const icono =
                        boton.querySelector(
                            "i"
                        );


                    icono?.classList.toggle(
                        "fa-eye",
                        !mostrar
                    );


                    icono?.classList.toggle(
                        "fa-eye-slash",
                        mostrar
                    );


                    boton.setAttribute(
                        "aria-label",
                        mostrar
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                    );
                }
            );

        });
}


// =====================================================
// GENERADOR DE CONTRASEÑA
// =====================================================

function configurarGeneradorPassword() {
    const boton =
        document.getElementById(
            "btnGenerarPassword"
        );


    boton?.addEventListener(
        "click",
        () => {
            const password =
                generarPasswordSegura();


            const inputPassword =
                document.getElementById(
                    "registroPassword"
                );


            const inputConfirmacion =
                document.getElementById(
                    "registroConfirmarPassword"
                );


            if (inputPassword) {
                inputPassword.value =
                    password;
            }


            if (inputConfirmacion) {
                inputConfirmacion.value =
                    password;
            }


            actualizarSeguridadPassword();


            mostrarMensajeAuth(
                "mensajeRegistro",
                "Se generó una contraseña segura.",
                "success"
            );
        }
    );
}


function generarPasswordSegura() {
    const mayusculas =
        "ABCDEFGHJKLMNPQRSTUVWXYZ";

    const minusculas =
        "abcdefghijkmnopqrstuvwxyz";

    const numeros =
        "23456789";

    const simbolos =
        "@#$%&*!?";


    const todos =
        mayusculas +
        minusculas +
        numeros +
        simbolos;


    let password =
        obtenerCaracterAleatorio(
            mayusculas
        ) +
        obtenerCaracterAleatorio(
            minusculas
        ) +
        obtenerCaracterAleatorio(
            numeros
        ) +
        obtenerCaracterAleatorio(
            simbolos
        );


    while (password.length < 12) {
        password +=
            obtenerCaracterAleatorio(
                todos
            );
    }


    return mezclarTexto(
        password
    );
}


function obtenerCaracterAleatorio(texto) {
    const indice =
        Math.floor(
            Math.random() *
            texto.length
        );


    return texto[indice];
}


function mezclarTexto(texto) {
    const caracteres =
        texto.split("");


    for (
        let i = caracteres.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            caracteres[i],
            caracteres[j]
        ] = [
            caracteres[j],
            caracteres[i]
        ];
    }


    return caracteres.join("");
}


// =====================================================
// SEGURIDAD DE CONTRASEÑA
// =====================================================

function actualizarSeguridadPassword() {
    const password =
        document.getElementById(
            "registroPassword"
        )?.value || "";


    const reglas = {
        length:
            password.length >= 8,

        uppercase:
            /[A-Z]/.test(password),

        lowercase:
            /[a-z]/.test(password),

        number:
            /\d/.test(password),

        symbol:
            /[^A-Za-z0-9]/.test(
                password
            )
    };


    Object.entries(
        reglas
    ).forEach(
        ([regla, cumple]) => {

            const elemento =
                document.querySelector(
                    `[data-rule="${regla}"]`
                );


            elemento?.classList.toggle(
                "valid",
                cumple
            );
        }
    );


    const cantidadCumplida =
        Object.values(
            reglas
        ).filter(Boolean).length;


    const barras =
        document.querySelectorAll(
            "#barrasSeguridad span"
        );


    barras.forEach(
        (barra, indice) => {
            barra.classList.toggle(
                "active",
                indice <
                cantidadCumplida
            );
        }
    );


    const texto =
        document.getElementById(
            "textoSeguridadPassword"
        );


    if (!texto) {
        return;
    }


    if (cantidadCumplida <= 1) {
        texto.textContent =
            "Contraseña muy débil.";
    }
    else if (
        cantidadCumplida <= 3
    ) {
        texto.textContent =
            "Contraseña de seguridad media.";
    }
    else if (
        cantidadCumplida === 4
    ) {
        texto.textContent =
            "Contraseña segura.";
    }
    else {
        texto.textContent =
            "Contraseña muy segura.";
    }
}


function validarPasswordSegura(
    password
) {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(
            password
        )
    );
}


// =====================================================
// TELÉFONO
// =====================================================

function configurarTelefono() {
    const pais =
        document.getElementById(
            "registroPais"
        );


    const telefono =
        document.getElementById(
            "registroTelefono"
        );


    pais?.addEventListener(
        "change",
        actualizarPrefijoTelefono
    );


    telefono?.addEventListener(
        "input",
        () => {
            telefono.value =
                telefono.value.replace(
                    /\D/g,
                    ""
                );
        }
    );


    actualizarPrefijoTelefono();
}


function actualizarPrefijoTelefono() {
    const selector =
        document.getElementById(
            "registroPais"
        );


    const prefijo =
        document.getElementById(
            "prefijoTelefono"
        );


    const ayuda =
        document.getElementById(
            "ayudaTelefono"
        );


    if (!selector) {
        return;
    }


    const opcion =
        selector.options[
            selector.selectedIndex
        ];


    const codigo =
        opcion?.dataset.code ||
        "+51";


    if (prefijo) {
        prefijo.textContent =
            codigo;
    }


    if (ayuda) {
        if (
            selector.value ===
            "PE"
        ) {
            ayuda.textContent =
                "En Perú debe tener 9 dígitos y comenzar con 9.";
        }
        else {
            ayuda.textContent =
                "Ingresa el número sin el código internacional.";
        }
    }
}


function obtenerTelefonoCompleto() {
    const selector =
        document.getElementById(
            "registroPais"
        );


    const telefono =
        document.getElementById(
            "registroTelefono"
        )
            ?.value
            .replace(/\D/g, "") ||
        "";


    if (!selector) {
        return telefono;
    }


    const opcion =
        selector.options[
            selector.selectedIndex
        ];


    const codigo =
        opcion?.dataset.code ||
        "+51";


    return `${codigo}${telefono}`;
}


function validarTelefonoSeleccionado() {
    const selector =
        document.getElementById(
            "registroPais"
        );


    const telefono =
        document.getElementById(
            "registroTelefono"
        )
            ?.value
            .replace(/\D/g, "") ||
        "";


    if (!telefono) {
        mostrarErrorCampo(
            "errorRegistroTelefono",
            "Ingresa tu número de teléfono."
        );

        return false;
    }


    if (
        selector?.value === "PE" &&
        !/^9\d{8}$/.test(
            telefono
        )
    ) {
        mostrarErrorCampo(
            "errorRegistroTelefono",
            "En Perú debe tener 9 dígitos y comenzar con 9."
        );

        return false;
    }


    if (
        selector?.value !== "PE" &&
        telefono.length < 7
    ) {
        mostrarErrorCampo(
            "errorRegistroTelefono",
            "El número de teléfono es demasiado corto."
        );

        return false;
    }


    return true;
}


// =====================================================
// BOTONES SOCIALES
// =====================================================

function configurarBotonesSociales() {
    document
        .querySelectorAll(
            ".social-auth-button"
        )
        .forEach(
            (boton) => {
                boton.addEventListener(
                    "click",
                    () => {
                        const proveedor =
                            boton.dataset
                                .provider ||
                            "este proveedor";


                        window.alert(
                            `El inicio de sesión con ${proveedor} se implementará posteriormente.`
                        );
                    }
                );
            }
        );


    document
        .getElementById(
            "btnRecuperarPassword"
        )
        ?.addEventListener(
            "click",
            () => {
                const correo = document.getElementById("loginCorreo")?.value?.trim() || "";

                window.alert(
                    correo
                        ? `La recuperación de contraseña para ${correo} se habilitará con el servicio de correo seguro.`
                        : "Ingresa primero tu correo electrónico para iniciar la recuperación segura de contraseña."
                );
            }
        );
}


// =====================================================
// RESPUESTAS DE API
// =====================================================

async function leerRespuestaApi(
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
    }
    catch {
        return {
            mensaje: texto
        };
    }
}


function obtenerMensajeEstado(
    estado
) {
    switch (estado) {
        case 400:
            return "Los datos enviados no son válidos.";

        case 401:
            return "Correo o contraseña incorrectos.";

        case 403:
            return "No tienes permiso para ingresar.";

        case 404:
            return "No se encontró el servicio solicitado.";

        case 500:
            return "Ocurrió un error interno en el servidor.";

        default:
            return `No se pudo completar la operación. Código ${estado}.`;
    }
}


// =====================================================
// MENSAJES Y ERRORES
// =====================================================

function mostrarErrorCampo(
    idElemento,
    mensaje
) {
    const elemento =
        document.getElementById(
            idElemento
        );


    if (elemento) {
        elemento.textContent =
            mensaje || "";
    }
}


function mostrarMensajeAuth(
    idElemento,
    mensaje,
    tipo = ""
) {
    const elemento =
        document.getElementById(
            idElemento
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje || "";


    elemento.classList.remove(
        "success",
        "error",
        "info"
    );


    if (tipo) {
        elemento.classList.add(
            tipo
        );
    }
}


function limpiarErroresLogin() {
    mostrarErrorCampo(
        "errorLoginCorreo",
        ""
    );


    mostrarErrorCampo(
        "errorLoginPassword",
        ""
    );


    mostrarMensajeAuth(
        "mensajeLogin",
        "",
        ""
    );
}


function limpiarErroresRegistro() {
    const errores = [
        "errorRegistroNombres",
        "errorRegistroApellidos",
        "errorRegistroCorreo",
        "errorRegistroTelefono",
        "errorRegistroPassword",
        "errorConfirmarPassword",
        "errorRegistroTerminos"
    ];


    errores.forEach(
        (id) => {
            mostrarErrorCampo(
                id,
                ""
            );
        }
    );


    mostrarMensajeAuth(
        "mensajeRegistro",
        "",
        ""
    );
}


// =====================================================
// BOTONES DE CARGA
// =====================================================

function cambiarEstadoBoton(
    boton,
    cargando,
    texto
) {
    if (!boton) {
        return;
    }


    boton.disabled =
        cargando;


    boton.innerHTML =
        cargando
            ? `
                <span>${texto}</span>
                <i class="fa-solid fa-spinner fa-spin"></i>
            `
            : `
                <span>${texto}</span>
                <i class="fa-solid fa-arrow-right"></i>
            `;
}


// =====================================================
// VALIDACIONES
// =====================================================

function validarCorreo(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        correo
    );
}


function validarNombre(nombre) {
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]{2,60}$/.test(
        nombre
    );
}


function obtenerValor(
    idElemento,
    limpiarEspacios = true
) {
    const valor =
        document.getElementById(
            idElemento
        )?.value || "";


    return limpiarEspacios
        ? valor.trim()
        : valor;
}


function escaparHtmlAuth(valor) {
    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


// =====================================================
// FUNCIONES DISPONIBLES PARA OTROS ARCHIVOS
// =====================================================

window.abrirModalAuth =
    abrirModalAuth;

window.cerrarModalAuth =
    cerrarModalAuth;

window.obtenerAlmacenamientoSesion =
    obtenerAlmacenamientoSesion;

window.obtenerUsuarioSesion =
    obtenerUsuarioSesion;

window.obtenerTokenSesion =
    obtenerTokenSesion;

window.cerrarSesion =
    cerrarSesion;

window.esAdministrador =
    esAdministrador;