import { useState } from "react";

export default function TypingSimple() {
    // Texto objetivo (puedes moverlo a un archivo de datos luego)
    const target = "la veloz cebra salta";

    // Lo que llevas escrito
    const [typed, setTyped] = useState<string>("");

    // Cada vez que cambia el input, actualizamos (y recortamos a la longitud del target)
    const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setTyped(e.currentTarget.value);
    };

    // Métricas simples
    const index = typed.length;
    const errors = [...typed].reduce(
        (acc, ch, i) => acc + (ch === target[i] ? 0 : 1),
        0
    );

    return (
        <div className="container">
            <h2>Práctica rápida</h2>

            <div className="hud">
                <span>
                    <strong>Posición:</strong> {index}/{target.length}
                </span>
                <span>
                    <strong>Errores:</strong> {errors}
                </span>
            </div>

            {/* Input visible: súper sencillo */}
            <input
                type="text"
                value={typed}
                onChange={onChange}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="text-input"
                placeholder="Empieza a escribir aquí…"
            />

            {/* Pintamos el objetivo carácter a carácter con clases */}
            <div className="text">
                {Array.from(target).map((ch, i) => {
                    let cls = "char pending";
                    if (i < typed.length)
                        cls = typed[i] === ch ? "char correct" : "char wrong";
                    return (
                        <span key={i} className={cls}>
                            {ch === " " ? "·" : ch}
                        </span>
                    );
                })}
            </div>

            <button onClick={() => setTyped("")} className="btn">
                Reiniciar
            </button>
        </div>
    );
}
