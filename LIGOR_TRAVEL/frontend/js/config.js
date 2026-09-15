"use strict";

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================

const API_HOST = window.LIGOR_API_URL || "http://localhost:5232";

const API_CONFIG = {
    backendUrl: API_HOST,

    baseUrl: `${API_HOST}/api`,

    endpoints: {
        login: "/Auth/login",
        usuarios: "/Usuarios",
        paquetes: "/Paquetes",
        reservas: "/Reservas",
        pagos: "/Pagos",
        opiniones: "/Opiniones",
        recomendaciones: "/Recomendaciones",
        mensajes: "/Mensajes",
        dashboard: "/Dashboard",
        configuracionSitio: "/ConfiguracionSitio"
    }
};


// =====================================================
// CONFIGURACIÓN GOOGLE MAPS
// =====================================================

const GOOGLE_MAPS_CONFIG = {

    apiKey: "TU_API_KEY_DE_GOOGLE_MAPS"

};


// =====================================================
// CONSTRUIR URL DE API
// =====================================================

function obtenerUrlApi(endpoint) {

    if (!endpoint) {

        console.error(
            "Endpoint recibido:",
            endpoint
        );

        throw new Error(
            "No se proporcionó un endpoint para la API."
        );
    }

    const ruta =
        String(endpoint).startsWith("/")
            ? String(endpoint)
            : `/${endpoint}`;

    return `${API_CONFIG.baseUrl}${ruta}`;
}


// =====================================================
// AUTENTICACIÓN
// =====================================================

const AUTH_ENDPOINTS = {

    login:
        obtenerUrlApi(
            API_CONFIG.endpoints.login
        ),

    registro:
        obtenerUrlApi(
            API_CONFIG.endpoints.usuarios
        )
};