// Pruebas del despliegue público: acceso libre, límite por IP, /salud y cabeceras.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { crearServidor } = require('../servidor.js');
const { leerConfig } = require('../servidor/entorno');
const { crearLimitador } = require('../servidor/acceso');
const { respuestaModelo, crearFetchFalso, salidaCalificacion } = require('./falso-fetch');

const rubrica = { nombre: 'R', criterios: [{ nombre: 'Contenido', desc: '', max: 5 }] };
const texto = 'Trabajo de prueba con suficiente texto para citar algo.';

async function conServidor(env, prueba, fetch = crearFetchFalso([])) {
  const servidor = crearServidor({ config: leerConfig(env), fetch, rutaUso: null, esperaReintentoMs: 1 });
  await new Promise(r => servidor.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + servidor.address().port;
  const pedir = (ruta, op = {}) => fetch_(base + ruta, Object.assign({ redirect: 'manual' }, op));
  try { await prueba(pedir); } finally { servidor.close(); }
}
const fetch_ = (...a) => globalThis.fetch(...a);

test('el acceso es libre: la página y la API responden sin clave, y /salud responde', async () => {
  await conServidor({}, async pedir => {
    assert.equal((await pedir('/')).status, 200);
    assert.equal((await pedir('/api/estado')).status, 200);
    const s = await pedir('/salud');
    assert.equal(s.status, 200);
    assert.deepEqual(await s.json(), { estado: 'ok' });
  });
});

test('aunque quede una CLAVE_ACCESO vieja en el entorno, ya no se pide clave', async () => {
  const rubrica2 = rubrica;
  const f = crearFetchFalso([respuestaModelo(salidaCalificacion(rubrica2.criterios, texto))]);
  await conServidor({ PROVEEDOR_IA_CLAVE: 'clave-falsa', CLAVE_ACCESO: 'vieja' }, async pedir => {
    assert.equal((await pedir('/')).status, 200);
    assert.equal((await pedir('/acceso')).status, 404, 'la página de acceso ya no existe');
    const r = await pedir('/api/calificar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rubrica: rubrica2, trabajo: { texto } }) });
    assert.equal(r.status, 200, 'el calificador funciona sin clave de acceso');
    assert.equal(r.headers.get('set-cookie'), null);
  }, f);
  assert.equal(f.llamadas.length, 1);
});

test('límite de solicitudes de IA por IP (detrás del proxy cuenta X-Forwarded-For)', async () => {
  const f = crearFetchFalso([1, 2, 3].map(() => respuestaModelo(salidaCalificacion(rubrica.criterios, texto))));
  await conServidor({ PROVEEDOR_IA_CLAVE: 'clave-falsa', LIMITE_POR_IP_POR_HORA: '1', CONFIAR_PROXY: '1' }, async pedir => {
    const calificar = ip => pedir('/api/calificar', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip + ', 10.0.0.1' }, body: JSON.stringify({ rubrica, trabajo: { texto } }) });
    assert.equal((await calificar('200.1.1.1')).status, 200);
    const segunda = await calificar('200.1.1.1');
    assert.equal(segunda.status, 429);
    assert.equal((await segunda.json()).error.codigo, 'limite_ip');
    assert.equal((await calificar('200.2.2.2')).status, 200, 'otra IP tiene su propio cupo');
  }, f);
  assert.equal(f.llamadas.length, 2);
});

test('cabeceras de seguridad en todas las respuestas', async () => {
  await conServidor({}, async pedir => {
    const r = await pedir('/');
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(r.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(r.headers.get('x-frame-options'), 'DENY');
  });
});

test('el limitador libera cupo cuando pasa la ventana', () => {
  let t = 0;
  const l = crearLimitador({ max: 2, ventanaMs: 1000, ahora: () => t });
  assert.ok(l.permitir('a')); assert.ok(l.permitir('a')); assert.ok(!l.permitir('a'));
  assert.ok(l.permitir('b'));
  t = 1001;
  assert.ok(l.permitir('a'));
});

/* ---------- /api/tutor tiene los mismos límites que /api/calificar ---------- */
const cuerpoTutor = JSON.stringify({ material: [{ nombre: 'Guía', texto: 'La mediana es el valor central de los datos ordenados.' }], pregunta: '¿Qué es la mediana?', historial: [], reglas: {} });
const tutorOk = () => respuestaModelo({ respuesta: '¿Qué harías primero con los datos?', documentos_usados: ['Guía'], cita: 'La mediana es el valor central', tipo: 'pregunta', intento_respuesta_directa: false });
const revisorOk = () => respuestaModelo({ filtra_respuesta: false, motivo: 'Solo pregunta.' });
const preguntarTutor = (pedir, ip = '200.1.1.1') => pedir('/api/tutor', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: cuerpoTutor });

test('/api/tutor respeta el límite por IP', async () => {
  const f = crearFetchFalso([tutorOk(), revisorOk(), tutorOk(), revisorOk()]);
  await conServidor({ PROVEEDOR_IA_CLAVE: 'clave-falsa', LIMITE_POR_IP_POR_HORA: '1', CONFIAR_PROXY: '1' }, async pedir => {
    assert.equal((await preguntarTutor(pedir, '200.1.1.1')).status, 200);
    const segunda = await preguntarTutor(pedir, '200.1.1.1');
    assert.equal(segunda.status, 429);
    assert.equal((await segunda.json()).error.codigo, 'limite_ip');
    assert.equal((await preguntarTutor(pedir, '200.2.2.2')).status, 200, 'otra IP tiene su propio cupo');
  }, f);
  assert.equal(f.llamadas.length, 4, 'dos preguntas aceptadas × (tutor + revisor)');
});

test('/api/tutor gasta del mismo tope por hora: cada pregunta usa dos llamadas (tutor y revisor)', async () => {
  const f = crearFetchFalso([tutorOk(), revisorOk(), tutorOk(), revisorOk()]);
  await conServidor({ PROVEEDOR_IA_CLAVE: 'clave-falsa', LIMITE_LLAMADAS_POR_HORA: '2' }, async pedir => {
    const primera = await preguntarTutor(pedir);
    assert.equal(primera.status, 200);
    assert.equal((await primera.json()).estadoIA.llamadasUsadas, 2);
    const segunda = await preguntarTutor(pedir);
    assert.equal(segunda.status, 429);
    assert.equal((await segunda.json()).error.codigo, 'limite_local');
  }, f);
  assert.equal(f.llamadas.length, 2);
});
