"use strict";

let opinionesAdmin = [];

document.addEventListener("DOMContentLoaded", () => {
    if (!protegerOpinionesAdministrador()) return;
    cargarDatosAdministradorOpiniones();
    configurarEventosOpiniones();
    cargarOpiniones();
});

function protegerOpinionesAdministrador() {
    const usuario = obtenerUsuarioSesion();
    const token = obtenerTokenSesion();
    if (!usuario || !token) {
        window.location.href = "../index.html";
        return false;
    }

    if (String(usuario.rol || "").trim().toLowerCase() !== "administrador") {
        window.alert("No tienes permisos para acceder al panel administrativo.");
        window.location.href = "../index.html";
        return false;
    }
    return true;
}

function cargarDatosAdministradorOpiniones() {
    const usuario = obtenerUsuarioSesion();
    if (!usuario) return;
    const nombre = [usuario.nombres, usuario.apellidos].filter(Boolean).join(" ");
    asignarTextoOpinion("adminNombre", nombre || "Administrador");
    asignarTextoOpinion("adminCorreo", usuario.correo || "");
}

function configurarEventosOpiniones() {
    document.getElementById("buscarOpinion")?.addEventListener("input", aplicarFiltrosOpiniones);
    document.getElementById("filtroCalificacion")?.addEventListener("change", aplicarFiltrosOpiniones);
}

async function cargarOpiniones() {
    const tabla = document.getElementById("tablaOpiniones");
    try {
        const respuesta = await peticionOpinionesAdmin(
            obtenerUrlApi(API_CONFIG.endpoints.opiniones),
            { method: "GET" }
        );
        opinionesAdmin = Array.isArray(respuesta) ? respuesta : [];
        actualizarResumenOpiniones();
        aplicarFiltrosOpiniones();
    } catch (error) {
        console.error("Error cargando opiniones:", error);
        if (tabla) tabla.innerHTML = `<tr><td colspan="7"><div class="admin-loading">No se pudieron cargar las opiniones.</div></td></tr>`;
        mostrarMensajeOpinion(error.message || "No se pudieron cargar las opiniones.", "error");
    }
}

function actualizarResumenOpiniones() {
    const total = opinionesAdmin.length;
    const promedio = total
        ? opinionesAdmin.reduce((suma, opinion) => suma + Number(opinion.calificacion || 0), 0) / total
        : 0;

    const ahora = new Date();
    const delMes = opinionesAdmin.filter((opinion) => {
        const fecha = new Date(opinion.fecha);
        return !Number.isNaN(fecha.getTime()) &&
            fecha.getMonth() === ahora.getMonth() &&
            fecha.getFullYear() === ahora.getFullYear();
    }).length;

    asignarTextoOpinion("totalOpiniones", total);
    asignarTextoOpinion("promedioOpiniones", promedio.toFixed(1));
    asignarTextoOpinion("opinionesMes", delMes);
}

function aplicarFiltrosOpiniones() {
    const busqueda = String(document.getElementById("buscarOpinion")?.value || "").trim().toLowerCase();
    const calificacion = String(document.getElementById("filtroCalificacion")?.value || "");

    const filtradas = opinionesAdmin.filter((opinion) => {
        const texto = [opinion.usuario, opinion.paquete, opinion.comentario].join(" ").toLowerCase();
        const coincideBusqueda = !busqueda || texto.includes(busqueda);
        const coincideCalificacion = !calificacion || String(opinion.calificacion) === calificacion;
        return coincideBusqueda && coincideCalificacion;
    });

    renderizarOpiniones(filtradas);
}

function renderizarOpiniones(opiniones) {
    const tabla = document.getElementById("tablaOpiniones");
    if (!tabla) return;

    if (!opiniones.length) {
        tabla.innerHTML = `<tr><td colspan="7"><div class="admin-loading">No se encontraron opiniones.</div></td></tr>`;
        return;
    }

    tabla.innerHTML = opiniones.map((opinion) => {
        const estrellas = crearEstrellas(Number(opinion.calificacion || 0));
        const comentario = String(opinion.comentario || "Sin comentario");
        return `
            <tr>
                <td><strong>#${Number(opinion.id)}</strong></td>
                <td>${escaparOpinion(opinion.usuario || "Cliente")}</td>
                <td>${escaparOpinion(opinion.paquete || "-")}</td>
                <td><span class="rating-stars" title="${Number(opinion.calificacion || 0)} de 5">${estrellas}</span></td>
                <td><div class="opinion-comment">${escaparOpinion(comentario)}</div></td>
                <td>${formatearFechaOpinion(opinion.fecha)}</td>
                <td>
                    <button type="button" class="admin-action-button admin-action-delete" title="Eliminar opinión" onclick="eliminarOpinion(${Number(opinion.id)})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    }).join("");
}

async function eliminarOpinion(id) {
    const opinion = opinionesAdmin.find((item) => Number(item.id) === Number(id));
    if (!opinion) return;

    if (!window.confirm(`¿Deseas eliminar la opinión de ${opinion.usuario || "este cliente"}?`)) return;

    try {
        await peticionOpinionesAdmin(
            obtenerUrlApi(`${API_CONFIG.endpoints.opiniones}/${id}`),
            { method: "DELETE" }
        );
        mostrarMensajeOpinion("Opinión eliminada correctamente.", "success");
        await cargarOpiniones();
    } catch (error) {
        mostrarMensajeOpinion(error.message || "No se pudo eliminar la opinión.", "error");
    }
}

async function peticionOpinionesAdmin(url, opciones = {}) {
    const headers = new Headers(opciones.headers || {});
    const token = obtenerTokenSesion();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (opciones.body && !(opciones.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const respuesta = await fetch(url, { ...opciones, headers });
    let datos = null;
    const tipo = respuesta.headers.get("content-type") || "";
    if (tipo.includes("application/json")) datos = await respuesta.json();
    else if (respuesta.status !== 204) datos = await respuesta.text();

    if (!respuesta.ok) {
        const mensaje = datos?.mensaje || datos?.message || (typeof datos === "string" ? datos : "Error en la solicitud.");
        throw new Error(mensaje);
    }
    return datos;
}

function crearEstrellas(cantidad) {
    const valor = Math.max(0, Math.min(5, cantidad));
    return "★".repeat(valor) + "☆".repeat(5 - valor);
}

function formatearFechaOpinion(valor) {
    if (!valor) return "-";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "-";
    return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(fecha);
}

function mostrarMensajeOpinion(mensaje, tipo = "success") {
    const elemento = document.getElementById("mensajeOpiniones");
    if (!elemento) return;
    elemento.textContent = mensaje || "";
    elemento.className = `admin-message ${tipo}`;
    if (mensaje) setTimeout(() => {
        elemento.textContent = "";
        elemento.className = "admin-message";
    }, 4500);
}

function asignarTextoOpinion(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
}

function escaparOpinion(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
