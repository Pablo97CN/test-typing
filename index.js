// Selectores de elementos HTML
const btn_start = document.getElementById("btnStart");
const btn_reiniciar = document.getElementById("btnReiniciar");
const relleno = document.getElementById("rellenoTiempo");
const scoreElement = document.getElementById("score");
const aciertosElement = document.querySelector("#aciertos span");
const erroresElement = document.querySelector("#errores span");
const ppmElement = document.querySelector("#ppm span");
const contenedorFraseElement = document.getElementById("contenedorFrase");
const fraseActual = contenedorFraseElement.querySelector("p");
const contenedorInputElement = document.getElementById("juegoInput");

// VARIABLES
const tiempoJuego = 190;
document.documentElement.style.setProperty("--tiempo", tiempoJuego + "s");
let aciertos;
let errores;
let ppm;

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
    const lista = data[dificultad] ?? data.media;
    if (!lista?.length) return "No hay frases disponibles.";
    const idx = Math.floor(Math.random() * lista.length);
    return lista[idx];
}

function mantenerFocus() {
    contenedorInputElement.focus();
    contenedorInputElement.addEventListener("blur", () =>
        contenedorInputElement.focus()
    );
}

async function juego() {
    let frase = await obtenerFrase("media"); // 'facil' | 'media' | 'dificil'
    console.log(frase);
    const arrayFrase = [...frase];
    let fraseHTML = [...frase].map((letra) => {
        return `<span>${letra}</span>`;
    });
    fraseHTML = fraseHTML.join("");
    fraseActual.innerHTML = fraseHTML;
    console.log(fraseHTML);
    let indice = 0;
    mantenerFocus();
    fraseActual.children[indice].classList.add("cursor");
    contenedorInputElement.addEventListener("input", (e) => {
        if (e.data === arrayFrase[indice]) {
            fraseActual.children[indice].classList.remove("cursor");
            fraseActual.children[indice].classList.add("ok");
            fraseActual.children[indice + 1].classList.add("cursor");
            aciertos++;
            indice++;
        } else {
            fraseActual.children[indice].classList.remove("cursor");
            fraseActual.children[indice].classList.add("fail");
            fraseActual.children[indice + 1].classList.add("cursor");
            errores++;
            indice++;
        }
    });
}

function empezar() {
    aciertos = 0;
    errores = 0;
    ppm = 0;

    juego();
    console.log("empezamos");
    btn_start.classList.toggle("deshabilitado", true);
    relleno.classList.toggle("comenzarTiempo", true);
    contenedorFraseElement.classList.toggle("deshabilitado");
}

function reiniciar() {
    btn_start.classList.toggle("deshabilitado", false);
    scoreElement.classList.toggle("deshabilitado", true);
    aciertosElement.textContent = "";
    erroresElement.textContent = "";
    ppmElement.textContent = "";
    aciertos = 0;
    errores = 0;
    ppm = 0;
}

function finTiempo() {
    console.log("termino el tiempo");
    relleno.classList.toggle("comenzarTiempo", false);
    scoreElement.classList.toggle("deshabilitado", false);
    aciertosElement.textContent = "cambiar";
    erroresElement.textContent = "cambiar";
    ppmElement.textContent = "cambiar";
    contenedorFraseElement.classList.toggle("deshabilitado");
}

//EVENTOS
btn_start.addEventListener("click", async () => {
    empezar();
});
btn_reiniciar.addEventListener("click", () => reiniciar());
relleno.addEventListener("animationend", () => finTiempo());
