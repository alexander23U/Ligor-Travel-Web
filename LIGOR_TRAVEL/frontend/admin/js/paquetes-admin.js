"use strict";

let paquetesAdmin = [];
let paqueteEditando = null;
let nombreImagenActual = "";

document.addEventListener("DOMContentLoaded", () => {
    const autorizado = protegerModuloAdministrador();

    if (!autorizado) {
        return;
    }

    cargarDatosAdministrador();
    configurarEventosAdmin();
    cargarPaquetesAdmin();
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

    const rol = String(
        usuario.rol || ""
    )
        .trim()
        .toLowerCase();

    if (rol !== "administrador") {
        window.alert(
            "No tienes permisos para acceder al panel administrativo."
        );

        window.location.href = "../index.html";
        return false;
    }

    return true;
}


// =====================================================
// USUARIO
// =====================================================

function cargarDatosAdministrador() {
    const usuario = obtenerUsuarioSesion();

    if (!usuario) {
        return;
    }

    const nombreCompleto = [
        usuario.nombres,
        usuario.apellidos
    ]
        .filter(Boolean)
        .join(" ");

    const nombre =
        document.getElementById("adminNombre");

    const correo =
        document.getElementById("adminCorreo");

    if (nombre) {
        nombre.textContent =
            nombreCompleto || "Administrador";
    }

    if (correo) {
        correo.textContent =
            usuario.correo || "";
    }
}


// =====================================================
// EVENTOS
// =====================================================

function configurarEventosAdmin() {
    document
        .getElementById("btnNuevoPaquete")
        ?.addEventListener(
            "click",
            abrirModalNuevoPaquete
        );

    document
        .getElementById("btnCerrarModalPaquete")
        ?.addEventListener(
            "click",
            cerrarModalPaquete
        );

    document
        .getElementById("btnCancelarPaquete")
        ?.addEventListener(
            "click",
            cerrarModalPaquete
        );

    document
        .getElementById("modalPaquete")
        ?.addEventListener(
            "click",
            (event) => {
                if (
                    event.target.id ===
                    "modalPaquete"
                ) {
                    cerrarModalPaquete();
                }
            }
        );

    document
        .getElementById("formPaquete")
        ?.addEventListener(
            "submit",
            guardarPaquete
        );

    document
        .getElementById("buscarPaquete")
        ?.addEventListener(
            "input",
            aplicarFiltros
        );

    document
        .getElementById("filtroEstado")
        ?.addEventListener(
            "change",
            aplicarFiltros
        );

    document
        .getElementById("filtroCategoria")
        ?.addEventListener(
            "change",
            aplicarFiltros
        );

    document
        .getElementById("paqueteImagen")
        ?.addEventListener(
            "change",
            mostrarVistaPreviaImagen
        );

    document
        .getElementById("btnCerrarSesionAdmin")
        ?.addEventListener(
            "click",
            () => {
                const confirmar =
                    window.confirm(
                        "¿Deseas cerrar sesión?"
                    );

                if (!confirmar) {
                    return;
                }

                cerrarSesion();

                window.location.href =
                    "../index.html";
            }
        );

    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Escape") {
                cerrarModalPaquete();
            }
        }
    );
}


// =====================================================
// CARGAR PAQUETES
// =====================================================

async function cargarPaquetesAdmin() {
    const tabla =
        document.getElementById(
            "tablaPaquetes"
        );

    if (!tabla) {
        return;
    }

    try {
        tabla.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="admin-loading">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <span>
                            Cargando paquetes...
                        </span>
                    </div>
                </td>
            </tr>
        `;

        const respuesta =
            await fetch(
                obtenerUrlApi(
                    API_CONFIG.endpoints.paquetes
                ),
                {
                    method: "GET",

                    headers: {
                        Accept:
                            "application/json"
                    },

                    cache:
                        "no-store"
                }
            );

        const resultado =
            await leerRespuestaAdmin(
                respuesta
            );

        if (!respuesta.ok) {
            throw new Error(
                resultado?.mensaje ||
                `Error ${respuesta.status}`
            );
        }

        paquetesAdmin =
            Array.isArray(resultado)
                ? resultado
                : [];

        actualizarResumen();

        aplicarFiltros();

    } catch (error) {
        console.error(
            "Error cargando paquetes:",
            error
        );

        tabla.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="admin-loading">
                        No se pudieron cargar los paquetes.
                    </div>
                </td>
            </tr>
        `;
    }
}


// =====================================================
// RESUMEN
// =====================================================

function actualizarResumen() {
    const activos =
        paquetesAdmin.filter(
            (paquete) =>
                paquete.activo === true
        );

    const cupos =
        paquetesAdmin.reduce(
            (total, paquete) =>
                total +
                Number(
                    paquete.cupos || 0
                ),
            0
        );

    const totalPaquetes =
        document.getElementById(
            "totalPaquetes"
        );

    const totalActivos =
        document.getElementById(
            "totalActivos"
        );

    const totalCupos =
        document.getElementById(
            "totalCupos"
        );

    if (totalPaquetes) {
        totalPaquetes.textContent =
            paquetesAdmin.length;
    }

    if (totalActivos) {
        totalActivos.textContent =
            activos.length;
    }

    if (totalCupos) {
        totalCupos.textContent =
            cupos;
    }
}


// =====================================================
// TABLA
// =====================================================

function renderizarTabla(paquetes) {
    const tabla =
        document.getElementById(
            "tablaPaquetes"
        );

    if (!tabla) {
        return;
    }

    if (
        !Array.isArray(paquetes) ||
        paquetes.length === 0
    ) {
        tabla.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="admin-loading">
                        No hay paquetes que coincidan
                        con los filtros seleccionados.
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML =
        paquetes
            .map(crearFilaPaquete)
            .join("");

    configurarAccionesTabla();
}


function configurarAccionesTabla() {
    document
        .querySelectorAll(
            ".admin-action-edit"
        )
        .forEach((boton) => {
            boton.addEventListener(
                "click",
                () => {
                    editarPaquete(
                        Number(
                            boton.dataset.id
                        )
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".admin-action-delete"
        )
        .forEach((boton) => {
            boton.addEventListener(
                "click",
                () => {
                    eliminarPaquete(
                        Number(
                            boton.dataset.id
                        )
                    );
                }
            );
        });
}


function crearFilaPaquete(paquete) {
    const imagen =
        obtenerImagenAdmin(
            paquete.imagen
        );

    const estado =
        paquete.activo === true;

    const categoria =
        paquete.categoria ||
        "Sin categoría";

    return `
        <tr>

            <td>
                <img
                    src="${escaparAtributoAdmin(imagen)}"
                    class="admin-package-image"
                    alt="${escaparAtributoAdmin(
                        paquete.nombre ||
                        "Paquete turístico"
                    )}"
                    onerror="
                        this.onerror = null;
                        this.src =
                        'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=500&q=80';
                    "
                >
            </td>

            <td>
                <span class="admin-package-name">
                    ${escaparAdmin(
                        paquete.nombre
                    )}
                </span>
            </td>

            <td>
                ${escaparAdmin(
                    paquete.destino
                )}
            </td>

            <td>
                <span class="admin-category-badge">
                    ${escaparAdmin(
                        categoria
                    )}
                </span>
            </td>

            <td>
                ${formatearPrecioAdmin(
                    paquete.precio
                )}
            </td>

            <td>
                ${Number(
                    paquete.duracionDias || 0
                )}
            </td>

            <td>
                ${Number(
                    paquete.cupos || 0
                )}
            </td>

            <td>
                <span
                    class="
                        admin-status
                        ${
                            estado
                                ? "active"
                                : "inactive"
                        }
                    "
                >
                    ${
                        estado
                            ? "Activo"
                            : "Inactivo"
                    }
                </span>
            </td>

            <td>
                <div class="admin-actions">

                    <button
                        type="button"
                        class="
                            admin-action-button
                            admin-action-edit
                        "
                        data-id="${Number(paquete.id)}"
                        title="Editar paquete"
                        aria-label="Editar ${escaparAtributoAdmin(
                            paquete.nombre
                        )}"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        class="
                            admin-action-button
                            admin-action-delete
                        "
                        data-id="${Number(paquete.id)}"
                        title="Eliminar paquete"
                        aria-label="Eliminar ${escaparAtributoAdmin(
                            paquete.nombre
                        )}"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            </td>

        </tr>
    `;
}


// =====================================================
// FILTROS
// =====================================================

function aplicarFiltros() {
    const buscador =
        document.getElementById(
            "buscarPaquete"
        );

    const filtroEstado =
        document.getElementById(
            "filtroEstado"
        );

    const filtroCategoria =
        document.getElementById(
            "filtroCategoria"
        );

    const texto =
        String(
            buscador?.value || ""
        )
            .trim()
            .toLowerCase();

    const estado =
        filtroEstado?.value ||
        "todos";

    const categoria =
        filtroCategoria?.value ||
        "todas";


    const resultado =
        paquetesAdmin.filter(
            (paquete) => {
                const nombre =
                    String(
                        paquete.nombre || ""
                    )
                        .toLowerCase();

                const destino =
                    String(
                        paquete.destino || ""
                    )
                        .toLowerCase();

                const descripcion =
                    String(
                        paquete.descripcion || ""
                    )
                        .toLowerCase();

                const categoriaPaquete =
                    String(
                        paquete.categoria || ""
                    )
                        .trim()
                        .toLowerCase();


                const coincideTexto =
                    nombre.includes(texto) ||
                    destino.includes(texto) ||
                    descripcion.includes(texto);


                const activo =
                    paquete.activo === true;


                let coincideEstado = true;

                if (
                    estado === "activos"
                ) {
                    coincideEstado =
                        activo;
                }

                if (
                    estado === "inactivos"
                ) {
                    coincideEstado =
                        !activo;
                }


                let coincideCategoria =
                    true;

                if (
                    categoria !== "todas"
                ) {
                    coincideCategoria =
                        categoriaPaquete ===
                        categoria
                            .trim()
                            .toLowerCase();
                }


                return (
                    coincideTexto &&
                    coincideEstado &&
                    coincideCategoria
                );
            }
        );

    renderizarTabla(
        resultado
    );
}


// =====================================================
// NUEVO PAQUETE
// =====================================================

function abrirModalNuevoPaquete() {
    paqueteEditando = null;

    nombreImagenActual = "";

    const formulario =
        document.getElementById(
            "formPaquete"
        );

    formulario?.reset();


    asignarValorAdmin(
        "paqueteId",
        ""
    );

    asignarValorAdmin(
        "paqueteActivo",
        "true"
    );

    asignarValorAdmin(
        "paqueteCategoria",
        ""
    );


    const etiqueta =
        document.getElementById(
            "modalEtiqueta"
        );

    const titulo =
        document.getElementById(
            "modalTitulo"
        );


    if (etiqueta) {
        etiqueta.textContent =
            "Nuevo paquete";
    }

    if (titulo) {
        titulo.textContent =
            "Agregar paquete turístico";
    }


    const vistaPrevia =
        document.getElementById(
            "vistaPreviaImagen"
        );

    if (vistaPrevia) {
        vistaPrevia.innerHTML = `
            <i class="fa-regular fa-image"></i>

            <span>
                Sin imagen seleccionada
            </span>
        `;
    }


    limpiarMensajePaquete();

    abrirModalPaquete();


    setTimeout(() => {
        document
            .getElementById(
                "paqueteNombre"
            )
            ?.focus();
    }, 100);
}


// =====================================================
// EDITAR PAQUETE
// =====================================================

function editarPaquete(id) {
    const paquete =
        paquetesAdmin.find(
            (item) =>
                Number(item.id) ===
                Number(id)
        );

    if (!paquete) {
        window.alert(
            "No se encontró el paquete seleccionado."
        );

        return;
    }


    paqueteEditando =
        paquete;

    nombreImagenActual =
        paquete.imagen || "";


    asignarValorAdmin(
        "paqueteId",
        paquete.id
    );

    asignarValorAdmin(
        "paqueteNombre",
        paquete.nombre || ""
    );

    asignarValorAdmin(
        "paqueteDestino",
        paquete.destino || ""
    );

    asignarValorAdmin(
        "paqueteDescripcion",
        paquete.descripcion || ""
    );

    [
        ["paqueteHorarios", "horarios"],
        ["paquetePuntoRecojo", "puntoRecojo"],
        ["paqueteQueViviras", "queViviras"],
        ["paqueteItinerario", "itinerario"],
        ["paqueteIncluye", "incluye"],
        ["paqueteNoIncluye", "noIncluye"],
        ["paqueteRecomendaciones", "recomendaciones"]
    ].forEach(([idCampo, propiedad]) => asignarValorAdmin(idCampo, paquete[propiedad] || ""));

    asignarValorAdmin(
        "paquetePrecio",
        paquete.precio ?? 0
    );

    asignarValorAdmin(
        "paqueteDuracion",
        paquete.duracionDias ?? 1
    );

    asignarValorAdmin(
        "paqueteCupos",
        paquete.cupos ?? 0
    );

    asignarValorAdmin(
        "paqueteCategoria",
        paquete.categoria ||
        "Cultura"
    );

    asignarValorAdmin(
        "paqueteActivo",
        String(
            paquete.activo === true
        )
    );


    const inputImagen =
        document.getElementById(
            "paqueteImagen"
        );

    if (inputImagen) {
        inputImagen.value = "";
    }


    const etiqueta =
        document.getElementById(
            "modalEtiqueta"
        );

    const titulo =
        document.getElementById(
            "modalTitulo"
        );


    if (etiqueta) {
        etiqueta.textContent =
            "Editar paquete";
    }

    if (titulo) {
        titulo.textContent =
            paquete.nombre ||
            "Editar paquete";
    }


    const vistaPrevia =
        document.getElementById(
            "vistaPreviaImagen"
        );

    if (vistaPrevia) {
        if (paquete.imagen) {
            vistaPrevia.innerHTML = `
                <img
                    src="${escaparAtributoAdmin(
                        obtenerImagenAdmin(
                            paquete.imagen
                        )
                    )}"
                    alt="Vista previa del paquete"
                >
            `;
        } else {
            vistaPrevia.innerHTML = `
                <i class="fa-regular fa-image"></i>

                <span>
                    Este paquete no tiene imagen.
                </span>
            `;
        }
    }


    limpiarMensajePaquete();

    abrirModalPaquete();
}


// =====================================================
// GUARDAR PAQUETE
// =====================================================

async function guardarPaquete(event) {
    event.preventDefault();

    const boton =
        document.getElementById(
            "btnGuardarPaquete"
        );

    if (boton) {
        boton.disabled = true;
    }


    try {
        const categoria =
            document
                .getElementById(
                    "paqueteCategoria"
                )
                ?.value ||
            "";


        if (!categoria) {
            throw new Error(
                "Selecciona el tipo de experiencia del paquete."
            );
        }


        mostrarMensajePaquete(
            "Guardando paquete...",
            "info"
        );


        let nombreImagen =
            nombreImagenActual;


        const inputImagen =
            document.getElementById(
                "paqueteImagen"
            );


        const archivo =
            inputImagen
                ?.files?.[0];


        if (archivo) {
            nombreImagen =
                await subirImagenPaquete(
                    archivo
                );
        }


        const datos = {
            nombre:
                obtenerValorCampo(
                    "paqueteNombre"
                ),

            descripcion:
                obtenerValorCampo(
                    "paqueteDescripcion"
                ),

            destino:
                obtenerValorCampo(
                    "paqueteDestino"
                ),

            horarios: obtenerValorCampo("paqueteHorarios"),
            puntoRecojo: obtenerValorCampo("paquetePuntoRecojo"),
            queViviras: obtenerValorCampo("paqueteQueViviras"),
            itinerario: obtenerValorCampo("paqueteItinerario"),
            incluye: obtenerValorCampo("paqueteIncluye"),
            noIncluye: obtenerValorCampo("paqueteNoIncluye"),
            recomendaciones: obtenerValorCampo("paqueteRecomendaciones"),

            precio:
                Number(
                    obtenerValorCampo(
                        "paquetePrecio"
                    )
                ),

            duracionDias:
                Number(
                    obtenerValorCampo(
                        "paqueteDuracion"
                    )
                ),

            cupos:
                Number(
                    obtenerValorCampo(
                        "paqueteCupos"
                    )
                ),

            // NUEVO
            categoria:
                categoria,

            imagen:
                nombreImagen ||
                null,

            activo:
                document
                    .getElementById(
                        "paqueteActivo"
                    )
                    ?.value ===
                "true"
        };


        validarDatosPaquete(
            datos
        );


        const id =
            document
                .getElementById(
                    "paqueteId"
                )
                ?.value ||
            "";


        const editando =
            Boolean(id);


        const urlBase =
            obtenerUrlApi(
                API_CONFIG.endpoints.paquetes
            );


        const url =
            editando
                ? `${urlBase}/${id}`
                : urlBase;


        const respuesta =
            await fetch(
                url,
                {
                    method:
                        editando
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${obtenerTokenSesion()}`
                    },

                    body:
                        JSON.stringify(
                            datos
                        )
                }
            );


        const resultado =
            await leerRespuestaAdmin(
                respuesta
            );


        if (!respuesta.ok) {
            throw new Error(
                obtenerMensajeErrorBackend(
                    resultado,
                    respuesta.status
                )
            );
        }


        mostrarMensajePaquete(
            editando
                ? "Paquete actualizado correctamente."
                : "Paquete creado correctamente.",
            "success"
        );


        await cargarPaquetesAdmin();


        setTimeout(() => {
            cerrarModalPaquete();
        }, 650);

    } catch (error) {
        console.error(
            "Error guardando paquete:",
            error
        );

        mostrarMensajePaquete(
            error.message ||
            "No se pudo guardar el paquete.",
            "error"
        );

    } finally {
        if (boton) {
            boton.disabled =
                false;
        }
    }
}


// =====================================================
// VALIDAR DATOS DEL PAQUETE
// =====================================================

function validarDatosPaquete(
    datos
) {
    if (!datos.nombre) {
        throw new Error(
            "El nombre del paquete es obligatorio."
        );
    }

    if (!datos.destino) {
        throw new Error(
            "El destino es obligatorio."
        );
    }

    if (!datos.descripcion) {
        throw new Error(
            "La descripción es obligatoria."
        );
    }

    if (!datos.categoria) {
        throw new Error(
            "Selecciona una categoría."
        );
    }

    if (
        !Number.isFinite(
            datos.precio
        ) ||
        datos.precio < 0
    ) {
        throw new Error(
            "Ingresa un precio válido."
        );
    }

    if (
        !Number.isInteger(
            datos.duracionDias
        ) ||
        datos.duracionDias <= 0
    ) {
        throw new Error(
            "La duración debe ser mayor a 0 días."
        );
    }

    if (
        !Number.isInteger(
            datos.cupos
        ) ||
        datos.cupos < 0
    ) {
        throw new Error(
            "Ingresa una cantidad de cupos válida."
        );
    }
}


// =====================================================
// SUBIR IMAGEN
// =====================================================

async function subirImagenPaquete(
    archivo
) {
    validarImagenPaquete(
        archivo
    );


    const formData =
        new FormData();


    formData.append(
        "archivo",
        archivo
    );


    const respuesta =
        await fetch(
            `${obtenerUrlApi(
                API_CONFIG.endpoints.paquetes
            )}/subir-imagen`,
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${obtenerTokenSesion()}`
                },

                body:
                    formData
            }
        );


    const resultado =
        await leerRespuestaAdmin(
            respuesta
        );


    if (!respuesta.ok) {
        throw new Error(
            obtenerMensajeErrorBackend(
                resultado,
                respuesta.status
            )
        );
    }


    const nombre =
        resultado.nombreArchivo ||
        resultado.imagen ||
        resultado.archivo ||
        resultado.nombre ||
        "";


    if (!nombre) {
        throw new Error(
            "El servidor no devolvió el nombre de la imagen."
        );
    }


    return nombre;
}


function validarImagenPaquete(
    archivo
) {
    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !tiposPermitidos.includes(
            archivo.type
        )
    ) {
        throw new Error(
            "Selecciona una imagen JPG, PNG o WEBP."
        );
    }


    const maximo =
        5 * 1024 * 1024;


    if (
        archivo.size >
        maximo
    ) {
        throw new Error(
            "La imagen no debe superar los 5 MB."
        );
    }
}


// =====================================================
// ELIMINAR
// =====================================================

async function eliminarPaquete(id) {
    const paquete =
        paquetesAdmin.find(
            (item) =>
                Number(item.id) ===
                Number(id)
        );


    if (!paquete) {
        return;
    }


    const confirmar =
        window.confirm(
            `¿Seguro que deseas eliminar "${paquete.nombre}"?`
        );


    if (!confirmar) {
        return;
    }


    try {
        const respuesta =
            await fetch(
                `${obtenerUrlApi(
                    API_CONFIG.endpoints.paquetes
                )}/${id}`,
                {
                    method:
                        "DELETE",

                    headers: {
                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${obtenerTokenSesion()}`
                    }
                }
            );


        const resultado =
            await leerRespuestaAdmin(
                respuesta
            );


        if (!respuesta.ok) {
            throw new Error(
                obtenerMensajeErrorBackend(
                    resultado,
                    respuesta.status
                )
            );
        }


        await cargarPaquetesAdmin();

    } catch (error) {
        console.error(
            "Error eliminando paquete:",
            error
        );


        window.alert(
            error.message ||
            "No se pudo eliminar el paquete."
        );
    }
}


// =====================================================
// VISTA PREVIA DE IMAGEN
// =====================================================

function mostrarVistaPreviaImagen() {
    const archivo =
        document
            .getElementById(
                "paqueteImagen"
            )
            ?.files?.[0];


    const contenedor =
        document.getElementById(
            "vistaPreviaImagen"
        );


    if (!archivo || !contenedor) {
        return;
    }


    try {
        validarImagenPaquete(
            archivo
        );
    } catch (error) {
        window.alert(
            error.message
        );

        const input =
            document.getElementById(
                "paqueteImagen"
            );

        if (input) {
            input.value = "";
        }

        return;
    }


    const lector =
        new FileReader();


    lector.onload = () => {
        contenedor.innerHTML = `
            <img
                src="${lector.result}"
                alt="Vista previa de la imagen"
            >
        `;
    };


    lector.readAsDataURL(
        archivo
    );
}


// =====================================================
// RUTA DE IMÁGENES
// =====================================================

function obtenerImagenAdmin(
    imagen
) {
    const imagenPredeterminada =
        "https://images.unsplash.com/photo-1526392060635-9d6019884377" +
        "?auto=format&fit=crop&w=500&q=80";


    if (!imagen) {
        return imagenPredeterminada;
    }


    const valor =
        String(imagen).trim();


    if (!valor) {
        return imagenPredeterminada;
    }


    if (
        valor.startsWith("http://") ||
        valor.startsWith("https://") ||
        valor.startsWith("data:")
    ) {
        return valor;
    }


    const backendUrl =
        API_CONFIG.backendUrl ||
        "http://localhost:5232";


    if (
        valor.startsWith("/uploads/")
    ) {
        return (
            backendUrl +
            valor
        );
    }


    if (
        valor.startsWith("uploads/")
    ) {
        return (
            backendUrl +
            "/" +
            valor
        );
    }


    return (
        backendUrl +
        "/uploads/" +
        encodeURIComponent(
            valor
        )
    );
}


// =====================================================
// MODAL
// =====================================================

function abrirModalPaquete() {
    const modal =
        document.getElementById(
            "modalPaquete"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";
}


function cerrarModalPaquete() {
    const modal =
        document.getElementById(
            "modalPaquete"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";


    limpiarMensajePaquete();
}


// =====================================================
// MENSAJES
// =====================================================

function mostrarMensajePaquete(
    mensaje,
    tipo
) {
    const elemento =
        document.getElementById(
            "mensajePaquete"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje || "";


    elemento.className =
        `admin-message show ${tipo || ""}`;
}


function limpiarMensajePaquete() {
    const elemento =
        document.getElementById(
            "mensajePaquete"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        "";


    elemento.className =
        "admin-message";
}


// =====================================================
// RESPUESTA API
// =====================================================

async function leerRespuestaAdmin(
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
    } catch {
        return {
            mensaje:
                texto
        };
    }
}


function obtenerMensajeErrorBackend(
    resultado,
    estado
) {
    if (
        resultado?.mensaje
    ) {
        return resultado.mensaje;
    }


    if (
        resultado?.message
    ) {
        return resultado.message;
    }


    if (
        resultado?.title
    ) {
        return resultado.title;
    }


    if (
        resultado?.errors &&
        typeof resultado.errors ===
        "object"
    ) {
        const errores =
            Object.values(
                resultado.errors
            )
                .flat()
                .filter(Boolean);


        if (errores.length) {
            return errores.join(
                " "
            );
        }
    }


    return (
        `No se pudo completar la operación. Error ${estado}.`
    );
}


// =====================================================
// UTILIDADES
// =====================================================

function formatearPrecioAdmin(
    precio
) {
    return new Intl.NumberFormat(
        "es-PE",
        {
            style:
                "currency",

            currency:
                "PEN",

            minimumFractionDigits:
                2
        }
    ).format(
        Number(
            precio || 0
        )
    );
}


function obtenerValorCampo(id) {
    return String(
        document
            .getElementById(id)
            ?.value ||
        ""
    ).trim();
}


function asignarValorAdmin(
    id,
    valor
) {
    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {
        elemento.value =
            valor ?? "";
    }
}


function escaparAdmin(valor) {
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


function escaparAtributoAdmin(
    valor
) {
    return escaparAdmin(
        valor
    );
}