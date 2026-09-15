"use strict";

let reservasAdmin = [];
let usuariosReserva = [];
let paquetesReserva = [];
let reservaEditandoId = null;
let reservaEstadoId = null;


document.addEventListener("DOMContentLoaded", () => {
    if (!protegerReservasAdministrador()) return;

    cargarDatosAdministradorReservas();
    configurarEventosReservas();
    cargarModuloReservas();
});


function protegerReservasAdministrador() {
    const usuario = obtenerUsuarioSesion();
    const token = obtenerTokenSesion();

    if (!usuario || !token) {
        window.location.href = "../index.html";
        return false;
    }

    const rol = String(usuario.rol || "").trim().toLowerCase();
    if (rol !== "administrador") {
        window.alert("No tienes permisos para acceder al panel administrativo.");
        window.location.href = "../index.html";
        return false;
    }

    return true;
}


function cargarDatosAdministradorReservas() {
    const usuario = obtenerUsuarioSesion();
    if (!usuario) return;

    const nombreCompleto = [usuario.nombres, usuario.apellidos].filter(Boolean).join(" ");
    asignarTextoReserva("adminNombre", nombreCompleto || "Administrador");
    asignarTextoReserva("adminCorreo", usuario.correo || "");
}


function configurarEventosReservas() {
    document.getElementById("btnNuevaReserva")?.addEventListener("click", abrirNuevaReserva);
    document.getElementById("btnCerrarModalReserva")?.addEventListener("click", cerrarModalReserva);
    document.getElementById("btnCancelarReserva")?.addEventListener("click", cerrarModalReserva);
    document.getElementById("formReserva")?.addEventListener("submit", guardarReserva);

    document.getElementById("btnCerrarModalEstadoReserva")?.addEventListener("click", cerrarModalEstadoReserva);
    document.getElementById("btnCancelarEstadoReserva")?.addEventListener("click", cerrarModalEstadoReserva);
    document.getElementById("formEstadoReserva")?.addEventListener("submit", guardarEstadoReserva);

    document.getElementById("buscarReserva")?.addEventListener("input", aplicarFiltrosReservas);
    document.getElementById("filtroEstadoReserva")?.addEventListener("change", aplicarFiltrosReservas);
    document.getElementById("filtroPagoReserva")?.addEventListener("change", aplicarFiltrosReservas);

    document.getElementById("reservaPaquete")?.addEventListener("change", actualizarTotalEstimadoReserva);
    document.getElementById("reservaCantidad")?.addEventListener("input", actualizarTotalEstimadoReserva);

    document.getElementById("modalReserva")?.addEventListener("click", (event) => {
        if (event.target.id === "modalReserva") cerrarModalReserva();
    });

    document.getElementById("modalEstadoReserva")?.addEventListener("click", (event) => {
        if (event.target.id === "modalEstadoReserva") cerrarModalEstadoReserva();
    });

    document.getElementById("btnCerrarSesionAdmin")?.addEventListener("click", () => {
        if (!window.confirm("¿Deseas cerrar sesión?")) return;
        cerrarSesion();
        window.location.href = "../index.html";
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            cerrarModalReserva();
            cerrarModalEstadoReserva();
        }
    });
}


async function cargarModuloReservas() {
    try {
        await Promise.all([
            cargarReservas(),
            cargarCatalogosReserva()
        ]);
    } catch (error) {
        console.error(error);
    }
}


async function cargarReservas() {
    const tabla = document.getElementById("tablaReservas");
    if (!tabla) return;

    tabla.innerHTML = `<tr><td colspan="9"><div class="admin-loading"><i class="fa-solid fa-spinner fa-spin"></i> Cargando reservas...</div></td></tr>`;

    try {
        const respuesta = await peticionReservasAdmin(
            obtenerUrlApi(API_CONFIG.endpoints.reservas),
            { method: "GET" }
        );

        reservasAdmin = Array.isArray(respuesta) ? respuesta : [];
        actualizarResumenReservas();
        aplicarFiltrosReservas();
    } catch (error) {
        tabla.innerHTML = `<tr><td colspan="9"><div class="admin-loading">No se pudieron cargar las reservas.</div></td></tr>`;
        mostrarMensajeReserva("mensajeReservas", error.message, "error");
    }
}


async function cargarCatalogosReserva() {
    try {
        const [usuarios, paquetes] = await Promise.all([
            peticionReservasAdmin(obtenerUrlApi(API_CONFIG.endpoints.usuarios), { method: "GET" }),
            peticionReservasAdmin(obtenerUrlApi(API_CONFIG.endpoints.paquetes), { method: "GET" })
        ]);

        usuariosReserva = Array.isArray(usuarios)
            ? usuarios.filter((u) => u.estado === true && String(u.rol || "").toLowerCase() === "cliente")
            : [];

        paquetesReserva = Array.isArray(paquetes) ? paquetes : [];
        llenarSelectsReserva();
    } catch (error) {
        console.error("No se pudieron cargar clientes o paquetes:", error);
    }
}


function actualizarResumenReservas() {
    const contar = (estado) => reservasAdmin.filter((r) => String(r.estado || "").toLowerCase() === estado.toLowerCase()).length;

    asignarTextoReserva("totalReservas", reservasAdmin.length);
    asignarTextoReserva("totalPendientes", contar("Pendiente"));
    asignarTextoReserva("totalConfirmadas", contar("Confirmada"));
    asignarTextoReserva("totalCanceladas", contar("Cancelada"));
}


function aplicarFiltrosReservas() {
    const busqueda = String(document.getElementById("buscarReserva")?.value || "").trim().toLowerCase();
    const estado = String(document.getElementById("filtroEstadoReserva")?.value || "");
    const pago = String(document.getElementById("filtroPagoReserva")?.value || "");

    const filtradas = reservasAdmin.filter((reserva) => {
        const texto = [reserva.id, reserva.usuario, reserva.usuarioCorreo, reserva.paquete].join(" ").toLowerCase();
        const coincideBusqueda = !busqueda || texto.includes(busqueda);
        const coincideEstado = !estado || reserva.estado === estado;
        const coincidePago = !pago ||
            (pago === "pagado" && reserva.pagoRegistrado === true) ||
            (pago === "sin-pago" && reserva.pagoRegistrado !== true);

        return coincideBusqueda && coincideEstado && coincidePago;
    });

    renderizarReservas(filtradas);
}


function renderizarReservas(reservas) {
    const tabla = document.getElementById("tablaReservas");
    if (!tabla) return;

    if (!reservas.length) {
        tabla.innerHTML = `<tr><td colspan="9"><div class="admin-loading">No se encontraron reservas con esos filtros.</div></td></tr>`;
        return;
    }

    tabla.innerHTML = reservas.map((reserva) => {
        const pagada = reserva.pagoRegistrado === true;
        const cancelada = String(reserva.estado || "").toLowerCase() === "cancelada";
        const editarDeshabilitado = pagada || cancelada;

        return `
            <tr>
                <td><strong>#${Number(reserva.id)}</strong></td>
                <td>
                    <div class="reservation-client-cell">
                        <strong>${escaparReserva(reserva.usuario || "Cliente")}</strong>
                        <small>${escaparReserva(reserva.usuarioCorreo || "")}</small>
                    </div>
                </td>
                <td><div class="reservation-package-cell"><strong>${escaparReserva(reserva.paquete || "-")}</strong><small>ID ${Number(reserva.paqueteId)}</small></div></td>
                <td>${formatearFechaHoraReserva(reserva.fechaReserva)}</td>
                <td>${Number(reserva.cantidadPersonas || 0)}</td>
                <td><strong>${formatearMonedaReserva(reserva.total)}</strong></td>
                <td><span class="reservation-status ${claseEstadoReserva(reserva.estado)}">${escaparReserva(reserva.estado || "-")}</span></td>
                <td>
                    <span class="reservation-payment ${pagada ? "paid" : "unpaid"}">
                        <i class="fa-solid ${pagada ? "fa-circle-check" : "fa-clock"}"></i>
                        ${pagada ? escaparReserva(reserva.metodoPago || "Pagado") : "Sin pago"}
                    </span>
                </td>
                <td>
                    <div class="admin-actions">
                        <button type="button" class="admin-action-button admin-action-edit" title="Editar reserva" ${editarDeshabilitado ? "disabled" : ""} onclick="editarReserva(${Number(reserva.id)})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="admin-action-button admin-action-state" title="Cambiar estado" onclick="abrirEstadoReserva(${Number(reserva.id)})">
                            <i class="fa-solid fa-arrows-rotate"></i>
                        </button>
                        <button type="button" class="admin-action-button admin-action-delete" title="Eliminar reserva" ${pagada ? "disabled" : ""} onclick="eliminarReserva(${Number(reserva.id)})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join("");
}


function llenarSelectsReserva() {
    const selectUsuario = document.getElementById("reservaUsuario");
    const selectPaquete = document.getElementById("reservaPaquete");

    if (selectUsuario) {
        selectUsuario.innerHTML = `<option value="">Selecciona un cliente</option>` + usuariosReserva.map((u) => {
            const nombre = `${u.nombres || ""} ${u.apellidos || ""}`.trim();
            return `<option value="${Number(u.id)}">${escaparReserva(nombre)} — ${escaparReserva(u.correo || "")}</option>`;
        }).join("");
    }

    if (selectPaquete) {
        selectPaquete.innerHTML = `<option value="">Selecciona un paquete</option>` + paquetesReserva
            .filter((p) => p.activo === true)
            .map((p) => `<option value="${Number(p.id)}">${escaparReserva(p.nombre || "Paquete")} — ${Number(p.cupos || 0)} cupos</option>`)
            .join("");
    }
}


function abrirNuevaReserva() {
    reservaEditandoId = null;
    document.getElementById("formReserva")?.reset();
    asignarTextoReserva("etiquetaModalReserva", "Nueva reserva");
    asignarTextoReserva("tituloModalReserva", "Registrar reserva");
    asignarTextoReserva("descripcionModalReserva", "Selecciona el cliente, el paquete y la cantidad de personas.");
    limpiarMensajeReserva("mensajeModalReserva");
    llenarSelectsReserva();
    asignarValorReserva("reservaCantidad", "1");
    actualizarTotalEstimadoReserva();
    abrirModalReservaBase("modalReserva");
}


function editarReserva(id) {
    const reserva = reservasAdmin.find((item) => Number(item.id) === Number(id));
    if (!reserva) return;

    if (reserva.pagoRegistrado === true) {
        mostrarMensajeReserva("mensajeReservas", "No se puede editar una reserva que ya tiene un pago registrado.", "error");
        return;
    }

    if (String(reserva.estado || "").toLowerCase() === "cancelada") {
        mostrarMensajeReserva("mensajeReservas", "Reactiva la reserva antes de editar sus datos.", "error");
        return;
    }

    reservaEditandoId = Number(id);
    limpiarMensajeReserva("mensajeModalReserva");
    llenarSelectsReserva();
    asignarValorReserva("reservaUsuario", reserva.usuarioId);
    asignarValorReserva("reservaPaquete", reserva.paqueteId);
    asignarValorReserva("reservaCantidad", reserva.cantidadPersonas);
    asignarTextoReserva("etiquetaModalReserva", `Reserva #${reserva.id}`);
    asignarTextoReserva("tituloModalReserva", "Editar reserva");
    asignarTextoReserva("descripcionModalReserva", "Puedes cambiar el cliente, paquete o cantidad mientras no exista un pago registrado.");
    actualizarTotalEstimadoReserva();
    abrirModalReservaBase("modalReserva");
}


async function guardarReserva(event) {
    event.preventDefault();
    limpiarMensajeReserva("mensajeModalReserva");

    const usuarioId = Number(document.getElementById("reservaUsuario")?.value || 0);
    const paqueteId = Number(document.getElementById("reservaPaquete")?.value || 0);
    const cantidadPersonas = Number(document.getElementById("reservaCantidad")?.value || 0);

    if (!usuarioId || !paqueteId || !Number.isInteger(cantidadPersonas) || cantidadPersonas < 1) {
        mostrarMensajeReserva("mensajeModalReserva", "Completa correctamente cliente, paquete y cantidad de personas.", "error");
        return;
    }

    const boton = document.getElementById("btnGuardarReserva");
    cambiarBotonReserva(boton, true, "Guardando...");

    try {
        const urlBase = obtenerUrlApi(API_CONFIG.endpoints.reservas);
        const resultado = await peticionReservasAdmin(
            reservaEditandoId ? `${urlBase}/${reservaEditandoId}` : urlBase,
            {
                method: reservaEditandoId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuarioId, paqueteId, cantidadPersonas })
            }
        );

        cerrarModalReserva();
        mostrarMensajeReserva("mensajeReservas", resultado?.mensaje || "Reserva guardada correctamente.", "success");
        await Promise.all([cargarReservas(), cargarCatalogosReserva()]);
    } catch (error) {
        mostrarMensajeReserva("mensajeModalReserva", error.message, "error");
    } finally {
        cambiarBotonReserva(boton, false, "Guardar", "fa-floppy-disk");
    }
}


function abrirEstadoReserva(id) {
    const reserva = reservasAdmin.find((item) => Number(item.id) === Number(id));
    if (!reserva) return;

    reservaEstadoId = Number(id);
    asignarTextoReserva("textoEstadoReserva", `${reserva.usuario} · ${reserva.paquete}`);
    asignarValorReserva("nuevoEstadoReserva", reserva.estado || "Pendiente");
    limpiarMensajeReserva("mensajeModalEstadoReserva");

    const select = document.getElementById("nuevoEstadoReserva");
    if (select) {
        Array.from(select.options).forEach((opcion) => { opcion.disabled = false; });
        if (reserva.pagoRegistrado === true) {
            Array.from(select.options).forEach((opcion) => {
                opcion.disabled = opcion.value !== "Confirmada";
            });
            select.value = "Confirmada";
        }
    }

    abrirModalReservaBase("modalEstadoReserva");
}


async function guardarEstadoReserva(event) {
    event.preventDefault();
    if (!reservaEstadoId) return;

    const estado = String(document.getElementById("nuevoEstadoReserva")?.value || "");
    const boton = document.getElementById("btnGuardarEstadoReserva");
    cambiarBotonReserva(boton, true, "Actualizando...");

    try {
        const resultado = await peticionReservasAdmin(
            `${obtenerUrlApi(API_CONFIG.endpoints.reservas)}/${reservaEstadoId}/estado`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado })
            }
        );

        cerrarModalEstadoReserva();
        mostrarMensajeReserva("mensajeReservas", resultado?.mensaje || "Estado actualizado correctamente.", "success");
        await Promise.all([cargarReservas(), cargarCatalogosReserva()]);
    } catch (error) {
        mostrarMensajeReserva("mensajeModalEstadoReserva", error.message, "error");
    } finally {
        cambiarBotonReserva(boton, false, "Actualizar estado", "fa-arrows-rotate");
    }
}


async function eliminarReserva(id) {
    const reserva = reservasAdmin.find((item) => Number(item.id) === Number(id));
    if (!reserva) return;

    if (reserva.pagoRegistrado === true) {
        mostrarMensajeReserva("mensajeReservas", "No se puede eliminar una reserva con pago registrado.", "error");
        return;
    }

    if (!window.confirm(`¿Eliminar la reserva #${reserva.id} de ${reserva.usuario}? Esta acción no se puede deshacer.`)) return;

    try {
        const resultado = await peticionReservasAdmin(
            `${obtenerUrlApi(API_CONFIG.endpoints.reservas)}/${id}`,
            { method: "DELETE" }
        );

        mostrarMensajeReserva("mensajeReservas", resultado?.mensaje || "Reserva eliminada correctamente.", "success");
        await Promise.all([cargarReservas(), cargarCatalogosReserva()]);
    } catch (error) {
        mostrarMensajeReserva("mensajeReservas", error.message, "error");
    }
}


function actualizarTotalEstimadoReserva() {
    const paqueteId = Number(document.getElementById("reservaPaquete")?.value || 0);
    const cantidad = Number(document.getElementById("reservaCantidad")?.value || 0);
    const paquete = paquetesReserva.find((item) => Number(item.id) === paqueteId);

    if (!paquete) {
        asignarTextoReserva("detallePaqueteReserva", "Selecciona un paquete para ver sus cupos.");
        asignarTextoReserva("totalEstimadoReserva", "S/ 0.00");
        return;
    }

    asignarTextoReserva("detallePaqueteReserva", `${Number(paquete.cupos || 0)} cupos disponibles · ${formatearMonedaReserva(paquete.precio)} por persona`);
    asignarTextoReserva("totalEstimadoReserva", formatearMonedaReserva(Number(paquete.precio || 0) * Math.max(cantidad, 0)));
}


function cerrarModalReserva() {
    cerrarModalReservaBase("modalReserva");
    reservaEditandoId = null;
}


function cerrarModalEstadoReserva() {
    cerrarModalReservaBase("modalEstadoReserva");
    reservaEstadoId = null;
}


async function peticionReservasAdmin(url, opciones = {}) {
    const token = obtenerTokenSesion();

    if (!token) {
        limpiarDatosSesion();
        window.location.href = "../index.html";
        throw new Error("La sesión ha finalizado.");
    }

    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            ...(opciones.headers || {})
        },
        cache: "no-store"
    });

    const resultado = await leerRespuestaReservas(respuesta);

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
        throw new Error(obtenerMensajeErrorReservas(resultado, respuesta.status));
    }

    return resultado;
}


async function leerRespuestaReservas(respuesta) {
    const texto = await respuesta.text();
    if (!texto) return {};

    try { return JSON.parse(texto); }
    catch { return { mensaje: texto }; }
}


function obtenerMensajeErrorReservas(resultado, estado) {
    if (resultado?.mensaje) return resultado.mensaje;
    if (resultado?.message) return resultado.message;
    if (resultado?.title) return resultado.title;

    if (resultado?.errors && typeof resultado.errors === "object") {
        const errores = Object.values(resultado.errors).flat().filter(Boolean);
        if (errores.length) return errores.join(" ");
    }

    return `No se pudo completar la operación. Error ${estado}.`;
}


function abrirModalReservaBase(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
}


function cerrarModalReservaBase(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".admin-modal-overlay.open")) document.body.classList.remove("no-scroll");
}


function mostrarMensajeReserva(id, mensaje, tipo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.textContent = mensaje || "";
    elemento.className = `admin-message show ${tipo || ""}`;
}


function limpiarMensajeReserva(id) {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.textContent = "";
    elemento.className = "admin-message";
}


function cambiarBotonReserva(boton, cargando, texto, icono = "") {
    if (!boton) return;
    boton.disabled = cargando;
    boton.innerHTML = cargando
        ? `<i class="fa-solid fa-spinner fa-spin"></i> ${escaparReserva(texto)}`
        : `${icono ? `<i class="fa-solid ${icono}"></i> ` : ""}${escaparReserva(texto)}`;
}


function asignarTextoReserva(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = String(valor ?? "");
}


function asignarValorReserva(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = valor ?? "";
}


function claseEstadoReserva(estado) {
    const valor = String(estado || "").toLowerCase();
    if (valor === "confirmada") return "confirmed";
    if (valor === "cancelada") return "cancelled";
    return "pending";
}


function formatearMonedaReserva(valor) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2
    }).format(Number(valor || 0));
}


function formatearFechaHoraReserva(fecha) {
    if (!fecha) return "-";
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return "-";

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(valor);
}


function escaparReserva(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
