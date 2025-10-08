// Selectores de elementos HTML
const btn_start = document.getElementById("btnStart");
const btn_reiniciar = document.getElementById("btnReiniciar");
const relleno = document.getElementById("rellenoTiempo");
const scoreElement = document.getElementById("score");
const aciertosElement = document.querySelector("#aciertos span");
const erroresElement = document.querySelector("#errores span");
const ppmElement = document.querySelector("#ppm span");
const contenedorFraseElement = document.getElementById("contenedorFrase");
const fraseDOM = contenedorFraseElement.querySelector("p");
const contenedorInputElement = document.getElementById("juegoInput");

// VARIABLES
const tiempoJuego = 5;
document.documentElement.style.setProperty("--tiempo", tiempoJuego + "s");
let indice = 0;
let aciertos;
let errores;
let ppm;

// =========================
// OBSERVER: referencia al handler para suscribir/desuscribir
// Motivo: evitar listeners duplicados en cada inicio de juego()
// =========================
let inputHandlerRef = null;

//FUNCIONES//

//Obtener la frase//
let texto = null; // frases en memoria

async function cargarFrases() {
    if (texto) return texto; // ya cargado
    const res = await fetch("/frases.json");
    texto = await res.json();
    return texto;
}

async function obtenerFrase(dificultad = "media") {
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

async function juego() {
    indice = 0;
    await obtenerFrase("media");
    // let spans = fraseDOM.children;
    let spans = [...fraseDOM.children];
    mantenerFocus();

    spans[indice].classList.add("cursor");

    function onInput(e) {
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
                await obtenerFrase("media");
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
    // Motivo: si ya había un listener, lo removemos para no duplicar ejecuciones.
    // =========================
    if (inputHandlerRef) {
        contenedorInputElement.removeEventListener("input", inputHandlerRef);
    }
    inputHandlerRef = onInput;
    contenedorInputElement.addEventListener("input", inputHandlerRef);
}

function empezar() {
    aciertos = 0;
    errores = 0;
    ppm = 0;
    contenedorInputElement.value = "";
    juego();
    console.log("empezamos");
    btn_start.classList.toggle("deshabilitado", true);
    relleno.classList.toggle("comenzarTiempo", true);
    contenedorFraseElement.classList.toggle("deshabilitado");
}
function reiniciar() {
    btn_start.classList.toggle("deshabilitado", false);
    scoreElement.classList.toggle("deshabilitado", true);
    // aciertosElement.textContent = "";
    // erroresElement.textContent = "";
    // ppmElement.textContent = "";
    aciertos = 0;
    errores = 0;
    ppm = 0;
}

function finTiempo() {
    console.log("termino el tiempo");
    relleno.classList.toggle("comenzarTiempo", false);
    scoreElement.classList.toggle("deshabilitado", false);
    aciertosElement.textContent = aciertos;
    erroresElement.textContent = errores;
    ppmElement.textContent = "cambiar";
    contenedorFraseElement.classList.toggle("deshabilitado");
}
//EVENTOS
btn_start.addEventListener("click", async () => {
    empezar();
});
btn_reiniciar.addEventListener("click", () => reiniciar());
relleno.addEventListener("animationend", () => finTiempo());
