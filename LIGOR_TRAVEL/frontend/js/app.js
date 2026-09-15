"use strict";

// =====================================================
// ESTADO GENERAL
// =====================================================

let paquetesDisponibles = [];
let categoriaSeleccionada = null;


// =====================================================
// INICIALIZACIÓN GENERAL
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    configurarHeader();
    configurarMenu();
    configurarModalesGenerales();
    configurarExperiencias();
    configurarEnlacesNavegacion();
    configurarBotonVerTodosPaquetes();

    cargarConfiguracionSitio();
    cargarPaquetes();
});


// =====================================================
// CABECERA
// =====================================================

function configurarHeader() {
    const header =
        document.getElementById("header");

    if (!header) {
        return;
    }

    actualizarEstadoHeader();

    window.addEventListener(
        "scroll",
        actualizarEstadoHeader,
        {
            passive: true
        }
    );

    function actualizarEstadoHeader() {
        header.classList.toggle(
            "scrolled",
            window.scrollY > 60
        );
    }
}


// =====================================================
// MENÚ RESPONSIVE
// =====================================================

function configurarMenu() {
    const botonMenu =
        document.getElementById(
            "btnMenu"
        );

    const navigation =
        document.getElementById(
            "navigation"
        );

    if (
        !botonMenu ||
        !navigation
    ) {
        return;
    }


    botonMenu.addEventListener(
        "click",
        (event) => {
            event.stopPropagation();

            const abierto =
                navigation.classList.toggle(
                    "open"
                );

            actualizarIconoMenu(
                botonMenu,
                abierto
            );

            botonMenu.setAttribute(
                "aria-expanded",
                String(abierto)
            );
        }
    );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach((enlace) => {
            enlace.addEventListener(
                "click",
                () => {
                    navigation.classList.remove(
                        "open"
                    );

                    actualizarIconoMenu(
                        botonMenu,
                        false
                    );

                    botonMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        });


    document.addEventListener(
        "click",
        (event) => {
            if (
                !navigation.classList.contains(
                    "open"
                )
            ) {
                return;
            }

            if (
                navigation.contains(
                    event.target
                ) ||
                botonMenu.contains(
                    event.target
                )
            ) {
                return;
            }

            navigation.classList.remove(
                "open"
            );

            actualizarIconoMenu(
                botonMenu,
                false
            );

            botonMenu.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    );
}


function actualizarIconoMenu(
    botonMenu,
    estaAbierto
) {
    const icono =
        botonMenu.querySelector(
            "i"
        );

    if (!icono) {
        return;
    }

    icono.classList.toggle(
        "fa-bars",
        !estaAbierto
    );

    icono.classList.toggle(
        "fa-xmark",
        estaAbierto
    );
}


// =====================================================
// NAVEGACIÓN ACTIVA
// =====================================================

function configurarEnlacesNavegacion() {
    const enlaces =
        document.querySelectorAll(
            ".nav-link"
        );

    enlaces.forEach(
        (enlace) => {
            enlace.addEventListener(
                "click",
                () => {
                    enlaces.forEach(
                        (item) => {
                            item.classList.remove(
                                "active"
                            );
                        }
                    );

                    enlace.classList.add(
                        "active"
                    );
                }
            );
        }
    );
}


// =====================================================
// MODALES GENERALES
// =====================================================

function configurarModalesGenerales() {
    const modalLogin =
        document.getElementById(
            "modalLogin"
        );

    const moduloIA =
        document.getElementById(
            "moduloIA"
        );

    const botonLogin =
        document.getElementById(
            "btnLogin"
        );

    const botonesIA = [
        document.getElementById(
            "btnAbrirIA"
        ),

        document.getElementById(
            "btnHeroIA"
        ),

        document.getElementById(
            "btnContactoIA"
        )
    ];

    const botonCerrarIA =
        document.getElementById(
            "btnCerrarIA"
        );

    const botonComunidad =
        document.getElementById(
            "btnComunidad"
        );


    // =================================================
    // LOGIN
    // =================================================

    botonLogin?.addEventListener(
        "click",
        () => {
            const sesion =
                obtenerSesionActual();

            // Si hay sesión,
            // auth.js maneja el menú.
            if (sesion) {
                return;
            }

            abrirModalSeguro(
                modalLogin
            );
        }
    );


    // =================================================
    // LIGOR IA
    // =================================================

    botonesIA.forEach(
        (boton) => {
            boton?.addEventListener(
                "click",
                () => {
                    abrirModuloIA(
                        moduloIA
                    );
                }
            );
        }
    );


    botonCerrarIA?.addEventListener(
        "click",
        () => {
            cerrarModuloIA(
                moduloIA
            );
        }
    );


    moduloIA?.addEventListener(
        "click",
        (event) => {
            if (
                event.target ===
                moduloIA
            ) {
                cerrarModuloIA(
                    moduloIA
                );
            }
        }
    );


    // =================================================
    // COMUNIDAD
    // =================================================

    botonComunidad?.addEventListener(
        "click",
        () => {
            const sesion =
                obtenerSesionActual();

            if (!sesion) {
                mostrarMensaje(
                    "Debes iniciar sesión para ingresar a la comunidad."
                );

                abrirModalSeguro(
                    modalLogin
                );

                return;
            }

            mostrarMensaje(
                "El módulo Comunidad se desarrollará próximamente."
            );
        }
    );


    // =================================================
    // ESC
    // =================================================

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            if (
                moduloIA?.classList.contains(
                    "open"
                )
            ) {
                cerrarModuloIA(
                    moduloIA
                );
            }
        }
    );
}


// =====================================================
// MODAL LOGIN
// =====================================================

function abrirModalSeguro(
    modal
) {
    if (!modal) {
        return;
    }

    if (
        typeof abrirModalAuth ===
        "function"
    ) {
        abrirModalAuth(
            modal
        );

        return;
    }

    modal.classList.add(
        "open"
    );

    document.body.classList.add(
        "no-scroll"
    );
}


function cerrarModalSeguro(
    modal
) {
    if (!modal) {
        return;
    }

    if (
        typeof cerrarModalAuth ===
        "function"
    ) {
        cerrarModalAuth(
            modal
        );

        return;
    }

    modal.classList.remove(
        "open"
    );

    if (
        !document.querySelector(
            ".modal-overlay.open"
        )
    ) {
        document.body.classList.remove(
            "no-scroll"
        );
    }
}


// =====================================================
// LIGOR IA
// =====================================================

function abrirModuloIA(
    moduloIA
) {
    if (!moduloIA) {
        return;
    }

    moduloIA.classList.add(
        "open"
    );

    document.body.classList.add(
        "no-scroll"
    );
}


function cerrarModuloIA(
    moduloIA
) {
    if (!moduloIA) {
        return;
    }

    moduloIA.classList.remove(
        "open"
    );

    if (
        !document.querySelector(
            ".modal-overlay.open"
        )
    ) {
        document.body.classList.remove(
            "no-scroll"
        );
    }
}


// =====================================================
// EXPERIENCIAS
// =====================================================

function configurarExperiencias() {
    const tarjetas =
        document.querySelectorAll(
            ".experience-card"
        );

    tarjetas.forEach(
        (tarjeta) => {
            tarjeta.addEventListener(
                "click",
                () => {
                    const categoria =
                        tarjeta.dataset
                            .experience;

                    if (!categoria) {
                        return;
                    }


                    // Filtrar paquetes
                    filtrarPaquetesPorCategoria(
                        categoria
                    );


                    // Marcar visualmente
                    marcarExperienciaActiva(
                        tarjeta
                    );


                    // Bajar automáticamente
                    // hacia los paquetes.
                    const seccionPaquetes =
                        document.getElementById(
                            "paquetes"
                        );

                    seccionPaquetes
                        ?.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "start"
                        });
                }
            );
        }
    );
}


// =====================================================
// FILTRAR PAQUETES POR EXPERIENCIA
// =====================================================

function filtrarPaquetesPorCategoria(
    categoria
) {
    categoriaSeleccionada =
        categoria;


    const categoriaBuscada =
        normalizarCategoria(
            categoria
        );


    const paquetesFiltrados =
        paquetesDisponibles.filter(
            (paquete) => {
                const categoriaPaquete =
                    normalizarCategoria(
                        paquete.categoria
                    );

                return (
                    categoriaPaquete ===
                    categoriaBuscada
                );
            }
        );


    actualizarTituloPaquetes(
        categoria
    );


    renderizarPaquetes(
        paquetesFiltrados,
        categoria
    );
}


// =====================================================
// NORMALIZAR CATEGORÍA
// =====================================================

function normalizarCategoria(
    texto
) {
    return String(
        texto || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLowerCase();
}


// =====================================================
// MARCAR EXPERIENCIA ACTIVA
// =====================================================

function marcarExperienciaActiva(
    tarjetaActiva
) {
    document
        .querySelectorAll(
            ".experience-card"
        )
        .forEach(
            (tarjeta) => {
                tarjeta.classList.remove(
                    "active"
                );
            }
        );

    tarjetaActiva.classList.add(
        "active"
    );
}


// =====================================================
// TÍTULO PAQUETES
// =====================================================

function actualizarTituloPaquetes(
    categoria
) {
    const titulo =
        document.getElementById(
            "tituloPaquetes"
        );

    if (!titulo) {
        return;
    }

    if (categoria) {
        titulo.textContent =
            `Paquetes de ${categoria}`;
    } else {
        titulo.textContent =
            "Paquetes turísticos";
    }
}


// =====================================================
// MOSTRAR TODOS LOS PAQUETES
// =====================================================

function mostrarTodosLosPaquetes() {
    categoriaSeleccionada =
        null;

    actualizarTituloPaquetes(
        null
    );

    document
        .querySelectorAll(
            ".experience-card"
        )
        .forEach(
            (tarjeta) => {
                tarjeta.classList.remove(
                    "active"
                );
            }
        );


    renderizarPaquetes(
        paquetesDisponibles
    );
}


// =====================================================
// BOTÓN VER TODOS
// =====================================================

function configurarBotonVerTodosPaquetes() {
    document
        .getElementById(
            "btnVerTodosPaquetes"
        )
        ?.addEventListener(
            "click",
            () => {
                mostrarTodosLosPaquetes();

                document
                    .getElementById(
                        "paquetes"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "start"
                    });
            }
        );
}


// =====================================================
// CONFIGURACIÓN GENERAL DEL SITIO
// =====================================================

async function cargarConfiguracionSitio() {
    const url =
        obtenerUrlConfiguracionSitio();

    if (!url) {
        console.warn(
            "No existe configuración para ConfiguracionSitio."
        );

        return;
    }


    try {
        const respuesta =
            await fetch(
                url,
                {
                    method:
                        "GET",

                    headers: {
                        Accept:
                            "application/json"
                    },

                    cache:
                        "no-store"
                }
            );


        if (!respuesta.ok) {
            throw new Error(
                `ConfiguracionSitio respondió ${respuesta.status}.`
            );
        }


        const configuracion =
            await respuesta.json();


        aplicarConfiguracionSitio(
            configuracion
        );

    } catch (error) {
        console.warn(
            "No se pudo cargar la configuración del sitio:",
            error
        );

        /*
         * No detenemos el sitio.
         * Se conserva el contenido
         * predeterminado del HTML.
         */
    }
}


// =====================================================
// RENDER DEL EDITOR VISUAL
// =====================================================
function aplicarDisenoVisualHero(configuracion) {
    const hero = document.getElementById("inicio");
    if (!hero) return;
    hero.querySelector(".hero-custom-layer")?.remove();
    hero.classList.remove("editor-visual-active");
    if (!configuracion.heroDisenoJson) return;
    try {
        const diseno = JSON.parse(configuracion.heroDisenoJson);
        const fondoHero = document.getElementById("heroBackground");
        if (fondoHero) {
            const x = Number.isFinite(+diseno.fondoX) ? +diseno.fondoX : 50;
            const y = Number.isFinite(+diseno.fondoY) ? +diseno.fondoY : 50;
            fondoHero.style.backgroundPosition = `${x}% ${y}%`;
        }
        if (!Array.isArray(diseno.textos)) return;
        const capa = document.createElement("div");
        capa.className = "hero-custom-layer";
        diseno.textos.forEach(t => {
            const el = document.createElement("div");
            el.className = "hero-custom-text";
            el.textContent = t.texto || "";
            el.style.left = `${Number(t.x) || 0}%`;
            el.style.top = `${Number(t.y) || 0}%`;
            el.style.color = t.color || "#ffffff";
            el.style.fontFamily = t.fuente || "Arial";
            el.style.fontSize = `${Number(t.tamano) || 42}px`;
            el.style.setProperty("--editor-size", `${Number(t.tamano) || 42}px`);
            el.style.fontWeight = t.negrita ? "700" : "400";
            el.style.fontStyle = t.cursiva ? "italic" : "normal";
            capa.appendChild(el);
        });
        hero.appendChild(capa);
        hero.classList.add("editor-visual-active");
    } catch (error) {
        console.error("Diseño visual inválido:", error);
    }
}


// =====================================================
// URL CONFIGURACIÓN SITIO
// =====================================================

function obtenerUrlConfiguracionSitio() {
    if (
        typeof API_CONFIG !==
        "undefined" &&
        API_CONFIG.endpoints
            ?.configuracionSitio &&
        typeof obtenerUrlApi ===
        "function"
    ) {
        return obtenerUrlApi(
            API_CONFIG
                .endpoints
                .configuracionSitio
        );
    }

    return (
        "http://localhost:5232" +
        "/api/ConfiguracionSitio"
    );
}


// =====================================================
// APLICAR CONFIGURACIÓN DEL SITIO
// =====================================================

function aplicarConfiguracionSitio(
    configuracion
) {
    if (!configuracion) {
        return;
    }


    actualizarTextoElemento(
        "heroEtiquetaTexto",
        configuracion.heroEtiqueta
    );


    actualizarTextoElemento(
        "heroTitulo",
        configuracion.heroTitulo
    );


    actualizarTextoElemento(
        "heroSubtitulo",
        configuracion.heroSubtitulo
    );


    actualizarTextoElemento(
        "heroDescripcion",
        configuracion.heroDescripcion
    );


    actualizarTextoElemento(
        "heroBotonPrincipal",
        configuracion.heroBotonPrincipal
    );


    actualizarTextoElemento(
        "heroBotonIA",
        configuracion.heroBotonIA
    );


    // =================================================
    // DISEÑO LIBRE CREADO POR EL EDITOR VISUAL
    // =================================================

    aplicarDisenoVisualHero(configuracion);


    // =================================================
    // MOSTRAR / OCULTAR HERO
    // =================================================

    const hero =
        document.getElementById(
            "inicio"
        );


    if (hero) {
        hero.hidden =
            configuracion.heroActivo ===
            false;
    }


    // =================================================
    // IMAGEN HERO
    // =================================================

    const fondo =
        document.getElementById(
            "heroBackground"
        );


    if (fondo) {
        if (
            configuracion.heroImagen
        ) {
            const urlImagen =
                obtenerUrlImagenSitio(
                    configuracion
                        .heroImagen
                );


            fondo.style
                .backgroundImage =
                `url("${urlImagen}")`;

        } else {
            /*
             * Si el administrador elimina
             * su imagen personalizada,
             * vuelve a usarse la imagen
             * predeterminada del CSS.
             */

            fondo.style.removeProperty(
                "background-image"
            );
        }
    }


    // =================================================
    // WHATSAPP
    // =================================================

    actualizarWhatsapp(
        configuracion.whatsapp
    );


    // =================================================
    // REDES SOCIALES
    // =================================================

    actualizarEnlace(
        "footerFacebook",
        configuracion.facebook
    );


    actualizarEnlace(
        "footerInstagram",
        configuracion.instagram
    );


    actualizarEnlace(
        "footerTikTok",
        configuracion.tikTok
    );
}


// =====================================================
// TEXTO CONFIGURABLE
// =====================================================

function actualizarTextoElemento(
    id,
    valor
) {
    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return;
    }


    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {
        elemento.textContent =
            String(valor);
    }
}


// =====================================================
// ENLACES CONFIGURABLES
// =====================================================

function actualizarEnlace(
    id,
    url
) {
    const elemento =
        document.getElementById(
            id
        );

    if (
        !elemento ||
        !url
    ) {
        return;
    }

    elemento.href =
        String(url).trim();
}


// =====================================================
// WHATSAPP
// =====================================================

function actualizarWhatsapp(
    numero
) {
    if (!numero) {
        return;
    }


    const numeroLimpio =
        String(numero)
            .replace(
                /\D/g,
                ""
            );


    if (!numeroLimpio) {
        return;
    }


    const url =
        `https://wa.me/${numeroLimpio}`;


    const contacto =
        document.getElementById(
            "enlaceWhatsappContacto"
        );


    if (contacto) {
        contacto.href =
            url;
    }


    const footer =
        document.getElementById(
            "footerWhatsapp"
        );


    if (footer) {
        footer.href =
            url;
    }
}


// =====================================================
// IMAGEN DEL SITIO
// =====================================================

function obtenerUrlImagenSitio(
    ruta
) {
    if (!ruta) {
        return "";
    }


    const texto =
        String(ruta).trim();


    if (
        texto.startsWith(
            "http://"
        ) ||
        texto.startsWith(
            "https://"
        ) ||
        texto.startsWith(
            "data:"
        )
    ) {
        return texto;
    }


    const backend =
        obtenerBackendUrl();


    const rutaNormalizada =
        texto.startsWith("/")
            ? texto
            : `/${texto}`;


    return (
        backend +
        rutaNormalizada
    );
}


// =====================================================
// PAQUETES
// =====================================================

async function cargarPaquetes() {
    const contenedor =
        document.getElementById(
            "contenedorPaquetes"
        );


    if (!contenedor) {
        console.warn(
            "No se encontró #contenedorPaquetes."
        );

        return;
    }


    contenedor.setAttribute(
        "aria-busy",
        "true"
    );


    mostrarCargaPaquetes(
        contenedor
    );


    const urlPaquetes =
        obtenerUrlPaquetes();


    console.log(
        "Consultando paquetes:",
        urlPaquetes
    );


    try {
        const respuesta =
            await fetch(
                urlPaquetes,
                {
                    method:
                        "GET",

                    headers: {
                        Accept:
                            "application/json"
                    },

                    cache:
                        "no-store"
                }
            );


        if (!respuesta.ok) {
            throw new Error(
                `La API respondió con el estado ${respuesta.status}.`
            );
        }


        const resultado =
            await respuesta.json();


        const paquetes =
            obtenerListaPaquetes(
                resultado
            );


        // =================================================
        // SOLO PAQUETES ACTIVOS
        // =================================================

        paquetesDisponibles =
            paquetes.filter(
                (paquete) =>
                    paquete.activo !==
                    false
            );


        contenedor.setAttribute(
            "aria-busy",
            "false"
        );


        // Si había categoría seleccionada
        // volvemos a aplicar ese filtro.

        if (
            categoriaSeleccionada
        ) {
            filtrarPaquetesPorCategoria(
                categoriaSeleccionada
            );

            return;
        }


        renderizarPaquetes(
            paquetesDisponibles
        );

    } catch (error) {
        console.error(
            "Error al cargar paquetes:",
            error
        );


        contenedor.setAttribute(
            "aria-busy",
            "false"
        );


        mostrarErrorPaquetes(
            contenedor,
            error.message
        );
    }
}


// =====================================================
// RENDERIZAR PAQUETES
// =====================================================

function renderizarPaquetes(
    paquetes,
    categoria = null
) {
    const contenedor =
        document.getElementById(
            "contenedorPaquetes"
        );


    if (!contenedor) {
        return;
    }


    if (
        !Array.isArray(
            paquetes
        ) ||
        paquetes.length === 0
    ) {
        mostrarPaquetesFiltradosVacios(
            contenedor,
            categoria
        );

        return;
    }


    contenedor.innerHTML =
        paquetes
            .map(
                crearTarjetaPaquete
            )
            .join("");


    configurarImagenesPaquetes();

    configurarFavoritos();

    configurarBotonesReserva();
}


// =====================================================
// URL PAQUETES
// =====================================================

function obtenerUrlPaquetes() {
    if (
        typeof obtenerUrlApi ===
            "function" &&
        typeof API_CONFIG !==
            "undefined" &&
        API_CONFIG.endpoints
            ?.paquetes
    ) {
        return obtenerUrlApi(
            API_CONFIG
                .endpoints
                .paquetes
        );
    }


    return (
        "http://localhost:5232" +
        "/api/Paquetes"
    );
}


// =====================================================
// RESPUESTA PAQUETES
// =====================================================

function obtenerListaPaquetes(
    resultado
) {
    if (
        Array.isArray(
            resultado
        )
    ) {
        return resultado;
    }


    if (
        Array.isArray(
            resultado?.paquetes
        )
    ) {
        return resultado.paquetes;
    }


    if (
        Array.isArray(
            resultado?.data
        )
    ) {
        return resultado.data;
    }


    if (
        Array.isArray(
            resultado?.resultado
        )
    ) {
        return resultado.resultado;
    }


    throw new Error(
        "La respuesta de la API no contiene una lista válida de paquetes."
    );
}


// =====================================================
// CARGANDO PAQUETES
// =====================================================

function mostrarCargaPaquetes(
    contenedor
) {
    contenedor.innerHTML = `
        <div class="loading-box">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>
                Cargando paquetes turísticos...
            </p>

            <small>
                Estamos preparando las mejores
                experiencias para ti.
            </small>

        </div>
    `;
}


// =====================================================
// SIN PAQUETES GENERALES
// =====================================================

function mostrarPaquetesVacios(
    contenedor
) {
    contenedor.innerHTML = `
        <div class="loading-box">

            <i class="fa-regular fa-calendar-xmark"></i>

            <p>
                No hay paquetes turísticos
                disponibles actualmente.
            </p>

            <small>
                Pronto publicaremos nuevas experiencias.
            </small>

        </div>
    `;
}


// =====================================================
// SIN PAQUETES DE UNA CATEGORÍA
// =====================================================

function mostrarPaquetesFiltradosVacios(
    contenedor,
    categoria
) {
    if (!categoria) {
        mostrarPaquetesVacios(
            contenedor
        );

        return;
    }


    contenedor.innerHTML = `
        <div class="loading-box">

            <i class="fa-regular fa-calendar-xmark"></i>

            <p>
                Actualmente no hay paquetes
                de ${escaparHtml(categoria)}.
            </p>

            <small>
                Puedes explorar las demás
                experiencias disponibles.
            </small>

            <button
                type="button"
                class="primary-button"
                id="btnMostrarTodosPaquetes"
            >
                <i class="fa-solid fa-suitcase-rolling"></i>

                Ver todos los paquetes
            </button>

        </div>
    `;


    document
        .getElementById(
            "btnMostrarTodosPaquetes"
        )
        ?.addEventListener(
            "click",
            mostrarTodosLosPaquetes
        );
}


// =====================================================
// ERROR PAQUETES
// =====================================================

function mostrarErrorPaquetes(
    contenedor,
    detalle = ""
) {
    contenedor.innerHTML = `
        <div class="loading-box loading-box-error">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <p>
                No se pudieron cargar
                los paquetes turísticos.
            </p>

            <small>
                Verifica que el backend esté
                ejecutándose en
                http://localhost:5232
            </small>

            ${
                detalle
                    ? `
                        <span class="packages-error-detail">
                            ${escaparHtml(
                                detalle
                            )}
                        </span>
                    `
                    : ""
            }

            <button
                type="button"
                class="retry-packages-button"
                id="btnReintentarPaquetes"
            >
                <i class="fa-solid fa-rotate-right"></i>

                Reintentar
            </button>

        </div>
    `;


    document
        .getElementById(
            "btnReintentarPaquetes"
        )
        ?.addEventListener(
            "click",
            cargarPaquetes
        );
}


// =====================================================
// CREAR TARJETA DE PAQUETE
// =====================================================

function crearTarjetaPaquete(
    paquete
) {
    const id =
        convertirNumeroSeguro(
            paquete.id,
            0
        );


    const nombre =
        escaparHtml(
            paquete.nombre ||
            "Paquete turístico"
        );


    const destino =
        escaparHtml(
            paquete.destino ||
            "Perú"
        );


    const categoria =
        escaparHtml(
            paquete.categoria ||
            "Experiencia"
        );


    const descripcion =
        escaparHtml(
            paquete.descripcion ||
            "Descubre una experiencia turística inolvidable."
        );


    const duracion =
        convertirNumeroSeguro(
            paquete.duracionDias,
            1
        );


    const cupos =
        convertirNumeroSeguro(
            paquete.cupos,
            0
        );


    const precio =
        formatearPrecio(
            paquete.precio
        );


    const imagen =
        escaparAtributo(
            obtenerRutaImagen(
                paquete.imagen
            )
        );


    return `
        <article
            class="package-card"
            data-package-id="${id}"
            data-category="${categoria}"
        >

            <div class="package-image">

                <img
                    src="${imagen}"
                    alt="${nombre}"
                    loading="lazy"
                    class="package-photo"
                >

                <button
                    type="button"
                    class="favorite-button"
                    data-package-id="${id}"
                    aria-label="Agregar ${nombre} a favoritos"
                    aria-pressed="false"
                    title="Agregar a favoritos"
                >
                    <i class="fa-regular fa-heart"></i>
                </button>

            </div>


            <div class="package-content">

                <span class="package-location">

                    <i class="fa-solid fa-location-dot"></i>

                    ${destino}

                </span>


                <span class="package-category">
                    ${categoria}
                </span>


                <h3>
                    ${nombre}
                </h3>


                <p class="package-description">
                    ${descripcion}
                </p>


                <div class="package-meta">

                    <span>

                        <i class="fa-regular fa-clock"></i>

                        ${duracion}
                        ${
                            duracion === 1
                                ? "día"
                                : "días"
                        }

                    </span>


                    <span>

                        <i class="fa-solid fa-users"></i>

                        ${cupos}
                        ${
                            cupos === 1
                                ? "cupo"
                                : "cupos"
                        }

                    </span>

                </div>


                <div class="package-footer">

                    <div class="package-price">

                        <span>
                            Desde
                        </span>

                        <strong>
                            ${precio}
                        </strong>

                        <small>
                            por persona
                        </small>

                    </div>


                    <a
                        href="./detalle-paquete.html?id=${id}"
                        class="package-detail-button"
                        aria-label="Ver detalles de ${nombre}"
                    >
                        Ver detalles
                        <i class="fa-solid fa-eye"></i>
                    </a>

                    <button
                        type="button"
                        class="reserve-button"
                        data-package-id="${id}"
                        data-package-name="${nombre}"
                    >
                        Reservar

                        <i class="fa-solid fa-arrow-right"></i>
                    </button>

                </div>

            </div>

        </article>
    `;
}


// =====================================================
// IMÁGENES DE PAQUETES
// =====================================================

function obtenerRutaImagen(
    imagen
) {
    const imagenPredeterminada =
        "https://images.unsplash.com/photo-1526392060635-9d6019884377" +
        "?auto=format&fit=crop&w=900&q=80";


    if (!imagen) {
        return imagenPredeterminada;
    }


    const imagenLimpia =
        String(imagen).trim();


    if (!imagenLimpia) {
        return imagenPredeterminada;
    }


    // URL externa
    if (
        imagenLimpia.startsWith(
            "http://"
        ) ||
        imagenLimpia.startsWith(
            "https://"
        ) ||
        imagenLimpia.startsWith(
            "data:"
        )
    ) {
        return imagenLimpia;
    }


    const backendUrl =
        obtenerBackendUrl();


    if (
        imagenLimpia.startsWith(
            "/uploads/"
        )
    ) {
        return (
            backendUrl +
            imagenLimpia
        );
    }


    if (
        imagenLimpia.startsWith(
            "uploads/"
        )
    ) {
        return (
            backendUrl +
            "/" +
            imagenLimpia
        );
    }


    return (
        backendUrl +
        "/uploads/" +
        encodeURIComponent(
            imagenLimpia
        )
    );
}


// =====================================================
// BACKEND URL
// =====================================================

function obtenerBackendUrl() {
    if (
        typeof API_CONFIG !==
            "undefined" &&
        API_CONFIG.backendUrl
    ) {
        return API_CONFIG
            .backendUrl
            .replace(
                /\/+$/,
                ""
            );
    }


    return (
        "http://localhost:5232"
    );
}


// =====================================================
// IMAGEN DE RESPALDO
// =====================================================

function configurarImagenesPaquetes() {
    const respaldo =
        "https://images.unsplash.com/photo-1526392060635-9d6019884377" +
        "?auto=format&fit=crop&w=900&q=80";


    document
        .querySelectorAll(
            ".package-photo"
        )
        .forEach(
            (imagen) => {
                imagen.addEventListener(
                    "error",
                    () => {
                        if (
                            imagen.dataset
                                .fallbackAplicado ===
                            "true"
                        ) {
                            return;
                        }


                        imagen.dataset
                            .fallbackAplicado =
                            "true";


                        imagen.src =
                            respaldo;
                    }
                );
            }
        );
}


// =====================================================
// FAVORITOS
// =====================================================

function configurarFavoritos() {
    document
        .querySelectorAll(
            ".favorite-button"
        )
        .forEach(
            (boton) => {
                const idPaquete =
                    String(
                        boton.dataset
                            .packageId ||
                        ""
                    );


                const favoritos =
                    obtenerFavoritosGuardados();


                const esFavorito =
                    favoritos.includes(
                        idPaquete
                    );


                actualizarBotonFavorito(
                    boton,
                    esFavorito
                );


                boton.addEventListener(
                    "click",
                    () => {
                        alternarFavorito(
                            boton
                        );
                    }
                );
            }
        );
}


function alternarFavorito(
    boton
) {
    const idPaquete =
        String(
            boton.dataset
                .packageId ||
            ""
        );


    if (!idPaquete) {
        return;
    }


    const favoritos =
        obtenerFavoritosGuardados();


    const yaEsFavorito =
        favoritos.includes(
            idPaquete
        );


    let actualizados;


    if (yaEsFavorito) {
        actualizados =
            favoritos.filter(
                (id) =>
                    id !==
                    idPaquete
            );

    } else {
        actualizados = [
            ...favoritos,
            idPaquete
        ];
    }


    localStorage.setItem(
        "ligor_favoritos",
        JSON.stringify(
            actualizados
        )
    );


    actualizarBotonFavorito(
        boton,
        !yaEsFavorito
    );
}


function obtenerFavoritosGuardados() {
    try {
        const favoritos =
            JSON.parse(
                localStorage.getItem(
                    "ligor_favoritos"
                ) ||
                "[]"
            );


        if (
            !Array.isArray(
                favoritos
            )
        ) {
            return [];
        }


        return favoritos.map(
            String
        );

    } catch (error) {
        console.error(
            "Error leyendo favoritos:",
            error
        );

        return [];
    }
}


function actualizarBotonFavorito(
    boton,
    activo
) {
    if (!boton) {
        return;
    }


    const icono =
        boton.querySelector(
            "i"
        );


    boton.classList.toggle(
        "active",
        activo
    );


    icono?.classList.toggle(
        "fa-solid",
        activo
    );


    icono?.classList.toggle(
        "fa-regular",
        !activo
    );


    boton.setAttribute(
        "aria-pressed",
        String(activo)
    );


    boton.setAttribute(
        "title",
        activo
            ? "Quitar de favoritos"
            : "Agregar a favoritos"
    );
}


// =====================================================
// RESERVAS
// =====================================================

function configurarBotonesReserva() {
    document
        .querySelectorAll(
            ".reserve-button"
        )
        .forEach(
            (boton) => {
                boton.addEventListener(
                    "click",
                    () => {
                        const idPaquete =
                            Number(
                                boton.dataset
                                    .packageId
                            );


                        const nombre =
                            boton.dataset
                                .packageName ||
                            "este paquete";


                        reservarPaquete(
                            idPaquete,
                            nombre
                        );
                    }
                );
            }
        );
}


function reservarPaquete(
    idPaquete,
    nombrePaquete =
        "este paquete"
) {
    if (
        !Number.isInteger(
            idPaquete
        ) ||
        idPaquete <= 0
    ) {
        mostrarMensaje(
            "No se pudo identificar el paquete seleccionado."
        );

        return;
    }


    const sesion =
        obtenerSesionActual();


    if (!sesion) {
        mostrarMensaje(
            `Inicia sesión para reservar ${nombrePaquete}.`
        );


        abrirModalSeguro(
            document.getElementById(
                "modalLogin"
            )
        );


        return;
    }


    sessionStorage.setItem(
        "ligor_paquete_seleccionado",
        String(
            idPaquete
        )
    );


    mostrarMensaje(
        `Continuaremos con la reserva de ${nombrePaquete}.`
    );
}


// =====================================================
// SESIÓN
// =====================================================

function obtenerSesionActual() {
    if (
        typeof obtenerAlmacenamientoSesion ===
        "function"
    ) {
        return obtenerAlmacenamientoSesion();
    }


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


// =====================================================
// UTILIDADES
// =====================================================

function convertirNumeroSeguro(
    valor,
    valorPredeterminado = 0
) {
    const numero =
        Number(valor);


    return Number.isFinite(
        numero
    )
        ? numero
        : valorPredeterminado;
}


function formatearPrecio(
    valor
) {
    const precio =
        convertirNumeroSeguro(
            valor,
            0
        );


    return new Intl.NumberFormat(
        "es-PE",
        {
            style:
                "currency",

            currency:
                "PEN",

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    ).format(
        precio
    );
}


function escaparHtml(
    valor
) {
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


function escaparAtributo(
    valor
) {
    return escaparHtml(
        valor
    );
}


function mostrarMensaje(
    mensaje
) {
    window.alert(
        mensaje
    );
}