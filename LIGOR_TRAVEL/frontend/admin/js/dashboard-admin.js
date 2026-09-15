"use strict";

document.addEventListener("DOMContentLoaded", () => {
    if (!protegerDashboardAdministrador()) return;

    cargarAdministradorDashboard();
    configurarEventosDashboard();
    cargarDashboard();
});

function protegerDashboardAdministrador() {
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

function cargarAdministradorDashboard() {
    const usuario = obtenerUsuarioSesion();
    if (!usuario) return;

    const nombreCompleto = [usuario.nombres, usuario.apellidos]
        .filter(Boolean)
        .join(" ");

    asignarTextoDashboard("adminNombre", nombreCompleto || "Administrador");
    asignarTextoDashboard("adminCorreo", usuario.correo || "");
}

function configurarEventosDashboard() {
    document.getElementById("btnCerrarSesionAdmin")?.addEventListener("click", () => {
        if (!window.confirm("¿Deseas cerrar sesión?")) return;
        cerrarSesion();
        window.location.href = "../index.html";
    });
}

async function cargarDashboard() {
    limpiarMensajeDashboard();

    try {
        const datos = await peticionDashboard(
            obtenerUrlApi(API_CONFIG.endpoints.dashboard),
            { method: "GET" }
        );

        renderizarIndicadores(datos);
        renderizarEstadoReservas(datos);
        renderizarGraficoVentas(datos.ventasPorMes || []);
        renderizarTopPaquetes(datos.topPaquetes || []);
        renderizarReservasRecientes(datos.ultimasReservas || []);
    } catch (error) {
        console.error("Error cargando dashboard:", error);
        mostrarMensajeDashboard(error.message || "No se pudo cargar el dashboard.", "error");
    }
}

function renderizarIndicadores(datos) {
    asignarTextoDashboard("ingresosTotales", formatoMoneda(datos.ingresosTotales));
    asignarTextoDashboard("pagosTotales", numero(datos.pagos));
    asignarTextoDashboard("totalReservas", numero(datos.reservas));
    asignarTextoDashboard("reservasPendientes", numero(datos.reservasPendientes));
    asignarTextoDashboard("totalUsuarios", numero(datos.usuarios));
    asignarTextoDashboard("usuariosActivos", numero(datos.usuariosActivos));
    asignarTextoDashboard("totalPaquetes", numero(datos.paquetes));
    asignarTextoDashboard("paquetesActivos", numero(datos.paquetesActivos));

    asignarTextoDashboard("ingresosMes", formatoMoneda(datos.ingresosMes));
    asignarTextoDashboard("clientesNuevosMes", numero(datos.clientesNuevosMes));
    asignarTextoDashboard("reservasConfirmadas", numero(datos.reservasPagadas));
    asignarTextoDashboard("totalOpiniones", numero(datos.opiniones));
}

function renderizarEstadoReservas(datos) {
    const pendientes = numero(datos.reservasPendientes);
    const confirmadas = numero(datos.reservasPagadas);
    const canceladas = numero(datos.reservasCanceladas);
    const total = Math.max(numero(datos.reservas), pendientes + confirmadas + canceladas, 1);

    asignarTextoDashboard("estadoPendientes", pendientes);
    asignarTextoDashboard("estadoConfirmadas", confirmadas);
    asignarTextoDashboard("estadoCanceladas", canceladas);

    asignarAncho("barraPendientes", (pendientes / total) * 100);
    asignarAncho("barraConfirmadas", (confirmadas / total) * 100);
    asignarAncho("barraCanceladas", (canceladas / total) * 100);
}

function renderizarGraficoVentas(meses) {
    const contenedor = document.getElementById("graficoVentas");
    if (!contenedor) return;

    if (!Array.isArray(meses) || !meses.length) {
        contenedor.innerHTML = '<div class="dashboard-empty">Todavía no hay datos de ventas.</div>';
        return;
    }

    const maximo = Math.max(...meses.map(item => Number(item.ingresos) || 0), 1);

    contenedor.innerHTML = meses.map(item => {
        const ingresos = Number(item.ingresos) || 0;
        const alto = ingresos === 0 ? 4 : Math.max(10, (ingresos / maximo) * 100);

        return `
            <div class="dashboard-bar-column" title="${escaparDashboard(item.etiqueta)}: ${formatoMoneda(ingresos)}">
                <div class="dashboard-bar-value">${formatoMonedaCompacta(ingresos)}</div>
                <div class="dashboard-bar-track">
                    <span class="dashboard-bar-fill" style="height:${alto}%"></span>
                </div>
                <strong>${escaparDashboard(item.etiqueta || "-")}</strong>
                <small>${numero(item.pagos)} pagos</small>
            </div>
        `;
    }).join("");
}

function renderizarTopPaquetes(paquetes) {
    const contenedor = document.getElementById("topPaquetes");
    if (!contenedor) return;

    if (!Array.isArray(paquetes) || !paquetes.length) {
        contenedor.innerHTML = '<div class="dashboard-empty">Todavía no existen reservas para generar el ranking.</div>';
        return;
    }

    const maxReservas = Math.max(...paquetes.map(item => numero(item.reservas)), 1);

    contenedor.innerHTML = paquetes.map((item, indice) => `
        <div class="dashboard-ranking-item">
            <div class="dashboard-ranking-number">${indice + 1}</div>
            <div class="dashboard-ranking-info">
                <div>
                    <strong>${escaparDashboard(item.nombre || "Paquete")}</strong>
                    <span>${escaparDashboard(item.destino || "-")}</span>
                </div>
                <div class="dashboard-ranking-meta">
                    <b>${numero(item.reservas)} reservas</b>
                    <span>${numero(item.personas)} viajeros</span>
                </div>
                <div class="dashboard-ranking-bar"><span style="width:${Math.max(8, (numero(item.reservas) / maxReservas) * 100)}%"></span></div>
            </div>
        </div>
    `).join("");
}

function renderizarReservasRecientes(reservas) {
    const tabla = document.getElementById("tablaReservasRecientes");
    if (!tabla) return;

    if (!Array.isArray(reservas) || !reservas.length) {
        tabla.innerHTML = '<tr><td colspan="4"><div class="dashboard-empty">Todavía no existen reservas.</div></td></tr>';
        return;
    }

    tabla.innerHTML = reservas.map(reserva => `
        <tr>
            <td>
                <div class="dashboard-client-cell">
                    <strong>${escaparDashboard(reserva.cliente || "Cliente")}</strong>
                    <small>${formatearFechaCorta(reserva.fechaReserva)}</small>
                </div>
            </td>
            <td>${escaparDashboard(reserva.paquete || "-")}</td>
            <td><strong>${formatoMoneda(reserva.total)}</strong></td>
            <td><span class="dashboard-state ${claseEstado(reserva.estado)}">${escaparDashboard(reserva.estado || "-")}</span></td>
        </tr>
    `).join("");
}

async function peticionDashboard(url, opciones = {}) {
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

    const texto = await respuesta.text();
    let resultado = {};

    if (texto) {
        try { resultado = JSON.parse(texto); }
        catch { resultado = { mensaje: texto }; }
    }

    if (respuesta.status === 401) {
        limpiarDatosSesion();
        window.alert("Tu sesión ha vencido. Inicia sesión nuevamente.");
        window.location.href = "../index.html";
        throw new Error("Sesión vencida.");
    }

    if (respuesta.status === 403) {
        throw new Error("No tienes permisos para ver el dashboard.");
    }

    if (!respuesta.ok) {
        throw new Error(resultado?.mensaje || resultado?.title || `Error ${respuesta.status} al cargar el dashboard.`);
    }

    return resultado;
}

function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2
    }).format(Number(valor) || 0);
}

function formatoMonedaCompacta(valor) {
    const numeroValor = Number(valor) || 0;
    if (numeroValor >= 1000000) return `S/ ${(numeroValor / 1000000).toFixed(1)}M`;
    if (numeroValor >= 1000) return `S/ ${(numeroValor / 1000).toFixed(1)}K`;
    return `S/ ${Math.round(numeroValor)}`;
}

function formatearFechaCorta(valor) {
    if (!valor) return "-";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "-";

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(fecha);
}

function claseEstado(estado) {
    const valor = String(estado || "").toLowerCase();
    if (valor.includes("confirm")) return "success";
    if (valor.includes("cancel")) return "danger";
    return "pending";
}

function numero(valor) {
    const resultado = Number(valor);
    return Number.isFinite(resultado) ? resultado : 0;
}

function asignarTextoDashboard(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = String(valor ?? "");
}

function asignarAncho(id, porcentaje) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.style.width = `${Math.max(0, Math.min(100, porcentaje))}%`;
}

function mostrarMensajeDashboard(mensaje, tipo) {
    const elemento = document.getElementById("mensajeDashboard");
    if (!elemento) return;
    elemento.textContent = mensaje || "";
    elemento.className = `admin-message show ${tipo || ""}`;
}

function limpiarMensajeDashboard() {
    const elemento = document.getElementById("mensajeDashboard");
    if (!elemento) return;
    elemento.textContent = "";
    elemento.className = "admin-message";
}

function escaparDashboard(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
