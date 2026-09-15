/* ============================================================
   LIGOR TRAVEL
   EXPLORADOR DE DESTINOS
   MAPA + SATÉLITE + RUTAS + UBICACIÓN
============================================================ */


/* ============================================================
   VARIABLES
============================================================ */

let mapa = null;

let marcadorUsuario = null;

let marcadorDestino = null;

let infoUsuario = null;

let infoDestino = null;

let capaTrafico = null;

let rutaActual = null;

let destinoSeleccionado = null;


/* ============================================================
   DESTINOS DE LIGOR TRAVEL
============================================================ */

const destinos = {

    Cusco: {

        nombre: "Cusco",

        lat: -13.53195,

        lng: -71.96746,

        descripcion:
            "Destino ideal para conocer historia, cultura y naturaleza.",

        temporada:
            "La temporada seca, especialmente entre mayo y septiembre, suele ser favorable para actividades al aire libre.",

        categoria:
            "Historia, cultura y naturaleza"

    },


    Mancora: {

        nombre: "Máncora",

        lat: -4.10704,

        lng: -81.04713,

        descripcion:
            "Destino de playa ideal para descansar, disfrutar del mar y realizar actividades acuáticas.",

        temporada:
            "Los meses más cálidos suelen ser atractivos para disfrutar de la playa.",

        categoria:
            "Playa y descanso"

    },


    Arequipa: {

        nombre: "Arequipa",

        lat: -16.40905,

        lng: -71.53745,

        descripcion:
            "Ciudad conocida por su arquitectura, gastronomía y paisajes naturales.",

        temporada:
            "La época seca suele ser favorable para recorrer la ciudad y realizar excursiones.",

        categoria:
            "Cultura y aventura"

    },


    Paracas: {

        nombre: "Paracas",

        lat: -13.83430,

        lng: -76.25020,

        descripcion:
            "Destino costero con paisajes naturales, fauna marina y actividades de aventura.",

        temporada:
            "Es un destino que puede visitarse durante gran parte del año.",

        categoria:
            "Mar, naturaleza y aventura"

    }

};


/* ============================================================
   INICIALIZAR MAPA
============================================================ */

function iniciarMapa() {

    const centroPeru = {

        lat: -9.19,

        lng: -75.0152

    };


    mapa = new google.maps.Map(

        document.getElementById("map"),

        {

            center: centroPeru,

            zoom: 5,

            mapTypeId: "roadmap",

            streetViewControl: false,

            fullscreenControl: true,

            mapTypeControl: false,

            zoomControl: true,

            gestureHandling: "greedy"

        }

    );


    capaTrafico =
        new google.maps.TrafficLayer();


    cambiarEstadoMapa(
        "Mapa listo",
        "🗺️"
    );


    console.log(
        "Ligor Travel: mapa inicializado correctamente."
    );

}


/* ============================================================
   CAMBIAR ESTADO
============================================================ */

function cambiarEstadoMapa(
    texto,
    icono = "🗺️"
) {

    const estado =
        document.getElementById(
            "estadoMapa"
        );

    const estadoIcono =
        document.getElementById(
            "estadoMapaIcono"
        );


    if (estado) {

        estado.textContent = texto;

    }


    if (estadoIcono) {

        estadoIcono.textContent = icono;

    }

}


/* ============================================================
   MOSTRAR DESTINO
============================================================ */

function seleccionarDestino(
    nombreDestino
) {

    const destino =
        buscarDestino(
            nombreDestino
        );


    if (!destino) {

        console.warn(
            "Destino no encontrado:",
            nombreDestino
        );

        return;

    }


    destinoSeleccionado =
        destino;


    /* -----------------------------------------
       CENTRAR MAPA
    ----------------------------------------- */

    mapa.setCenter({

        lat: destino.lat,

        lng: destino.lng

    });


    mapa.setZoom(13);


    /* -----------------------------------------
       ELIMINAR MARCADOR ANTERIOR
    ----------------------------------------- */

    if (marcadorDestino) {

        marcadorDestino.setMap(null);

    }


    /* -----------------------------------------
       CREAR MARCADOR
    ----------------------------------------- */

    marcadorDestino =
        new google.maps.Marker({

            position: {

                lat: destino.lat,

                lng: destino.lng

            },

            map: mapa,

            title: destino.nombre,

            animation:
                google.maps.Animation.DROP

        });


    /* -----------------------------------------
       MOSTRAR INFORMACIÓN
    ----------------------------------------- */

    mostrarInformacionDestino(
        destino
    );


    cambiarEstadoMapa(
        destino.nombre,
        "📍"
    );


    /* -----------------------------------------
       SI TENEMOS UBICACIÓN,
       CALCULAR RUTA
    ----------------------------------------- */

    if (infoUsuario) {

        calcularRuta(
            infoUsuario,
            destino
        );

    }

}


/* ============================================================
   BUSCAR DESTINO
============================================================ */

function buscarDestino(
    nombre
) {

    if (!nombre) {

        return null;

    }


    const texto =
        normalizarTexto(
            nombre
        );


    for (
        const clave in destinos
    ) {

        const destino =
            destinos[clave];


        if (
            normalizarTexto(
                destino.nombre
            ) === texto
        ) {

            return destino;

        }

    }


    return null;

}


/* ============================================================
   NORMALIZAR TEXTO
============================================================ */

function normalizarTexto(
    texto
) {

    return String(texto)

        .toLowerCase()

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .trim();

}


/* ============================================================
   MOSTRAR INFORMACIÓN
============================================================ */

function mostrarInformacionDestino(
    destino
) {

    const contenedor =
        document.getElementById(
            "informacionDestino"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <div class="destino-seleccionado">

            <h2>
                📍 ${destino.nombre}
            </h2>

            <p class="descripcion">
                ${destino.descripcion}
            </p>

            <div class="dato-destino">

                🧭

                <strong>
                    Categoría:
                </strong>

                <span>
                    ${destino.categoria}
                </span>

            </div>


            <div class="dato-destino">

                📅

                <strong>
                    Temporada:
                </strong>

                <span>
                    ${destino.temporada}
                </span>

            </div>


            <button
                type="button"
                id="btnRutaDestino"
                class="btn-ubicacion"
            >
                🚗 Cómo llegar
            </button>

        </div>

    `;


    const btnRuta =
        document.getElementById(
            "btnRutaDestino"
        );


    btnRuta?.addEventListener(
        "click",
        () => {

            if (!infoUsuario) {

                obtenerUbicacionUsuario();

                return;

            }


            calcularRuta(
                infoUsuario,
                destino
            );

        }
    );

}


/* ============================================================
   OBTENER UBICACIÓN DEL USUARIO
============================================================ */

function obtenerUbicacionUsuario() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "Tu navegador no permite obtener la ubicación."
        );

        return;

    }


    cambiarEstadoMapa(
        "Obteniendo ubicación...",
        "📍"
    );


    navigator.geolocation.getCurrentPosition(

        function (posicion) {

            const lat =
                posicion.coords.latitude;

            const lng =
                posicion.coords.longitude;


            infoUsuario = {

                lat: lat,

                lng: lng

            };


            mostrarUbicacionUsuario();


            cambiarEstadoMapa(
                "Ubicación encontrada",
                "📍"
            );


            if (
                destinoSeleccionado
            ) {

                calcularRuta(
                    infoUsuario,
                    destinoSeleccionado
                );

            }

        },

        function (error) {

            console.error(
                "Error de geolocalización:",
                error
            );


            cambiarEstadoMapa(
                "No se pudo obtener tu ubicación",
                "⚠️"
            );


            alert(
                "No se pudo obtener tu ubicación. " +
                "Verifica que hayas permitido el acceso a tu ubicación."
            );

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}


/* ============================================================
   MOSTRAR UBICACIÓN
============================================================ */

function mostrarUbicacionUsuario() {

    if (!infoUsuario) {

        return;

    }


    if (marcadorUsuario) {

        marcadorUsuario.setMap(null);

    }


    marcadorUsuario =
        new google.maps.Marker({

            position: infoUsuario,

            map: mapa,

            title: "Tu ubicación",

            icon: {

                path:
                    google.maps.SymbolPath
                        .CIRCLE,

                scale: 9,

                fillColor: "#2563eb",

                fillOpacity: 1,

                strokeColor: "#ffffff",

                strokeWeight: 3

            }

        });


    mapa.setCenter(
        infoUsuario
    );


    mapa.setZoom(12);

}


/* ============================================================
   CALCULAR RUTA
============================================================ */

async function calcularRuta(
    origen,
    destino
) {

    if (!origen || !destino) {

        return;

    }


    if (
        typeof google === "undefined" ||
        !google.maps
    ) {

        return;

    }


    cambiarEstadoMapa(
        "Calculando ruta...",
        "🚗"
    );


    try {

        const origenGoogle =
            new google.maps.LatLng(
                origen.lat,
                origen.lng
            );


        const destinoGoogle =
            new google.maps.LatLng(
                destino.lat,
                destino.lng
            );


        /*
         * Usamos la biblioteca Routes
         * disponible en Google Maps.
         */

        const {
            Route
        } =
            await google.maps.importLibrary(
                "routes"
            );


        const { routes } =
            await Route.computeRoutes({

                origin:
                    origenGoogle,

                destination:
                    destinoGoogle,

                travelMode:
                    "DRIVING",

                fields: [

                    "path",

                    "legs",

                    "distanceMeters",

                    "durationMillis",

                    "viewport"

                ]

            });


        if (
            !routes ||
            routes.length === 0
        ) {

            throw new Error(
                "No se encontró una ruta."
            );

        }


        rutaActual =
            routes[0];


        /* -----------------------------------------
           DIBUJAR RUTA
        ----------------------------------------- */

        if (
            rutaActual.path
        ) {

            new google.maps.Polyline({

                path:
                    rutaActual.path,

                map: mapa,

                strokeColor:
                    "#4f46e5",

                strokeOpacity:
                    0.9,

                strokeWeight:
                    6

            });

        }


        /* -----------------------------------------
           INFORMACIÓN
        ----------------------------------------- */

        const distanciaKm =
            rutaActual.distanceMeters
                ? (
                    rutaActual.distanceMeters
                    / 1000
                ).toFixed(1)
                : null;


        const minutos =
            rutaActual.durationMillis
                ? Math.round(
                    rutaActual.durationMillis
                    / 60000
                )
                : null;


        mostrarInformacionRuta({

            distancia:
                distanciaKm,

            minutos:
                minutos,

            destino:
                destino

        });


        cambiarEstadoMapa(
            "Ruta calculada",
            "🚗"
        );


    }
    catch (error) {

        console.error(
            "Error calculando ruta:",
            error
        );


        cambiarEstadoMapa(
            "No se pudo calcular la ruta",
            "⚠️"
        );


        /*
         * Si todavía no está configurada
         * Routes API, mostramos una alternativa.
         */

        alert(
            "No se pudo calcular la ruta.\n\n" +
            "Verifica que Routes API esté habilitada " +
            "en tu proyecto de Google Cloud."
        );

    }

}


/* ============================================================
   INFORMACIÓN DE RUTA
============================================================ */

function mostrarInformacionRuta(
    datos
) {

    const contenedor =
        document.getElementById(
            "informacionDestino"
        );


    if (!contenedor) {

        return;

    }


    const destino =
        datos.destino;


    contenedor.innerHTML = `

        <div class="destino-seleccionado">

            <h2>
                🚗 Ruta hacia ${destino.nombre}
            </h2>

            <p class="descripcion">
                Ruta calculada desde tu ubicación
                actual.
            </p>

            <div class="dato-destino">

                📏

                <strong>
                    Distancia:
                </strong>

                <span>
                    ${
                        datos.distancia !== null
                            ? datos.distancia + " km"
                            : "No disponible"
                    }
                </span>

            </div>


            <div class="dato-destino">

                ⏱️

                <strong>
                    Tiempo estimado:
                </strong>

                <span>
                    ${
                        datos.minutos !== null
                            ? datos.minutos + " min"
                            : "No disponible"
                    }
                </span>

            </div>


            <div class="dato-destino">

                📅

                <strong>
                    Temporada:
                </strong>

                <span>
                    ${destino.temporada}
                </span>

            </div>


            <button
                type="button"
                id="btnVolverDestino"
                class="btn-ubicacion"
            >
                📍 Ver destino
            </button>

        </div>

    `;


    document
        .getElementById(
            "btnVolverDestino"
        )
        ?.addEventListener(

            "click",

            () => {

                seleccionarDestino(
                    destino.nombre
                );

            }

        );

}


/* ============================================================
   CAMBIAR MAPA NORMAL
============================================================ */

function activarMapaNormal() {

    if (!mapa) {

        return;

    }


    mapa.setMapTypeId(
        "roadmap"
    );


    actualizarBotonesMapa(
        "btnMapaNormal"
    );

}


/* ============================================================
   CAMBIAR MAPA SATÉLITE
============================================================ */

function activarMapaSatelite() {

    if (!mapa) {

        return;

    }


    /*
     * HYBRID muestra imágenes
     * satelitales + nombres.
     */

    mapa.setMapTypeId(
        "hybrid"
    );


    actualizarBotonesMapa(
        "btnMapaSatelite"
    );

}


/* ============================================================
   TRÁFICO
============================================================ */

function activarTrafico() {

    if (!mapa || !capaTrafico) {

        return;

    }


    /*
     * Si ya está visible,
     * lo quitamos.
     */

    if (
        capaTrafico.getMap()
    ) {

        capaTrafico.setMap(
            null
        );


        document
            .getElementById(
                "btnTrafico"
            )
            ?.classList.remove(
                "activo"
            );

        return;

    }


    capaTrafico.setMap(
        mapa
    );


    document
        .getElementById(
            "btnTrafico"
        )
        ?.classList.add(
            "activo"
        );

}


/* ============================================================
   BOTONES MAPA
============================================================ */

function actualizarBotonesMapa(
    idActivo
) {

    document
        .querySelectorAll(
            ".control-mapa"
        )
        .forEach(

            boton => {

                boton.classList.remove(
                    "activo"
                );

            }

        );


    document
        .getElementById(
            idActivo
        )
        ?.classList.add(
            "activo"
        );

}


/* ============================================================
   BUSCADOR
============================================================ */

function ejecutarBusqueda() {

    const input =
        document.getElementById(
            "buscarDestino"
        );


    if (!input) {

        return;

    }


    const texto =
        input.value.trim();


    if (!texto) {

        return;

    }


    const destino =
        buscarDestino(
            texto
        );


    if (destino) {

        seleccionarDestino(
            destino.nombre
        );

        return;

    }


    buscarLugarGoogle(
        texto
    );

}


/* ============================================================
   BUSCAR LUGAR CON GOOGLE
============================================================ */

function buscarLugarGoogle(
    texto
) {

    if (!mapa) {

        return;

    }


    const servicio =
        new google.maps.places
            .PlacesService(
                mapa
            );


    servicio.findPlaceFromQuery(

        {

            query:
                texto + ", Perú",

            fields: [

                "name",

                "geometry",

                "formatted_address"

            ]

        },

        function (
            resultados,
            status
        ) {

            if (
                status !==
                google.maps.places
                    .PlacesServiceStatus
                    .OK ||
                !resultados ||
                !resultados.length
            ) {

                alert(
                    "No encontramos ese destino."
                );

                return;

            }


            const lugar =
                resultados[0];


            const posicion =
                lugar.geometry.location;


            mapa.setCenter(
                posicion
            );


            mapa.setZoom(
                14
            );


            if (marcadorDestino) {

                marcadorDestino.setMap(
                    null
                );

            }


            marcadorDestino =
                new google.maps.Marker({

                    map: mapa,

                    position:
                        posicion,

                    title:
                        lugar.name

                });


            cambiarEstadoMapa(
                lugar.name,
                "📍"
            );


            const contenedor =
                document.getElementById(
                    "informacionDestino"
                );


            if (contenedor) {

                contenedor.innerHTML = `

                    <div
                        class="destino-seleccionado"
                    >

                        <h2>
                            📍 ${lugar.name}
                        </h2>

                        <p
                            class="descripcion"
                        >
                            ${lugar.formatted_address || ""}
                        </p>

                        <button
                            type="button"
                            id="btnCalcularLugar"
                            class="btn-ubicacion"
                        >
                            🚗 Cómo llegar
                        </button>

                    </div>

                `;


                document
                    .getElementById(
                        "btnCalcularLugar"
                    )
                    ?.addEventListener(

                        "click",

                        () => {

                            if (!infoUsuario) {

                                obtenerUbicacionUsuario();

                                return;

                            }


                            const destinoGoogle = {

                                nombre:
                                    lugar.name,

                                lat:
                                    posicion.lat(),

                                lng:
                                    posicion.lng(),

                                descripcion:
                                    lugar.formatted_address || "",

                                temporada:
                                    "Ligor IA analizará la mejor temporada para este destino.",

                                categoria:
                                    "Destino turístico"

                            };


                            destinoSeleccionado =
                                destinoGoogle;


                            calcularRuta(

                                infoUsuario,

                                destinoGoogle

                            );

                        }

                    );

            }

        }

    );

}


/* ============================================================
   RESULTADOS DE BUSQUEDA RÁPIDA
============================================================ */

function mostrarResultadosBusqueda(
    texto
) {

    const contenedor =
        document.getElementById(
            "resultadosBusqueda"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    if (!texto) {

        return;

    }


    const textoNormalizado =
        normalizarTexto(
            texto
        );


    const encontrados =
        Object.values(
            destinos
        ).filter(

            destino => {

                return normalizarTexto(
                    destino.nombre
                ).includes(
                    textoNormalizado
                );

            }

        );


    encontrados.forEach(

        destino => {

            const boton =
                document.createElement(
                    "button"
                );


            boton.type =
                "button";


            boton.className =
                "resultado-busqueda-item";


            boton.innerHTML =
                `📍 ${destino.nombre}`;


            boton.addEventListener(

                "click",

                () => {

                    seleccionarDestino(
                        destino.nombre
                    );


                    document
                        .getElementById(
                            "buscarDestino"
                        )
                        .value =
                        destino.nombre;


                    contenedor.innerHTML =
                        "";

                }

            );


            contenedor.appendChild(
                boton
            );

        }

    );

}


/* ============================================================
   MODAL LIGOR IA
============================================================ */

function abrirModalIA() {

    const modal =
        document.getElementById(
            "modalLigorIA"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "visible"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* ============================================================
   CERRAR MODAL
============================================================ */

function cerrarModalIA() {

    const modal =
        document.getElementById(
            "modalLigorIA"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "visible"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ============================================================
   RECOMENDACIÓN IA
============================================================ */

async function solicitarRecomendacionIA() {

    const preferencia =
        document.getElementById(
            "preferenciaIA"
        )?.value;


    const presupuesto =
        document.getElementById(
            "presupuestoIA"
        )?.value;


    const mes =
        document.getElementById(
            "mesIA"
        )?.value;


    const resultado =
        document.getElementById(
            "resultadoIA"
        );


    if (!resultado) {

        return;

    }


    if (
        !preferencia ||
        !presupuesto ||
        !mes
    ) {

        resultado.innerHTML = `

            <div
                class="resultado-ia-card"
            >

                <h3>
                    ⚠️ Faltan datos
                </h3>

                <p>
                    Completa tus preferencias,
                    presupuesto y mes de viaje.
                </p>

            </div>

        `;

        return;

    }


    resultado.innerHTML = `

        <div
            class="resultado-ia-card"
        >

            <h3>
                🤖 Analizando...
            </h3>

            <p>
                Ligor IA está buscando
                una recomendación.
            </p>

        </div>

    `;


    /*
     * Por ahora usamos una recomendación
     * local.
     *
     * En la siguiente etapa vamos a conectar
     * esto directamente con:
     *
     * /api/Recomendaciones
     *
     * y los paquetes de tu base de datos.
     */


    setTimeout(

        () => {

            const recomendacion =
                generarRecomendacionLocal({

                    preferencia:
                        preferencia,

                    presupuesto:
                        Number(
                            presupuesto
                        ),

                    mes:
                        mes

                });


            resultado.innerHTML = `

                <div
                    class="resultado-ia-card"
                >

                    <h3>
                        ✨ ${recomendacion.destino}
                    </h3>

                    <p>
                        ${recomendacion.mensaje}
                    </p>

                    <p>
                        📅
                        ${recomendacion.temporada}
                    </p>

                    <p>
                        💰
                        Presupuesto:
                        S/ ${presupuesto}
                    </p>

                    <button
                        type="button"
                        id="btnIrRecomendacion"
                        class="btn-recomendar"
                    >
                        📍 Ver destino en el mapa
                    </button>

                </div>

            `;


            document
                .getElementById(
                    "btnIrRecomendacion"
                )
                ?.addEventListener(

                    "click",

                    () => {

                        cerrarModalIA();

                        seleccionarDestino(
                            recomendacion.destino
                        );

                    }

                );

        },

        800

    );

}


/* ============================================================
   RECOMENDACIÓN LOCAL TEMPORAL
============================================================ */

function generarRecomendacionLocal(
    datos
) {

    const mes =
        normalizarTexto(
            datos.mes
        );


    if (
        datos.preferencia ===
        "playa"
    ) {

        return {

            destino:
                "Mancora",

            mensaje:
                "Por tu interés en la playa, Máncora puede ser una buena opción.",

            temporada:
                "Los meses cálidos suelen ser atractivos para disfrutar del destino."

        };

    }


    if (
        datos.preferencia ===
        "naturaleza"
    ) {

        return {

            destino:
                "Cusco",

            mensaje:
                "Cusco combina naturaleza, cultura y actividades al aire libre.",

            temporada:
                "La temporada seca suele ser favorable para excursiones."

        };

    }


    if (
        datos.preferencia ===
        "cultura"
    ) {

        return {

            destino:
                "Arequipa",

            mensaje:
                "Arequipa ofrece arquitectura, gastronomía y experiencias culturales.",

            temporada:
                "La época seca suele ser cómoda para recorrer la ciudad."

        };

    }


    if (
        datos.preferencia ===
        "aventura"
    ) {

        return {

            destino:
                "Paracas",

            mensaje:
                "Paracas ofrece actividades de aventura y contacto con la naturaleza.",

            temporada:
                "Puede visitarse durante gran parte del año."

        };

    }


    return {

        destino:
            "Cusco",

        mensaje:
            "Cusco es una de las opciones turísticas más completas de Perú.",

        temporada:
            `Para ${mes || "tu fecha"} Ligor IA analizará posteriormente los datos climáticos y turísticos.`

    };

}


/* ============================================================
   EVENTOS
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        /* -----------------------------------------
           DESTINOS RÁPIDOS
        ----------------------------------------- */

        document
            .querySelectorAll(
                ".destino-card"
            )
            .forEach(

                boton => {

                    boton.addEventListener(

                        "click",

                        () => {

                            seleccionarDestino(
                                boton.dataset.destino
                            );

                        }

                    );

                }

            );


        /* -----------------------------------------
           BUSCAR
        ----------------------------------------- */

        document
            .getElementById(
                "btnBuscarDestino"
            )
            ?.addEventListener(

                "click",

                ejecutarBusqueda

            );


        document
            .getElementById(
                "buscarDestino"
            )
            ?.addEventListener(

                "input",

                function () {

                    mostrarResultadosBusqueda(
                        this.value
                    );

                }

            );


        document
            .getElementById(
                "buscarDestino"
            )
            ?.addEventListener(

                "keydown",

                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        ejecutarBusqueda();

                    }

                }

            );


        /* -----------------------------------------
           UBICACIÓN
        ----------------------------------------- */

        document
            .getElementById(
                "btnMiUbicacion"
            )
            ?.addEventListener(

                "click",

                obtenerUbicacionUsuario

            );


        /* -----------------------------------------
           MAPA NORMAL
        ----------------------------------------- */

        document
            .getElementById(
                "btnMapaNormal"
            )
            ?.addEventListener(

                "click",

                activarMapaNormal

            );


        /* -----------------------------------------
           SATÉLITE
        ----------------------------------------- */

        document
            .getElementById(
                "btnMapaSatelite"
            )
            ?.addEventListener(

                "click",

                activarMapaSatelite

            );


        /* -----------------------------------------
           TRÁFICO
        ----------------------------------------- */

        document
            .getElementById(
                "btnTrafico"
            )
            ?.addEventListener(

                "click",

                activarTrafico

            );


        /* -----------------------------------------
           LIGOR IA
        ----------------------------------------- */

        document
            .getElementById(
                "btnLigorIA"
            )
            ?.addEventListener(

                "click",

                abrirModalIA

            );


        document
            .getElementById(
                "btnCerrarLigorIA"
            )
            ?.addEventListener(

                "click",

                cerrarModalIA

            );


        document
            .getElementById(
                "btnRecomendarIA"
            )
            ?.addEventListener(

                "click",

                solicitarRecomendacionIA

            );


        /* -----------------------------------------
           CERRAR MODAL AL HACER CLICK AFUERA
        ----------------------------------------- */

        document
            .getElementById(
                "modalLigorIA"
            )
            ?.addEventListener(

                "click",

                function (event) {

                    if (
                        event.target === this
                    ) {

                        cerrarModalIA();

                    }

                }

            );

    }

);


/* ============================================================
   CARGAR GOOGLE MAPS
============================================================ */

function cargarGoogleMaps() {

    const apiKey =
        GOOGLE_MAPS_CONFIG.apiKey;

    if (!apiKey) {

        console.warn(
            "Ligor Travel: falta configurar Google Maps API Key."
        );

        cambiarEstadoMapa(
            "Falta configurar Google Maps",
            "⚠️"
        );

        return;
    }

    const script =
        document.createElement("script");

    script.src =
        "https://maps.googleapis.com/maps/api/js" +
        "?key=" +
        encodeURIComponent(apiKey) +
        "&libraries=places";

    script.async = true;
    script.defer = true;

    script.onload = function () {

        iniciarMapa();

    };

    script.onerror = function () {

        cambiarEstadoMapa(
            "Error cargando Google Maps",
            "❌"
        );

    };

    document.head.appendChild(script);
}


window.addEventListener(

    "load",

    cargarGoogleMaps

);