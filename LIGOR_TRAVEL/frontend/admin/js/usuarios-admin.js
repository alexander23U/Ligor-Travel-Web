"use strict";

let usuariosAdmin = [];
let usuarioEditandoId = null;
let usuarioPasswordId = null;


document.addEventListener("DOMContentLoaded", () => {
    if (!protegerModuloAdministrador()) {
        return;
    }

    cargarDatosAdministrador();
    configurarEventosUsuarios();
    cargarUsuarios();
});


// =====================================================
// SEGURIDAD
// =====================================================

function protegerModuloAdministrador() {
    const usuario = obtenerUsuarioSesion();
    const token = obtenerTokenSesion();

    if (!usuario || !token) {
        window.location.href = "../index.html";
        return false;
    }

    const rol = String(usuario.rol || "")
        .trim()
        .toLowerCase();

    if (rol !== "administrador") {
        window.alert("No tienes permisos para acceder al panel administrativo.");
        window.location.href = "../index.html";
        return false;
    }

    return true;
}


function cargarDatosAdministrador() {
    const usuario = obtenerUsuarioSesion();

    if (!usuario) {
        return;
    }

    const nombreCompleto = [usuario.nombres, usuario.apellidos]
        .filter(Boolean)
        .join(" ");

    const nombre = document.getElementById("adminNombre");
    const correo = document.getElementById("adminCorreo");

    if (nombre) {
        nombre.textContent = nombreCompleto || "Administrador";
    }

    if (correo) {
        correo.textContent = usuario.correo || "";
    }
}


// =====================================================
// EVENTOS
// =====================================================

function configurarEventosUsuarios() {
    document.getElementById("btnNuevoUsuario")?.addEventListener("click", abrirModalNuevoUsuario);
    document.getElementById("btnCerrarModalUsuario")?.addEventListener("click", cerrarModalUsuario);
    document.getElementById("btnCancelarUsuario")?.addEventListener("click", cerrarModalUsuario);
    document.getElementById("formUsuario")?.addEventListener("submit", guardarUsuario);

    document.getElementById("btnCerrarModalPassword")?.addEventListener("click", cerrarModalPassword);
    document.getElementById("btnCancelarPassword")?.addEventListener("click", cerrarModalPassword);
    document.getElementById("formResetPassword")?.addEventListener("submit", guardarNuevaPassword);

    document.getElementById("buscarUsuario")?.addEventListener("input", aplicarFiltrosUsuarios);
    document.getElementById("filtroRol")?.addEventListener("change", aplicarFiltrosUsuarios);
    document.getElementById("filtroEstado")?.addEventListener("change", aplicarFiltrosUsuarios);

    document.getElementById("modalUsuario")?.addEventListener("click", (event) => {
        if (event.target.id === "modalUsuario") {
            cerrarModalUsuario();
        }
    });

    document.getElementById("modalPassword")?.addEventListener("click", (event) => {
        if (event.target.id === "modalPassword") {
            cerrarModalPassword();
        }
    });

    document.getElementById("btnCerrarSesionAdmin")?.addEventListener("click", () => {
        if (!window.confirm("¿Deseas cerrar sesión?")) {
            return;
        }

        cerrarSesion();
        window.location.href = "../index.html";
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            cerrarModalUsuario();
            cerrarModalPassword();
        }
    });
}


// =====================================================
// CARGAR USUARIOS
// =====================================================

async function cargarUsuarios() {
    const tabla = document.getElementById("tablaUsuarios");

    if (!tabla) {
        return;
    }

    tabla.innerHTML = `
        <tr>
            <td colspan="7">
                <div class="admin-loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Cargando usuarios...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const respuesta = await peticionAdmin(
            obtenerUrlApi(API_CONFIG.endpoints.usuarios),
            { method: "GET" }
        );

        usuariosAdmin = Array.isArray(respuesta) ? respuesta : [];
        actualizarResumenUsuarios();
        aplicarFiltrosUsuarios();
    } catch (error) {
        console.error("Error cargando usuarios:", error);
        tabla.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="admin-loading">No se pudieron cargar los usuarios.</div>
                </td>
            </tr>
        `;
        mostrarMensajeUsuarios(error.message, "error");
    }
}


function actualizarResumenUsuarios() {
    const activos = usuariosAdmin.filter((usuario) => usuario.estado === true).length;
    const personal = usuariosAdmin.filter((usuario) =>
        usuario.rol === "Administrador" || usuario.rol === "Vendedor"
    ).length;

    asignarTexto("totalUsuarios", usuariosAdmin.length);
    asignarTexto("totalActivos", activos);
    asignarTexto("totalPersonal", personal);
}


function aplicarFiltrosUsuarios() {
    const busqueda = String(document.getElementById("buscarUsuario")?.value || "")
        .trim()
        .toLowerCase();

    const rol = String(document.getElementById("filtroRol")?.value || "");
    const estado = String(document.getElementById("filtroEstado")?.value || "");

    const filtrados = usuariosAdmin.filter((usuario) => {
        const texto = [
            usuario.nombres,
            usuario.apellidos,
            usuario.correo,
            usuario.telefono
        ]
            .join(" ")
            .toLowerCase();

        const coincideBusqueda = !busqueda || texto.includes(busqueda);
        const coincideRol = !rol || usuario.rol === rol;
        const coincideEstado =
            !estado ||
            (estado === "activo" && usuario.estado === true) ||
            (estado === "inactivo" && usuario.estado === false);

        return coincideBusqueda && coincideRol && coincideEstado;
    });

    renderizarUsuarios(filtrados);
}


function renderizarUsuarios(usuarios) {
    const tabla = document.getElementById("tablaUsuarios");

    if (!tabla) {
        return;
    }

    if (!usuarios.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="admin-loading">No se encontraron usuarios con esos filtros.</div>
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = usuarios.map((usuario) => {
        const nombreCompleto = `${usuario.nombres || ""} ${usuario.apellidos || ""}`.trim();
        const iniciales = obtenerIniciales(nombreCompleto);
        const activo = usuario.estado === true;
        const botonEstadoTitulo = activo ? "Desactivar usuario" : "Activar usuario";
        const botonEstadoIcono = activo ? "fa-user-slash" : "fa-user-check";

        return `
            <tr>
                <td>
                    <div class="admin-user-cell">
                        <div class="admin-user-initials">${escaparAdmin(iniciales)}</div>
                        <div>
                            <strong>${escaparAdmin(nombreCompleto || "Usuario")}</strong>
                            <small>#${Number(usuario.id)}</small>
                        </div>
                    </div>
                </td>
                <td>${escaparAdmin(usuario.correo || "-")}</td>
                <td>${escaparAdmin(usuario.telefono || "-")}</td>
                <td><span class="admin-role ${obtenerClaseRol(usuario.rol)}">${escaparAdmin(usuario.rol || "-")}</span></td>
                <td><span class="admin-status ${activo ? "active" : "inactive"}">${activo ? "Activo" : "Inactivo"}</span></td>
                <td>${formatearFechaAdmin(usuario.fechaRegistro)}</td>
                <td>
                    <div class="admin-actions">
                        <button type="button" class="admin-action-button admin-action-edit" title="Editar usuario" onclick="editarUsuario(${Number(usuario.id)})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="admin-action-button admin-action-key" title="Restablecer contraseña" onclick="abrirModalPassword(${Number(usuario.id)})">
                            <i class="fa-solid fa-key"></i>
                        </button>
                        <button type="button" class="admin-action-button ${activo ? "admin-action-disable" : "admin-action-enable"}" title="${botonEstadoTitulo}" onclick="cambiarEstadoUsuario(${Number(usuario.id)})">
                            <i class="fa-solid ${botonEstadoIcono}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}


// =====================================================
// CREAR / EDITAR
// =====================================================

function abrirModalNuevoUsuario() {
    usuarioEditandoId = null;
    document.getElementById("formUsuario")?.reset();

    asignarTexto("etiquetaModalUsuario", "Nuevo usuario");
    asignarTexto("tituloModalUsuario", "Crear usuario");

    const estado = document.getElementById("usuarioEstado");
    if (estado) estado.value = "true";

    mostrarCamposPasswordCrear(true);
    limpiarMensaje("mensajeModalUsuario");
    abrirModal("modalUsuario");

    setTimeout(() => document.getElementById("usuarioNombres")?.focus(), 100);
}


function editarUsuario(id) {
    const usuario = usuariosAdmin.find((item) => Number(item.id) === Number(id));

    if (!usuario) {
        mostrarMensajeUsuarios("No se encontró el usuario seleccionado.", "error");
        return;
    }

    usuarioEditandoId = Number(id);

    asignarValor("usuarioNombres", usuario.nombres);
    asignarValor("usuarioApellidos", usuario.apellidos);
    asignarValor("usuarioCorreo", usuario.correo);
    asignarValor("usuarioTelefono", usuario.telefono);
    asignarValor("usuarioRol", usuario.rol);
    asignarValor("usuarioEstado", String(usuario.estado === true));

    asignarTexto("etiquetaModalUsuario", "Editar usuario");
    asignarTexto("tituloModalUsuario", "Actualizar usuario");
    mostrarCamposPasswordCrear(false);
    limpiarMensaje("mensajeModalUsuario");
    abrirModal("modalUsuario");
}


async function guardarUsuario(event) {
    event.preventDefault();

    const datosBase = {
        nombres: obtenerValor("usuarioNombres"),
        apellidos: obtenerValor("usuarioApellidos"),
        correo: obtenerValor("usuarioCorreo").toLowerCase(),
        telefono: obtenerValor("usuarioTelefono"),
        rol: obtenerValor("usuarioRol")
    };

    if (!datosBase.nombres || !datosBase.apellidos || !datosBase.correo || !datosBase.rol) {
        mostrarMensaje("mensajeModalUsuario", "Completa todos los campos obligatorios.", "error");
        return;
    }

    const boton = document.getElementById("btnGuardarUsuario");
    cambiarBoton(boton, true, "Guardando...");

    try {
        if (usuarioEditandoId === null) {
            const password = document.getElementById("usuarioPassword")?.value || "";
            const confirmar = document.getElementById("usuarioConfirmarPassword")?.value || "";

            if (password.length < 8) {
                throw new Error("La contraseña debe tener al menos 8 caracteres.");
            }

            if (password !== confirmar) {
                throw new Error("Las contraseñas no coinciden.");
            }

            await peticionAdmin(
                obtenerUrlApi(`${API_CONFIG.endpoints.usuarios}/admin`),
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...datosBase, password })
                }
            );

            mostrarMensajeUsuarios("Usuario creado correctamente.", "success");
        } else {
            const estado = document.getElementById("usuarioEstado")?.value === "true";

            await peticionAdmin(
                obtenerUrlApi(`${API_CONFIG.endpoints.usuarios}/${usuarioEditandoId}`),
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...datosBase, estado })
                }
            );

            mostrarMensajeUsuarios("Usuario actualizado correctamente.", "success");
        }

        cerrarModalUsuario();
        await cargarUsuarios();
    } catch (error) {
        mostrarMensaje("mensajeModalUsuario", error.message, "error");
    } finally {
        cambiarBoton(boton, false, "Guardar usuario", "fa-floppy-disk");
    }
}


function cerrarModalUsuario() {
    cerrarModal("modalUsuario");
    usuarioEditandoId = null;
}


// =====================================================
// ACTIVAR / DESACTIVAR
// =====================================================

async function cambiarEstadoUsuario(id) {
    const usuario = usuariosAdmin.find((item) => Number(item.id) === Number(id));

    if (!usuario) return;

    const accion = usuario.estado ? "desactivar" : "activar";
    const nombre = `${usuario.nombres || ""} ${usuario.apellidos || ""}`.trim();

    if (!window.confirm(`¿Deseas ${accion} la cuenta de ${nombre}?`)) {
        return;
    }

    try {
        const resultado = await peticionAdmin(
            obtenerUrlApi(`${API_CONFIG.endpoints.usuarios}/${id}/estado`),
            { method: "PUT" }
        );

        mostrarMensajeUsuarios(resultado?.mensaje || "Estado actualizado correctamente.", "success");
        await cargarUsuarios();
    } catch (error) {
        mostrarMensajeUsuarios(error.message, "error");
    }
}


// =====================================================
// RESTABLECER CONTRASEÑA
// =====================================================

function abrirModalPassword(id) {
    const usuario = usuariosAdmin.find((item) => Number(item.id) === Number(id));

    if (!usuario) return;

    usuarioPasswordId = Number(id);
    document.getElementById("formResetPassword")?.reset();

    const nombre = `${usuario.nombres || ""} ${usuario.apellidos || ""}`.trim();
    asignarTexto("textoUsuarioPassword", `Crear una nueva contraseña para ${nombre}.`);
    limpiarMensaje("mensajeModalPassword");
    abrirModal("modalPassword");

    setTimeout(() => document.getElementById("resetNuevaPassword")?.focus(), 100);
}


async function guardarNuevaPassword(event) {
    event.preventDefault();

    if (!usuarioPasswordId) return;

    const nuevaPassword = document.getElementById("resetNuevaPassword")?.value || "";
    const confirmarPassword = document.getElementById("resetConfirmarPassword")?.value || "";

    if (nuevaPassword.length < 8) {
        mostrarMensaje("mensajeModalPassword", "La contraseña debe tener al menos 8 caracteres.", "error");
        return;
    }

    if (nuevaPassword !== confirmarPassword) {
        mostrarMensaje("mensajeModalPassword", "Las contraseñas no coinciden.", "error");
        return;
    }

    const boton = document.getElementById("btnGuardarPassword");
    cambiarBoton(boton, true, "Guardando...");

    try {
        const resultado = await peticionAdmin(
            obtenerUrlApi(`${API_CONFIG.endpoints.usuarios}/${usuarioPasswordId}/reset-password`),
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nuevaPassword, confirmarPassword })
            }
        );

        cerrarModalPassword();
        mostrarMensajeUsuarios(resultado?.mensaje || "Contraseña restablecida correctamente.", "success");
    } catch (error) {
        mostrarMensaje("mensajeModalPassword", error.message, "error");
    } finally {
        cambiarBoton(boton, false, "Restablecer", "fa-key");
    }
}


function cerrarModalPassword() {
    cerrarModal("modalPassword");
    usuarioPasswordId = null;
}


// =====================================================
// API
// =====================================================

async function peticionAdmin(url, opciones = {}) {
    const token = obtenerTokenSesion();

    if (!token) {
        limpiarDatosSesion();
        window.location.href = "../index.html";
        throw new Error("La sesión ha finalizado.");
    }

    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(opciones.headers || {})
    };

    const respuesta = await fetch(url, {
        ...opciones,
        headers,
        cache: "no-store"
    });

    const resultado = await leerRespuestaAdmin(respuesta);

    if (respuesta.status === 401) {
        limpiarDatosSesion();
        window.alert("Tu sesión ha vencido. Inicia sesión nuevamente.");
        window.location.href = "../index.html";
        throw new Error("Sesión vencida.");
    }

    if (respuesta.status === 403) {
        throw new Error("No tienes permisos para realizar esta acción.");
    }

    if (!respuesta.ok) {
        throw new Error(obtenerMensajeErrorBackend(resultado, respuesta.status));
    }

    return resultado;
}


async function leerRespuestaAdmin(respuesta) {
    const texto = await respuesta.text();

    if (!texto) return {};

    try {
        return JSON.parse(texto);
    } catch {
        return { mensaje: texto };
    }
}


function obtenerMensajeErrorBackend(resultado, estado) {
    if (resultado?.mensaje) return resultado.mensaje;
    if (resultado?.message) return resultado.message;
    if (resultado?.title) return resultado.title;

    if (resultado?.errors && typeof resultado.errors === "object") {
        const errores = Object.values(resultado.errors).flat().filter(Boolean);
        if (errores.length) return errores.join(" ");
    }

    return `No se pudo completar la operación. Error ${estado}.`;
}


// =====================================================
// UTILIDADES
// =====================================================

function abrirModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
}


function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".admin-modal-overlay.open")) {
        document.body.classList.remove("no-scroll");
    }
}


function mostrarCamposPasswordCrear(mostrar) {
    const campoPassword = document.getElementById("campoPasswordUsuario");
    const campoConfirmar = document.getElementById("campoConfirmarPasswordUsuario");
    const campoEstado = document.getElementById("campoEstadoUsuario");

    if (campoPassword) campoPassword.style.display = mostrar ? "grid" : "none";
    if (campoConfirmar) campoConfirmar.style.display = mostrar ? "grid" : "none";
    if (campoEstado) campoEstado.style.display = mostrar ? "none" : "grid";
}


function mostrarMensajeUsuarios(mensaje, tipo) {
    mostrarMensaje("mensajeUsuarios", mensaje, tipo);
}


function mostrarMensaje(id, mensaje, tipo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    elemento.textContent = mensaje || "";
    elemento.className = `admin-message show ${tipo || ""}`;
}


function limpiarMensaje(id) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    elemento.textContent = "";
    elemento.className = "admin-message";
}


function cambiarBoton(boton, cargando, texto, icono = "") {
    if (!boton) return;

    boton.disabled = cargando;
    boton.innerHTML = cargando
        ? `<i class="fa-solid fa-spinner fa-spin"></i> ${escaparAdmin(texto)}`
        : `${icono ? `<i class="fa-solid ${icono}"></i> ` : ""}${escaparAdmin(texto)}`;
}


function obtenerValor(id) {
    return String(document.getElementById(id)?.value || "").trim();
}


function asignarValor(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = valor ?? "";
}


function asignarTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = String(valor ?? "");
}


function obtenerIniciales(nombre) {
    return String(nombre || "U")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join("") || "U";
}


function obtenerClaseRol(rol) {
    const valor = String(rol || "").toLowerCase();
    if (valor === "administrador") return "admin-role-admin";
    if (valor === "vendedor") return "admin-role-vendedor";
    return "admin-role-cliente";
}


function formatearFechaAdmin(fecha) {
    if (!fecha) return "-";

    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return "-";

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(valor);
}


function escaparAdmin(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
