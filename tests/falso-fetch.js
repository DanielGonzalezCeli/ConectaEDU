// Ayudas para las pruebas: un fetch falso que NUNCA sale a internet.
// Cada llamada toma la siguiente respuesta preparada y guarda lo que se envió.

function respuestaModelo(salida, extra = {}) {
  const cuerpo = {
    model: extra.model || 'claude-sonnet-5-5',
    stop_reason: extra.stop_reason || 'end_turn',
    content: [{ type: 'text', text: typeof salida === 'string' ? salida : JSON.stringify(salida) }],
    usage: { input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: extra.cacheLeidos || 0, cache_creation_input_tokens: 0 }
  };
  return { ok: true, status: 200, headers: { get: () => null }, text: async () => JSON.stringify(cuerpo) };
}

function respuestaError(status, mensaje, cabeceras = {}) {
  return {
    ok: false, status,
    headers: { get: k => cabeceras[k.toLowerCase()] ?? null },
    text: async () => JSON.stringify({ type: 'error', error: { type: 'error_de_prueba', message: mensaje || 'error' } })
  };
}

// respuestas: lista de objetos de respuesta o funciones (cuerpo, opciones) => respuesta.
function crearFetchFalso(respuestas) {
  const lista = respuestas.slice();
  const f = async (url, opciones) => {
    const cuerpo = JSON.parse(opciones.body);
    f.llamadas.push({ url, opciones, cuerpo });
    if (!lista.length) throw new Error('El fetch falso no tiene más respuestas preparadas');
    const r = lista.shift();
    return typeof r === 'function' ? r(cuerpo, opciones) : r;
  };
  f.llamadas = [];
  return f;
}

// Salida de calificación válida para una rúbrica, con citas tomadas del texto.
function salidaCalificacion(criterios, texto, cambios = {}) {
  return {
    criterios: criterios.map((c, i) => Object.assign({
      criterio: c.nombre, nota: Math.min(c.max, 1), justificacion: 'Justificación ' + (i + 1),
      cita: texto.slice(0, 30), confianza: 'alta'
    }, (cambios[i] || {}))),
    comentario_general: 'Comentario de prueba.'
  };
}

module.exports = { respuestaModelo, respuestaError, crearFetchFalso, salidaCalificacion };
