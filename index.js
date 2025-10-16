// Selectores de elementos HTML
//Boton iniciar juego
const btn_start = document.getElementById("btnStart");
//Boton reiniciar juego
const btn_reiniciar = document.getElementById("btnReiniciar");
//Elemento animacion tiempo
const relleno = document.getElementById("rellenoTiempo");
//Elemento que muestra los aciertos
const aciertosElement = document.querySelector("#aciertos span");
//Elemento que muestra los errores
const erroresElement = document.querySelector("#errores span");
//Elemento que muestra el porcentaje de aciertos
const precisionElement = document.querySelector("#precision span");
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

let aciertos = 0;
let errores = 0;
let precision;
// Referencia al handler para eliminar el evento de escucha al terminar la frase.
// Inicia en null para la primera frase.
let inputHandlerRef = null;
// Referencia al focus para no acumular eventos de escucha.
let focusRef = null;

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
    const data = await cargarFrases();
    const lista = data[dificultad];
    const idx = Math.floor(Math.random() * lista.length);
    let frase = lista[idx];
    console.log(frase);
    agruparSpansPorPalabra(frase, fraseDOM);
}

function mantenerFocus(el) {
    el.focus();
    focusRef = () => el.focus();
    el.addEventListener("blur", focusRef);
}

function eliminarFocus(el) {
    el.removeEventListener("blur", focusRef);
    focusRef = null;
}

// Manejador de pantallas
function setPantallaActual(nextPantalla) {
    Object.values(pantallas).forEach((pantalla) =>
        pantalla.classList.add("oculto")
    );
    const elPantallaHTML = pantallas[nextPantalla];
    elPantallaHTML.classList.remove("oculto");

    if (nextPantalla === "juego") {
        setTimeout(() => mantenerFocus(contenedorInputElement), 0);
    } else eliminarFocus(contenedorInputElement);
}

async function juego() {
    // Limpiamos cualquier listener anterior nada más empezar
    if (inputHandlerRef) {
        contenedorInputElement.removeEventListener("input", inputHandlerRef);
        inputHandlerRef = null;
    }
    await obtenerFrase(dificultad);

    // Elementos que vamos a validar, excluimos .palabra
    let spans = [
        ...fraseDOM.querySelectorAll(":scope .letra, :scope .espacio"),
    ];
    // Estado inicial
    let indice = 0;
    // mantenerFocus();
    spans[indice].classList.add("cursor");

    // handler: función que procesa el evento input.
    function handler(e) {
        const tecla = e.data;
        const letra = spans[indice].textContent;

        if (tecla === letra) {
            spans[indice].classList.remove("cursor");
            spans[indice].classList.add("desvanecer");
            aciertos++;
            indice++;
        } else {
            spans[indice].classList.remove("cursor");
            spans[indice].classList.add("agitar");
            spans[indice].addEventListener(
                "animationend",
                () => {
                    spans[indice].classList.remove("agitar");
                },
                { once: true }
            );
            errores++;
        }
        console.log(indice);
        if (indice >= spans.length) {
            // al terminar, cargamos nueva frase y reiniciamos índice;
            (async () => {
                await obtenerFrase(dificultad);
                spans = [
                    ...fraseDOM.querySelectorAll(
                        ":scope .letra, :scope .espacio"
                    ),
                ];

                indice = 0;
                spans[indice].classList.add("cursor");
            })();
            return;
        }
        spans[indice].classList.add("cursor");
        return;
    }

    // Guardamos la referencia para indicar que existe un evento de escucha y poder eliminarlo en la siguiente frase.
    inputHandlerRef = handler;
    //Añadimos la escucha de handler() al input donde teclea el usuario
    contenedorInputElement.addEventListener("input", inputHandlerRef);
}

function empezar() {
    setPantallaActual("juego");
    console.log(tiempoJuego);
    aciertos = 0;
    errores = 0;
    precision = 0;
    contenedorInputElement.value = "";
    juego();
    relleno.classList.toggle("comenzarTiempo", true);
    contenedorFraseElement.classList.toggle("oculto");
    document
        .querySelector("#icoSettings img")
        .classList.toggle("deshabilitado", true);
}
function reiniciar() {
    setPantallaActual("inicio");
    aciertos = 0;
    errores = 0;
    precision = 0;
}

function finTiempo() {
    tiempoActivo = false;
    setPantallaActual("score");
    aciertosElement.textContent = aciertos;
    erroresElement.textContent = errores;
    precisionElement.textContent = exactitud() + "%";
    contenedorFraseElement.classList.toggle("oculto");
    document
        .querySelector("#icoSettings img")
        .classList.toggle("deshabilitado", false);
}

// Funciones del modal
function abrirModal() {
    //capturamos los botones del input del tiempo
    const input = document.getElementById("tiempoValor");
    const menos = document.getElementById("menos");
    const mas = document.getElementById("mas");

    // Referencia a las funciones de los listeners
    const aumentarValor = () => input.stepUp();
    const disminuirValor = () => input.stepDown();

    // Añadimos los listeners aumentar/disminuir
    mas.addEventListener("click", aumentarValor);
    menos.addEventListener("click", disminuirValor);

    //Abrimos el modal
    modal.classList.add("modalAbierto");

    // Cargar los datos del form al abrir el modal
    form.querySelector(
        `input[name="dificultad"][value="${dificultad}"]`
    ).checked = true;
    form.tiempoValor.value = tiempoJuego;

    // Cerrar modal guardando los datos del modal
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const newForm = new FormData(form);
        dificultad = newForm.get("dificultad");
        tiempoJuego = Number(newForm.get("tiempoValor"));
        document.documentElement.style.setProperty(
            "--tiempo",
            `${tiempoJuego}s`
        );
        menos.removeEventListener("click", disminuirValor);
        mas.removeEventListener("click", aumentarValor);
        modal.classList.remove("modalAbierto");
    });
    //Cerrar modal sin guardar los datos del modal
    [btnCloseModal, backdrop, btnCancelar].forEach((elemento) =>
        elemento.addEventListener("click", () => {
            menos.removeEventListener("click", disminuirValor);
            mas.removeEventListener("click", aumentarValor);
            modal.classList.remove("modalAbierto");
            form.reset();
        })
    );
}

function exactitud() {
    let exactitud = Math.round((aciertos / (aciertos + errores)) * 100);
    return exactitud | 0;
}
//EVENTOS

// Animación al cargar la página
window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".titulo h1").classList.add("desplazamiento");
    document.querySelector(".titulo p").classList.add("desplazamiento");
});
// Boton comenzar el juego
btn_start.addEventListener("click", () => {
    tiempoActivo = true;
    empezar();
});
//Boton terminar prueba
btnTerminar.addEventListener("click", () => finTiempo());
// Boton reiniciar juego
btn_reiniciar.addEventListener("click", () => reiniciar());
// Cuando termina la animación finaliza el tiempo
relleno.addEventListener("animationend", () => finTiempo());
// Evento de escucha para abrir el modal
document.getElementById("icoSettings").addEventListener("click", () => {
    if (tiempoActivo === false) {
        abrirModal();
    }
});
// ----------------------------------------------------------------- //
//Fix para agrupar palabras, de esta manera si la frase no cabe dentro del contenedor no se rompe la palabra sino que se pasa completa a la siguiente linea.
// Agrupamos por palabras y dentro de palabras cada letra en un span. El span que agrupa palabras tiene .palabra y el espan que contiene una letra .letra.
// Fix 2 : Agrefamos una clase para los espacios (.espaco) para tenerlos también en cuenta.
function agruparSpansPorPalabra(frase, destino /* <p> */) {
    const palabra = document.createDocumentFragment();

    let spanPalabra = document.createElement("span");
    spanPalabra.className = "palabra";

    for (const letra of [...frase]) {
        if (letra === " ") {
            if (spanPalabra.childNodes.length) {
                palabra.appendChild(spanPalabra);
                spanPalabra = document.createElement("span");
                spanPalabra.className = "palabra";
            }
            const spanEspacio = document.createElement("span");
            spanEspacio.className = "espacio";
            spanEspacio.textContent = " ";
            palabra.appendChild(spanEspacio);
        } else {
            const spanLetra = document.createElement("span");
            spanLetra.className = "letra";
            spanLetra.textContent = letra;
            spanPalabra.appendChild(spanLetra);
        }
    }

    // última palabra si quedó algo
    if (spanPalabra.childNodes.length) {
        palabra.appendChild(spanPalabra);
    }

    // pintamos en el <p> destino
    destino.replaceChildren(palabra);
}
