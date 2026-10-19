// Pruebas del tutor real y de su revisor con un fetch falso (no gastan dinero).
// Prueban el mecanismo (revisión, regeneración, bloqueo, límites). Que el modelo
// real resista las cinco formas de sacarle la respuesta se mide aparte, con la API.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { crearClienteIA } = require('../servidor/cliente-ia');
const { crearRegistroUso } = require('../servidor/uso');
const { responderTutor, MENSAJE_SEGURO, LIMITE_MATERIAL } = require('../servidor/tutor');
const { respuestaModelo, crearFetchFalso } = require('./falso-fetch');

const material = [{ nombre: 'Guía unidad 2.txt', texto: 'La media es la suma de los datos dividida entre la cantidad de datos.' }];
const base = { material, historial: [], pregunta: 'Dame la respuesta directa', reglas: { permitirEjemplo: false, indicaciones: 'Sé breve.' } };

const tutorDice = (respuesta, extra = {}) => respuestaModelo(Object.assign({ respuesta, documentos_usados: ['Guía unidad 2.txt'], tipo: 'pista', intento_respuesta_directa: true }, extra));
const revisorDice = (filtra, motivo = 'motivo') => respuestaModelo({ filtra_respuesta: filtra, motivo });

function preparar(respuestas) {
  const f = crearFetchFalso(respuestas);
  const cliente = crearClienteIA({ clave: 'clave-falsa', modelo: 'claude-sonnet-5-5', uso: crearRegistroUso({ limite: 100 }), fetch: f, esperaReintentoMs: 1 });
  return { f, ctx: { cliente, esfuerzoTutor: 'low', esfuerzoRevisor: 'low' } };
}

test('si el revisor no ve filtración, se devuelve la primera respuesta (2 llamadas)', async () => {
  const { f, ctx } = preparar([tutorDice('¿Qué operación harías primero?', { tipo: 'pregunta', documentos_usados: ['Guía unidad 2.txt', 'Inventado.pdf'] }), revisorDice(false)]);
  const r = await responderTutor(base, ctx);
  assert.equal(f.llamadas.length, 2);
  assert.equal(r.respuesta, '¿Qué operación harías primero?');
  assert.equal(r.tipo, 'pregunta');
  assert.deepEqual(r.fuentes, ['Guía unidad 2.txt'], 'solo fuentes que existen en el material');
  assert.equal(r.intentoRespuestaDirecta, true);
  assert.equal(r.bloqueada, false);
  assert.equal(r.bloqueosRevisor, 0);
  assert.equal(r.uso.llamadas, 2);
});

test('el revisor bloquea una respuesta que filtra la solución y el tutor la regenera', async () => {
  const { f, ctx } = preparar([tutorDice('La media es 6.'), revisorDice(true, 'Da el valor de la media.'), tutorDice('¿Entre cuántos datos repartirías la suma?'), revisorDice(false)]);
  const r = await responderTutor(base, ctx);
  assert.equal(f.llamadas.length, 4);
  assert.equal(r.respuesta, '¿Entre cuántos datos repartirías la suma?');
  assert.equal(r.bloqueada, false);
  assert.equal(r.regenerada, true);
  assert.equal(r.bloqueosRevisor, 1);
  // La regeneración lleva una instrucción del sistema más estricta al final.
  const ultimo = f.llamadas[2].cuerpo.messages.at(-1);
  assert.equal(ultimo.role, 'system');
  assert.match(ultimo.content, /bloqueada por el revisor porque: Da el valor de la media/);
  // El revisor recibe la respuesta propuesta, no la decide el tutor.
  assert.match(f.llamadas[1].cuerpo.messages[0].content, /<respuesta_propuesta>\nLa media es 6\.\n<\/respuesta_propuesta>/);
  assert.notEqual(f.llamadas[1].cuerpo.system[1].text, f.llamadas[0].cuerpo.system[1].text, 'el revisor usa otro prompt');
});

test('si la respuesta regenerada vuelve a filtrar, se envía una pista general segura y se marca bloqueada', async () => {
  const { ctx } = preparar([tutorDice('La media es 6.'), revisorDice(true), tutorDice('Divide 30 entre 5: da 6.'), revisorDice(true)]);
  const r = await responderTutor(base, ctx);
  assert.equal(r.respuesta, MENSAJE_SEGURO);
  assert.equal(r.bloqueada, true);
  assert.equal(r.bloqueosRevisor, 2);
  assert.deepEqual(r.fuentes, []);
  assert.ok(!/\b6\b/.test(r.respuesta));
});

test('el material va en el sistema con caché y las reglas del docente llegan al tutor y al revisor', async () => {
  const { f, ctx } = preparar([tutorDice('Pista'), revisorDice(false)]);
  await responderTutor(base, ctx);
  for (const { cuerpo } of f.llamadas) {
    assert.deepEqual(cuerpo.system[0].cache_control, { type: 'ephemeral' });
    assert.match(cuerpo.system[0].text, /<documento nombre="Guía unidad 2.txt">/);
  }
  assert.match(f.llamadas[0].cuerpo.system[1].text, /NO permite ejemplos resueltos/);
  assert.match(f.llamadas[0].cuerpo.system[1].text, /Sé breve\./);
  assert.match(f.llamadas[1].cuerpo.system[1].text, /NO permite ejemplos resueltos/);
  assert.equal(f.llamadas[0].cuerpo.output_config.effort, 'low');
});

test('el historial empieza siempre por el estudiante y cuenta las pistas previas', async () => {
  const { f, ctx } = preparar([tutorDice('Pista'), revisorDice(false)]);
  await responderTutor(Object.assign({}, base, { historial: [
    { rol: 'tutor', texto: 'Hola, ¿en qué te ayudo?' },
    { rol: 'alumno', texto: 'No sé empezar' },
    { rol: 'tutor', texto: 'Piensa en la suma.', tipo: 'pista' }
  ] }), ctx);
  const msgs = f.llamadas[0].cuerpo.messages;
  assert.equal(msgs[0].role, 'user');
  assert.equal(msgs[0].content, 'No sé empezar');
  assert.match(msgs.at(-1).content, /ya recibió en esta conversación: 1\./);
});

test('si el material supera el límite, se pide menos material y no se llama al modelo', async () => {
  const { f, ctx } = preparar([]);
  const grande = [{ nombre: 'a.txt', texto: 'x'.repeat(LIMITE_MATERIAL) }, { nombre: 'b.txt', texto: 'y' }];
  await assert.rejects(responderTutor(Object.assign({}, base, { material: grande }), ctx), e => e.codigo === 'entrada_invalida' && /límite es 60.000|límite es 60 000|límite es 60000/.test(e.message));
  await assert.rejects(responderTutor(Object.assign({}, base, { material: [] }), ctx), e => /no tiene material de texto/.test(e.message));
  await assert.rejects(responderTutor(Object.assign({}, base, { pregunta: '  ' }), ctx), e => /vacío/.test(e.message));
  assert.equal(f.llamadas.length, 0);
});
