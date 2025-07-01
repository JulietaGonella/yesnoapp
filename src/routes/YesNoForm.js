import React, { useState } from "react";
import axios from "axios";
import "./YesNoForm.css"; // Importa los estilos CSS para este componente

function YesNoForm() {
  // Estados para controlar cada parte del componente
  const [pregunta, setPregunta] = useState("");           // Pregunta ingresada por el usuario
  const [error, setError] = useState("");                 // Mensaje de error si la pregunta no es válida
  const [respuesta, setRespuesta] = useState(null);       // Respuesta generada ("yes", "no", "maybe")
  const [imagen, setImagen] = useState(null);             // Imagen correspondiente a la respuesta
  const [loading, setLoading] = useState(false);          // Estado de carga mientras se espera la respuesta
  const [historial, setHistorial] = useState([]);         // Historial de preguntas y respuestas

  // Maneja el cambio en el input
  const handleChange = (e) => {
    setPregunta(e.target.value);
    setError(""); // Limpia el error al empezar a escribir
  };

  // Verifica si la pregunta termina en signo de interrogación
  const esPreguntaValida = (texto) => {
    const empiezaConsigno = texto.startsWith("¿");
    const terminaConsigno = texto.trim().endsWith("?");
    return (empiezaConsigno && terminaConsigno) || (!empiezaConsigno && terminaConsigno);
  };

  // Verifica si la pregunta es del tipo "¿Esto o esto?"

  const esPreguntaDeOpcionMultiple = (texto) => {
    const textoLimpio = texto.toLowerCase();
    return textoLimpio.includes(" o "); // Busca el conector " o "
  };

  // Verifica si la pregunta es abierta (no se responde con sí/no)
  const esPreguntaAbierta = (texto) => {
    const palabrasAbiertas = [
      "qué",
      "cuál",
      "cuáles",
      "cómo",
      "cuándo",
      "dónde",
      "por qué",
      "porque"
    ];
    const textoLimpio = texto.toLowerCase();
    return palabrasAbiertas.some((palabra) =>
      textoLimpio.includes(palabra)
    );
  };



  // Maneja el envío del formulario 
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validación de formato
  if (!esPreguntaValida(pregunta)) {
    setError("La pregunta debe terminar con un signo de interrogación (¿...? o ...?).");
    setRespuesta(null); // 🔴 Limpia respuesta
    setImagen(null);    // 🔴 Limpia imagen
    return;
  }

  if (esPreguntaDeOpcionMultiple(pregunta)) {
    setError("No puedo responder este tipo de preguntas. Hacé una pregunta que se pueda responder con sí, no o tal vez.");
    setRespuesta(null); // 🔴 Limpia respuesta
    setImagen(null);    // 🔴 Limpia imagen
    return;
  }

  if (esPreguntaAbierta(pregunta)) {
    setError("No puedo responder este tipo de preguntas. Hacé una pregunta que se pueda responder con sí, no o tal vez.");
    setRespuesta(null); // 🔴 Limpia respuesta
    setImagen(null);    // 🔴 Limpia imagen
    return;
  }

  // Si pasa todas las validaciones
  setError("");
  setLoading(true);
  setRespuesta(null);
  setImagen(null);

  try {
    const response = await axios.get("https://yesno.wtf/api");
    const respuestaAPI = response.data.answer;
    const imagenAPI = response.data.image;

    setRespuesta(respuestaAPI);
    setImagen(imagenAPI);

    setHistorial((prev) => [
      ...prev,
      { pregunta, respuesta: respuestaAPI },
    ]);
  } catch (error) {
    setError("Hubo un error al consultar la API.");
    setRespuesta(null); // 🔴 Por si hay error de red, también se limpia
    setImagen(null);
  } finally {
    setLoading(false);
  }
};



  // Limpia todo el formulario y resultados
  const handleReset = () => {
    setPregunta("");
    setRespuesta(null);
    setImagen(null);
    setError("");
    setHistorial([]);
  };

  // Determina el color de fondo según la respuesta
  const getColorByRespuesta = (respuesta) => {
    switch (respuesta) {
      case "yes":
        return "fondo-yes";
      case "no":
        return "fondo-no";
      case "maybe":
        return "fondo-maybe";
      default:
        return "";
    }
  };

  // Traduce la respuesta de inglés a español
  const traducirRespuesta = (respuesta) => {
    switch (respuesta) {
      case "yes":
        return "Sí";
      case "no":
        return "No";
      case "maybe":
        return "Tal vez";
      default:
        return respuesta;
    }
  };

  return (
    <div className={`contenedor ${getColorByRespuesta(respuesta)}`}>
      {/* Formulario de ingreso de la pregunta */}
      <form onSubmit={handleSubmit} className="formulario">
        <label htmlFor="pregunta">Escribí tu pregunta:</label>
        <input
          id="pregunta"
          type="text"
          value={pregunta}
          onChange={handleChange}
          placeholder="¿Será un día soleado?"
        />
        {/* Muestra mensaje de error si hay */}
        {error && <div className="error">{error}</div>}

        {/* Botones de acción */}
        <button type="submit" disabled={pregunta.trim() === "" || loading}>
          {loading ? "Cargando..." : "Preguntar"}
        </button>
        <button type="button" onClick={handleReset} className="limpiar-btn">
          Limpiar
        </button>
      </form>

      {/* Indicador de carga mientras espera respuesta */}
      {loading && <div className="cargando">Esperando la respuesta...</div>}

      {/* Muestra la respuesta y la imagen */}
      {!loading && respuesta && (
        <div className="respuesta-container animada">
          <h2>Respuesta: {traducirRespuesta(respuesta)}</h2>
          <img src={imagen} alt={respuesta} />
        </div>
      )}

      {/* Historial de preguntas realizadas */}
      {historial.length > 0 && (
        <div className="historial">
          <h3>Historial</h3>
          <ul>
            {historial.map((item, index) => (
              <li key={index}>
                <strong>{item.pregunta}</strong> ➜ {traducirRespuesta(item.respuesta)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default YesNoForm;
