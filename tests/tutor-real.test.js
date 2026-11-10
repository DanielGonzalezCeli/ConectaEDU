// Pantalla del tutor real: material en memoria, límites y lo que se envía.
// Sin red ni gasto: la llamada usa un fetch falso.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const T = require('../js/logica-tutor-real.js');
const { cargarScripts } = require('./navegador');

const PDF = Buffer.from('%PDF-1.4 prueba').toString('base64');

test('agrega texto y PDF, con nombres únicos', () => {
  const st = T.crearEstadoTutorReal();
  assert.equal(T.agregarMaterial(st, { nombre: 'Guía', texto: 'La media es...' }), null);
  assert.equal(T.agregarMaterial(st, { nombre: 'Guía', texto: 'Otra parte' }), null);
  assert.equal(T.agregarMaterial(st, { nombre: 'Diapositivas.pdf', pdfBase64: PDF }), null);
  assert.deepEqual(st.material.map(m => m.nombre), ['Guía', 'Guía (2)', 'Diapositivas.pdf']);
  assert.deepEqual(T.resumenMaterial(st.material), { documentos: 3, caracteres: 24, pdfs: 1, bytesPdf: 15 });
});

test('respeta los límites del servidor: texto vacío, 60 000 caracteres, 5 PDF y 5 MB', () => {
  const st = T.crearEstadoTutorReal();
  assert.match(T.agregarMaterial(st, { nombre: 'x', texto: '   ' }), /vacío/);
  assert.equal(T.agregarMaterial(st, { nombre: 'a', texto: 'x'.repeat(60000) }), null);
  assert.match(T.agregarMaterial(st, { nombre: 'b', texto: 'y' }), /límite es 60/);
  for (let i = 0; i < 5; i++) assert.equal(T.agregarMaterial(st, { nombre: 'p' + i, pdfBase64: PDF }), null);
  assert.match(T.agregarMaterial(st, { nombre: 'p6', pdfBase64: PDF }), /hasta 5 PDF/);
  const st2 = T.crearEstadoTutorReal();
  const grande = Buffer.alloc(5 * 1024 * 1024 + 1).toString('base64');
  assert.match(T.agregarMaterial(st2, { nombre: 'g.pdf', pdfBase64: grande }), /más de 5 MB/);
});

test('quitar material lo saca de lo que se envía', () => {
  const st = T.crearEstadoTutorReal();
  T.agregarMaterial(st, { nombre: 'A', texto: 'uno' });
  T.agregarMaterial(st, { nombre: 'B', texto: 'dos' });
  T.quitarMaterial(st, st.material[0].id);
  assert.deepEqual(T.cuerpoPregunta(st, 'hola').material, [{ nombre: 'B', texto: 'dos' }]);
});

test('lo que se envía no lleva nombres del estudiante ni ids internos', () => {
  const st = T.crearEstadoTutorReal();
  T.agregarMaterial(st, { nombre: 'Guía', texto: 'La mediana es el valor central.' });
  T.agregarMaterial(st, { nombre: 'g.pdf', pdfBase64: PDF });
  T.registrarIntercambio(st, '¿Qué es la mediana?', { respuesta: '¿Qué harías primero?', tipo: 'pregunta', fuentes: ['Guía'], cita: 'La mediana es el valor central', citaEstado: 'verificada', costoUSD: 0.002 });
  const cuerpo = T.cuerpoPregunta(st, '  ¿y la moda?  ');
  assert.deepEqual(Object.keys(cuerpo).sort(), ['historial', 'material', 'pregunta', 'reglas']);
  assert.equal(cuerpo.pregunta, '¿y la moda?');
  assert.deepEqual(cuerpo.material, [{ nombre: 'Guía', texto: 'La mediana es el valor central.' }, { nombre: 'g.pdf', pdfBase64: PDF }]);
  assert.deepEqual(cuerpo.historial, [
    { rol: 'alumno', texto: '¿Qué es la mediana?', tipo: null },
    { rol: 'tutor', texto: '¿Qué harías primero?', tipo: 'pregunta' }
  ]);
  assert.equal(cuerpo.reglas.permitirEjemplo, false);
  assert.ok(!/nombre_?estudiante|alumno":\s*\{/.test(JSON.stringify(cuerpo)));
});

test('registra cita, fuentes y costo de cada respuesta', () => {
  const st = T.crearEstadoTutorReal();
  T.registrarIntercambio(st, 'p', { respuesta: 'r', tipo: 'sin_material', fuentes: [], cita: '', citaEstado: null, costoUSD: 0.001 });
  T.registrarIntercambio(st, 'p2', { respuesta: 'r2', tipo: 'pista', fuentes: ['Guía'], cita: 'c', citaEstado: 'verificada', costoUSD: 0.002 });
  assert.equal(st.mensajes.length, 4);
  assert.equal(st.mensajes[1].tipo, 'sin_material');
  assert.equal(T.ETIQUETA_TIPO.sin_material.texto, 'No está en el material');
  assert.deepEqual(st.mensajes[3].fuentes, ['Guía']);
  assert.ok(Math.abs(st.costoUSD - 0.003) < 1e-9);
});

/* ---------- js/ia.js real: pedirTutor ---------- */
test('pedirTutor envía a api/tutor y devuelve la respuesta', async () => {
  const llamadas = [];
  const fetch = async (url, op) => { llamadas.push({ url, cuerpo: JSON.parse(op.body) }); return { ok: true, status: 200, json: async () => ({ respuesta: 'Pista', tipo: 'pista', fuentes: [] }) }; };
  const leer = cargarScripts(['js/logica-privacidad.js', 'js/ia.js'], { fetch });
  const r = await leer('pedirTutor({ material: [{ nombre: "G", texto: "x" }], pregunta: "hola", historial: [], reglas: {} })');
  assert.equal(r.respuesta, 'Pista');
  assert.equal(llamadas[0].url, 'api/tutor');
  assert.equal(llamadas[0].cuerpo.pregunta, 'hola');
});

test('pedirTutor muestra el mensaje del servidor cuando se pasa el límite de gasto', async () => {
  const fetch = async () => ({ ok: false, status: 429, json: async () => ({ error: { codigo: 'limite_ip', mensaje: 'Se hicieron demasiadas solicitudes desde esta conexión en la última hora.' } }) });
  const leer = cargarScripts(['js/logica-privacidad.js', 'js/ia.js'], { fetch });
  await assert.rejects(leer('pedirTutor({})'), e => e.codigo === 'limite_ip' && /demasiadas solicitudes/.test(e.message));
});
