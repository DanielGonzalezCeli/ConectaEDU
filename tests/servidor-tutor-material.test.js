// Tutor real con material pegado o subido (texto o PDF) y cita del material.
// Fetch falso: no sale a internet ni gasta dinero.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { crearClienteIA } = require('../servidor/cliente-ia');
const { crearRegistroUso } = require('../servidor/uso');
const { responderTutor, MENSAJE_SEGURO } = require('../servidor/tutor');
const { crearServidor } = require('../servidor.js');
const { leerConfig } = require('../servidor/entorno');
const { respuestaModelo, crearFetchFalso } = require('./falso-fetch');

const TEXTO = 'La media aritmética es la suma de los datos dividida entre la cantidad de datos. La mediana es el valor central de los datos ordenados.';
const textoMat = [{ nombre: 'Apuntes.txt', texto: TEXTO }];
// Un PDF mínimo: lo que importa es la firma %PDF; el modelo es falso.
const PDF = Buffer.from('%PDF-1.4\n% PDF de prueba\n%%EOF').toString('base64');
const pdfMat = [{ nombre: 'Guía.pdf', pdfBase64: PDF }];
const base = { historial: [], pregunta: '¿Qué es la mediana?', reglas: {} };

const tutorDice = (extra = {}) => respuestaModelo(Object.assign({ respuesta: 'Piensa en el valor que queda en el centro.', documentos_usados: ['Apuntes.txt'], cita: 'La mediana es el valor central de los datos ordenados', tipo: 'pista', intento_respuesta_directa: false }, extra));
const revisorDice = (filtra, motivo = 'motivo') => respuestaModelo({ filtra_respuesta: filtra, motivo });

function preparar(respuestas) {
  const f = crearFetchFalso(respuestas);
  const cliente = crearClienteIA({ clave: 'clave-falsa', modelo: 'claude-sonnet-5-5', uso: crearRegistroUso({ limite: 100 }), fetch: f, esperaReintentoMs: 1 });
  return { f, ctx: { cliente, esfuerzoTutor: 'low', esfuerzoRevisor: 'low' } };
}
const con = material => Object.assign({}, base, { material });

/* ---------- Cita del material ---------- */
test('la respuesta trae una cita que se verifica literalmente en el material de texto', async () => {
  const { ctx } = preparar([tutorDice(), revisorDice(false)]);
  const r = await responderTutor(con(textoMat), ctx);
  assert.equal(r.cita, 'La mediana es el valor central de los datos ordenados');
  assert.equal(r.citaEstado, 'verificada');
  assert.deepEqual(r.fuentes, ['Apuntes.txt']);
});

test('una cita que no está en el material no se muestra (no se inventa)', async () => {
  const { ctx } = preparar([tutorDice({ cita: 'La mediana siempre es igual a la media' }), revisorDice(false)]);
  const r = await responderTutor(con(textoMat), ctx);
  assert.equal(r.cita, '');
  assert.equal(r.citaEstado, 'no_verificada');
});

test('si la respuesta no está en el material, se dice y no hay cita ni fuentes', async () => {
  const { ctx } = preparar([tutorDice({ respuesta: 'Eso no aparece en el material de tu docente.', tipo: 'sin_material', documentos_usados: ['Apuntes.txt'], cita: 'La media aritmética es la suma' }), revisorDice(false)]);
  const r = await responderTutor(Object.assign(con(textoMat), { pregunta: '¿Quién inventó la estadística?' }), ctx);
  assert.equal(r.tipo, 'sin_material');
  assert.match(r.respuesta, /no aparece en el material/);
  assert.equal(r.cita, '');
  assert.deepEqual(r.fuentes, []);
});

test('las instrucciones piden decir que no está en el material, citar literal y no citar la solución', async () => {
  const { f, ctx } = preparar([tutorDice(), revisorDice(false)]);
  await responderTutor(con(textoMat), ctx);
  const instrucciones = f.llamadas[0].cuerpo.system[1].text;
  assert.match(instrucciones, /Eso no aparece en el material de tu docente/);
  assert.match(instrucciones, /"cita" copia LITERALMENTE/);
  assert.match(instrucciones, /Nunca cites una parte del material que contenga el resultado/);
  assert.ok(f.llamadas[0].cuerpo.output_config.format.schema.required.includes('cita'));
});

test('el revisor también revisa la cita: una cita que filtra la solución se bloquea', async () => {
  const filtra = tutorDice({ respuesta: 'Revisa el ejemplo resuelto.', cita: 'Resultado: la media es 6' });
  const { f, ctx } = preparar([filtra, revisorDice(true, 'La cita da el resultado.'), filtra, revisorDice(true)]);
  const r = await responderTutor(con([{ nombre: 'Apuntes.txt', texto: TEXTO + ' Resultado: la media es 6' }]), ctx);
  assert.match(f.llamadas[1].cuerpo.messages.at(-1).content, /Cita del material que se mostrará: «Resultado: la media es 6»/);
  assert.equal(r.bloqueada, true);
  assert.equal(r.respuesta, MENSAJE_SEGURO);
  assert.equal(r.cita, '');
});

test('si la pregunta es una tarea, el tutor da una pista y el mecanismo de regeneración sigue igual', async () => {
  const { ctx } = preparar([tutorDice({ respuesta: 'La mediana de 3, 1, 2 es 2.', intento_respuesta_directa: true }), revisorDice(true, 'Da el resultado.'),
    tutorDice({ respuesta: '¿Qué harías primero con los datos antes de buscar el centro?', tipo: 'pregunta' }), revisorDice(false)]);
  const r = await responderTutor(Object.assign(con(textoMat), { pregunta: 'Resuelve mi tarea: mediana de 3, 1, 2' }), ctx);
  assert.equal(r.regenerada, true);
  assert.equal(r.intentoRespuestaDirecta, true);
  assert.ok(!/\b2\b/.test(r.respuesta));
});

/* ---------- Material en PDF ---------- */
test('un PDF va como documento al inicio, con caché, y llega al tutor y al revisor', async () => {
  const { f, ctx } = preparar([tutorDice({ documentos_usados: ['Guía.pdf'], cita: 'texto del PDF' }), revisorDice(false)]);
  const r = await responderTutor(con(pdfMat), ctx);
  for (const { cuerpo } of f.llamadas) {
    const primero = cuerpo.messages[0];
    assert.equal(primero.role, 'user');
    const doc = primero.content.find(b => b.type === 'document');
    assert.equal(doc.source.media_type, 'application/pdf');
    assert.equal(doc.source.data, PDF);
    assert.deepEqual(primero.content.at(-1).cache_control, { type: 'ephemeral' });
    assert.ok(primero.content.some(b => b.type === 'text' && /«Guía\.pdf»/.test(b.text)));
  }
  assert.deepEqual(r.fuentes, ['Guía.pdf']);
  assert.equal(r.citaEstado, 'no_verificable', 'una cita de un PDF no se puede comprobar automáticamente');
  assert.equal(r.cita, 'texto del PDF');
});

test('texto y PDF juntos: el texto sigue en el sistema y la pregunta va al final', async () => {
  const { f, ctx } = preparar([tutorDice(), revisorDice(false)]);
  await responderTutor(con(textoMat.concat(pdfMat)), ctx);
  const cuerpo = f.llamadas[0].cuerpo;
  assert.match(cuerpo.system[0].text, /<documento nombre="Apuntes.txt">/);
  assert.match(cuerpo.messages.at(-1).content, /<mensaje_estudiante>\n¿Qué es la mediana\?/);
});

test('PDF inválido o demasiado grande: error claro y ninguna llamada al modelo', async () => {
  const { f, ctx } = preparar([]);
  const noPdf = [{ nombre: 'falso.pdf', pdfBase64: Buffer.from('hola').toString('base64') }];
  await assert.rejects(responderTutor(con(noPdf), ctx), e => e.codigo === 'entrada_invalida' && /no parece un PDF válido/.test(e.message));
  const grande = [{ nombre: 'grande.pdf', pdfBase64: Buffer.concat([Buffer.from('%PDF'), Buffer.alloc(5 * 1024 * 1024)]).toString('base64') }];
  await assert.rejects(responderTutor(con(grande), ctx), e => /supera los 5 MB/.test(e.message));
  const seis = Array.from({ length: 6 }, (_, i) => ({ nombre: 'p' + i + '.pdf', pdfBase64: PDF }));
  await assert.rejects(responderTutor(con(seis), ctx), e => /hasta 5 PDF/.test(e.message));
  assert.equal(f.llamadas.length, 0);
});

/* ---------- La ruta HTTP usa los mismos límites de gasto ---------- */
test('POST /api/tutor con PDF respeta el límite por IP y no expone la clave', async () => {
  const f = crearFetchFalso(Array.from({ length: 4 }, (_, i) => i % 2 ? revisorDice(false) : tutorDice({ documentos_usados: ['Guía.pdf'] })));
  const config = leerConfig({ PROVEEDOR_IA_CLAVE: 'clave-falsa-de-prueba', LIMITE_POR_IP_POR_HORA: '2' });
  const servidor = crearServidor({ config, fetch: f, rutaUso: null, esperaReintentoMs: 1 });
  await new Promise(r => servidor.listen(0, '127.0.0.1', r));
  const base_ = 'http://127.0.0.1:' + servidor.address().port;
  const pedir = () => fetch(base_ + '/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(con(pdfMat)) })
    .then(async r => ({ estado: r.status, texto: await r.text() }));
  try {
    const r1 = await pedir();
    const r2 = await pedir();
    const r3 = await pedir();
    assert.equal(r1.estado, 200);
    assert.equal(JSON.parse(r1.texto).fuentes[0], 'Guía.pdf');
    assert.equal(r2.estado, 200);
    assert.equal(r3.estado, 429, 'la tercera pasa el límite de 2 por IP');
    assert.equal(JSON.parse(r3.texto).error.codigo, 'limite_ip');
    assert.equal(f.llamadas.length, 4, 'la tercera no llega al modelo');
    for (const r of [r1, r2, r3]) assert.ok(!r.texto.includes('clave-falsa-de-prueba'));
  } finally {
    await new Promise(r => servidor.close(r));
  }
});
