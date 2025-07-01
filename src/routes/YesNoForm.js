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


  // Maneja el envío del formulario 
const handleSubmit = async (e) => {
  e.preventDefault(); // Evita que se recargue la página

  // Validación de formato de pregunta
  if (!esPreguntaValida(pregunta)) {
    setError("La pregunta debe terminar con un signo de interrogación (¿...? o ...?).");
    return;
  }

  if (esPreguntaDeOpcionMultiple(pregunta)) {
  setError("No puedo responder este tipo de preguntas. Hacé una pregunta que se pueda responder con sí, no o tal vez.");
  return;
}


  setError("");
  setLoading(true);       // Activa el estado de carga
  setRespuesta(null);     // Limpia la respuesta anterior
  setImagen(null);        // Limpia la imagen anterior

  try {
    // Llama a la API para obtener la respuesta real con imagen coherente
    const response = await axios.get("https://yesno.wtf/api");

    const respuestaAPI = response.data.answer; // "yes", "no", "maybe"
    const imagenAPI = response.data.image;

    // Actualiza los estados con la respuesta e imagen reales
    setRespuesta(respuestaAPI);
    setImagen(imagenAPI);

    // Agrega la pregunta y la respuesta al historial correctamente
    setHistorial((prev) => [
      ...prev,
      { pregunta, respuesta: respuestaAPI }
    ]);
  } catch (error) {
    setError("Hubo un error al consultar la API.");
  } finally {
    setLoading(false); // Desactiva el estado de carga
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
