/* ============================================================
   Aviso de privacidad (HU-12): texto, enlace y regla de aceptación.
   Sin interfaz: se prueba con Node. La ventana la abre js/ia.js.
   Regla: sin aceptar el aviso no se envía ningún trabajo a calificar.
   ============================================================ */

const AVISO_PRIVACIDAD = {
  version: '2026-11-05',
  enlace: 'https://danielgonzalezceli.github.io/ConectaEDU/privacidad.html',
  titulo: 'Antes de calificar con IA',
  parrafos: [
    'Los trabajos y la rúbrica se envían al proveedor de IA (Anthropic) <b>solo para sugerir la nota</b>. ' +
      'El servidor de ConectaEdu <b>no los guarda</b>: solo registra datos de uso (fecha, modelo, tokens y tiempo).',
    '<b>Para pruebas usa trabajos anonimizados</b>: sin nombres, cédulas, correos ni otros datos que identifiquen al estudiante. El nombre del archivo no se envía.',
    'Los resultados viven solo en esta pestaña: al recargar la página se pierden. Descárgalos antes de salir.'
  ],
  casilla: 'He leído el aviso de privacidad y acepto que los trabajos y la rúbrica se envíen al proveedor de IA para sugerir la nota.',
  faltaCasilla: 'Marca la casilla para continuar.'
};

// HTML del cuerpo del aviso: párrafos, enlace a la política y casilla sin marcar.
function htmlAvisoPrivacidad(aviso = AVISO_PRIVACIDAD) {
  return aviso.parrafos.map(p => '<p>' + p + '</p>').join('') +
    '<p><a href="' + aviso.enlace + '" target="_blank" rel="noopener">Leer la política de privacidad completa</a> (se abre en otra pestaña).</p>' +
    '<label class="casilla"><input type="checkbox" id="acepto-aviso"> ' + aviso.casilla + '</label>' +
    '<p class="error-casilla oculto" id="falta-aviso" role="alert">' + aviso.faltaCasilla + '</p>';
}

// Guarda en `estado` qué versión del aviso se aceptó y cuándo (solo en memoria).
function registrarAceptacion(estado, fecha, aviso = AVISO_PRIVACIDAD) {
  estado.aceptacionAviso = { version: aviso.version, fecha: fecha };
  return estado.aceptacionAviso;
}

// ¿Se puede enviar un trabajo a calificar? Solo si se aceptó la versión vigente.
function avisoAceptado(estado, aviso = AVISO_PRIVACIDAD) {
  return !!(estado && estado.aceptacionAviso && estado.aceptacionAviso.version === aviso.version);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVISO_PRIVACIDAD, htmlAvisoPrivacidad, registrarAceptacion, avisoAceptado };
}
