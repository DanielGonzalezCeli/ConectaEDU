// HU-12: aviso de privacidad antes de calificar. Sin red ni gasto.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AVISO_PRIVACIDAD, htmlAvisoPrivacidad, registrarAceptacion, avisoAceptado } = require('../js/logica-privacidad.js');
const { cargarScripts } = require('./navegador');

const texto = html => html.replace(/<[^>]+>/g, '');

test('el aviso dice que trabajos y rúbrica van al proveedor solo para sugerir la nota', () => {
  const t = texto(AVISO_PRIVACIDAD.parrafos.join(' '));
  assert.match(t, /trabajos y la rúbrica se envían al proveedor de IA/);
  assert.match(t, /solo para sugerir la nota/);
});

test('el aviso dice que el servidor no guarda los trabajos ni la rúbrica', () => {
  assert.match(texto(AVISO_PRIVACIDAD.parrafos.join(' ')), /servidor de ConectaEdu no los guarda/);
});

test('el aviso enlaza a la política de privacidad publicada', () => {
  assert.equal(AVISO_PRIVACIDAD.enlace, 'https://danielgonzalezceli.github.io/ConectaEDU/privacidad.html');
  const html = htmlAvisoPrivacidad();
  assert.ok(html.includes('href="https://danielgonzalezceli.github.io/ConectaEDU/privacidad.html"'));
  assert.ok(html.includes('rel="noopener"'), 'el enlace externo no da acceso a esta pestaña');
});

test('el aviso trae una casilla que empieza sin marcar', () => {
  const html = htmlAvisoPrivacidad();
  assert.match(html, /<input type="checkbox" id="acepto-aviso">/);
  assert.ok(!/checked/.test(html), 'la casilla no puede venir marcada');
});

test('sin aceptar no se puede calificar; al aceptar queda la versión y la fecha', () => {
  const estado = {};
  assert.equal(avisoAceptado(estado), false);
  const fecha = new Date(2026, 10, 5, 10, 0);
  assert.deepEqual(registrarAceptacion(estado, fecha), { version: AVISO_PRIVACIDAD.version, fecha });
  assert.equal(avisoAceptado(estado), true);
});

test('si cambia el aviso, hay que aceptarlo de nuevo', () => {
  const estado = {};
  registrarAceptacion(estado, new Date());
  assert.equal(avisoAceptado(estado, Object.assign({}, AVISO_PRIVACIDAD, { version: 'nueva' })), false);
});

/* ---------- El archivo real del navegador (js/ia.js) ---------- */
function cargarIA() {
  const llamadas = [];
  const fetch = async (url, op) => {
    llamadas.push(url);
    return { ok: true, status: 200, json: async () => ({ puntos: [1], ok: true }) };
  };
  const leer = cargarScripts(['js/logica-privacidad.js', 'js/ia.js'], { fetch });
  return { leer, llamadas };
}

test('js/ia.js no envía ningún trabajo si el aviso no fue aceptado', async () => {
  const { leer, llamadas } = cargarIA();
  await assert.rejects(leer('pedirCalificacion({ rubrica: {}, trabajo: { texto: "x" } })'), err => err.codigo === 'sin_aviso');
  assert.equal(llamadas.length, 0, 'no debe haber ninguna llamada al servidor');
});

test('js/ia.js envía el trabajo después de aceptar el aviso', async () => {
  const { leer, llamadas } = cargarIA();
  leer('registrarAceptacion(IA, new Date())');
  await leer('pedirCalificacion({ rubrica: {}, trabajo: { texto: "x" } })');
  assert.deepEqual(llamadas, ['api/calificar']);
});

test('js/ia.js detiene la cola de calificación si falta el aviso', async () => {
  const { leer, llamadas } = cargarIA();
  const items = await leer(`(async () => {
    const items = [{ id: 'T1' }, { id: 'T2' }, { id: 'T3' }, { id: 'T4' }];
    await calificarEnCola(items, t => pedirCalificacion({ trabajo: { texto: t.id } }), () => {});
    return items;
  })()`);
  assert.equal(llamadas.length, 0);
  assert.ok(items.every(t => t.estadoIA === 'error'), 'ningún trabajo queda calificado');
});
