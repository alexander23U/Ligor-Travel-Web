let connection = null;

async function conectar() {

    const token = document.getElementById("token").value.trim();

    connection = new signalR.HubConnectionBuilder()

        .withUrl("/chatHub", {

            accessTokenFactory: () => token

        })

        .withAutomaticReconnect()

        .build();

    connection.on("RecibirMensaje", function (mensaje) {

        mostrarMensaje(mensaje);

    });

    connection.on("ErrorMensaje", function (error) {

        alert(error);

    });

    await connection.start();

    alert("Conectado correctamente");

}

async function enviarMensaje() {

    const usuarioId = parseInt(document.getElementById("usuarioId").value);

    const texto = document.getElementById("texto").value;

    if(texto==="") return;

    await connection.invoke("EnviarMensaje", usuarioId, texto);

    document.getElementById("texto").value="";

}

function mostrarMensaje(m){

    const mensajes=document.getElementById("mensajes");

    mensajes.innerHTML+=`

    <div class="mensaje">

        <div class="avatar">

            👤

        </div>

        <div class="burbuja">

            <div class="usuario">

                ${m.usuario}

            </div>

            <div>

                ${m.texto}

            </div>

            <div class="fecha">

                ${new Date(m.fecha).toLocaleString()}

            </div>

        </div>

    </div>

    `;

    mensajes.scrollTop=mensajes.scrollHeight;

}