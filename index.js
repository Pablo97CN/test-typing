// Selectores de elementos HTML
//Boton iniciar juego
const btn_start = document.getElementById("btnStart");
//Boton reiniciar juego
const btn_reiniciar = document.getElementById("btnReiniciar");
//Elemento animacion tiempo
const relleno = document.getElementById("rellenoTiempo");
//Contenedor score
const scoreElement = document.getElementById("score");
//Elemento que muestra los aciertos
const aciertosElement = document.querySelector("#aciertos span");
//Elemento que muestra los errores
const erroresElement = document.querySelector("#errores span");
//Elemento que muestra el porcentaje de aciertos
const ppmElement = document.querySelector("#ppm span");
//Elemento contenedor donde se encuentra nuestro elemento html donde inyectamos la fras
const contenedorFraseElement = document.getElementById("contenedorFrase");
//Elemento donde se inyecta la frase de la prueba
const fraseDOM = contenedorFraseElement.querySelector("p");
// Elemento donde el usuario escribe y capturamos las teclas que pulsa
const contenedorInputElement = document.getElementById("juegoInput");
// Boton terminar prueba
const btnTerminar = document.getElementById("terminarPrueba");
// Modal de confuguración de la prueba
const modal = document.getElementById("modalSettings");
//Icono que funciona como boton para abrir el modal
const btnOpenModal = document.getElementById("icoSettings");
//Boton para  cerrar el modal
const btnCloseModal = document.getElementById("btnClose");
// Elemento que difumina el fondo al abrir el modal
const backdrop = document.querySelector(".modalBackdrop");
// Boton para guardar los cambios en el modal settings
const btnCancelar = document.querySelector(".btnSettings .btnCancelar");
let form = document.getElementById("settingsForm");

// VARIABLES

let dificultad = "facil";
let tiempoJuego = 30;
document.documentElement.style.setProperty("--tiempo", tiempoJuego + "s");
let tiempoActivo = false;

let indice = 0;
let aciertos;
let errores;
let ppm;
// Referencia al handler para suscribir/desuscribir (manejar el evento mediante el observer)
let inputHandlerRef = null;

// Pantallas del juego
const pantallas = {
    inicio: document.getElementById("inicioJuego"),
    juego: document.getElementById("juego"),
    score: document.getElementById("score"),
};

//FUNCIONES//
//Obtener la frase//
let texto = null; // frases en memoria
async function cargarFrases() {
    if (texto) return texto; // ya cargado
    const res = await fetch("/frases.json");
    texto = await res.json();
    return texto;
}

async function obtenerFrase(dificultad) {
    console.log(dificultad);
    const data = await cargarFrases();
    const lista = data[dificultad];
    const idx = Math.floor(Math.random() * lista.length);
    let frase = lista[idx];
    console.log(frase);
    let fraseHTML = [...frase].map((letra) => `<span>${letra}</span>`).join("");
    fraseDOM.innerHTML = fraseHTML;
}

function mantenerFocus() {
    contenedorInputElement.focus();
    contenedorInputElement.addEventListener("blur", () =>
        contenedorInputElement.focus()
    );
}

// Manejador de pantallas
function setPantallaActual(nextPantalla) {
    Object.values(pantallas).forEach((pantalla) =>
        pantalla.classList.add("deshabilitado")
    );
    const pantallaActual = pantallas[nextPantalla];
    pantallaActual.classList.remove("deshabilitado");
}

async function juego() {
    indice = 0;
    await obtenerFrase(dificultad);
    let spans = [...fraseDOM.children];
    mantenerFocus();

    spans[indice].classList.add("cursor");

    // Utilizamos un handler para tener una referencia al evento y poder quitarlo (evento suscrito)
    function handler(e) {
        if (e.data === spans[indice].textContent) {
            spans[indice].classList.remove("cursor");
            spans[indice].classList.add("ok");
            aciertos++;
        } else {
            spans[indice].classList.remove("cursor");
            spans[indice].classList.add("fail");
            errores++;
        }
        indice++;
        console.log(indice);
        if (indice >= spans.length) {
            // al terminar, cargamos nueva frase y reiniciamos índice;
            // NO añadimos otro listener: se reutiliza este mismo observer
            (async () => {
                await obtenerFrase(dificultad);
                spans = fraseDOM.children;
                indice = 0;
                spans[indice].classList.add("cursor");
            })();
            return;
        }
        spans[indice].classList.add("cursor");
        return;
    }

    // =========================
    // OBSERVER: limpieza y suscripción única
    // Primera vez que se inicia: inputHandlerRef vale null por lo que no elimina el evento de escucha.
    // Si se reinicia el juego (segunda vez) detecta que ya había un evento de escucha porque la referencia no es nul, elimina el que había y vuelve a poner otro para evitar acumular eventos de escucha.
    // =========================

    if (inputHandlerRef) {
        contenedorInputElement.removeEventListener("input", inputHandlerRef);
    }
    inputHandlerRef = handler;
    contenedorInputElement.addEventListener("input", inputHandlerRef);
}

function empezar() {
    setPantallaActual("juego");
    console.log(tiempoJuego);
    aciertos = 0;
    errores = 0;
    ppm = 0;
    contenedorInputElement.value = "";
    juego();
    console.log("empezamos");
    console.log(tiempoActivo);
    relleno.classList.toggle("comenzarTiempo", true);
    contenedorFraseElement.classList.toggle("deshabilitado");
}
function reiniciar() {
    setPantallaActual("inicio");
    aciertos = 0;
    errores = 0;
    ppm = 0;
}

function finTiempo() {
    console.log("termino el tiempo");
    tiempoActivo = false;
    console.log(tiempoActivo);
    setPantallaActual("score");
    aciertosElement.textContent = aciertos;
    erroresElement.textContent = errores;
    ppmElement.textContent = "cambiar";
    contenedorFraseElement.classList.toggle("deshabilitado");
}

function abrirModal() {
    form.querySelector(
        `input[name="dificultad"][value="${dificultad}"]`
    ).checked = true;
    form.tiempoValor.value = tiempoJuego;

    modal.classList.add("modalAbierto");
    console.log("boton pulsado");
}

function cerrarModal() {
    modal.classList.remove("modalAbierto");
    form.reset();
    console.log("boton pulsado");
}

//EVENTOS
// Capturamos si cambian los settings
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newForm = new FormData(form);
    dificultad = newForm.get("dificultad");
    tiempoJuego = Number(newForm.get("tiempoValor"));
    console.log(tiempoJuego);
    document.documentElement.style.setProperty("--tiempo", `${tiempoJuego}s`);
    modal.classList.remove("modalAbierto");
});
// Boton comenzar el juego
btn_start.addEventListener("click", async () => {
    tiempoActivo = true;
    empezar();
});
//Boton terminar prueba
btnTerminar.addEventListener("click", () => finTiempo());
// Boton reiniciar juego
btn_reiniciar.addEventListener("click", () => reiniciar());
// Cuando termina la animación finaliza el tiempo
relleno.addEventListener("animationend", () => finTiempo());
btnOpenModal.addEventListener("click", () => {
    if (tiempoActivo === false) {
        abrirModal();
    }
});
[btnCloseModal, backdrop, btnCancelar].forEach((elemento) =>
    elemento.addEventListener("click", cerrarModal)
);
