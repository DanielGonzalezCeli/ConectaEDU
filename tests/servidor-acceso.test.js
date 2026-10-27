// Pruebas del despliegue público: clave de acceso, límite por IP, /salud y cabeceras.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { crearServidor } = require('../servidor.js');
const { leerConfig } = require('../servidor/entorno');
const { problemaDeDespliegue, crearLimitador } = require('../servidor/acceso');
const { respuestaModelo, crearFetchFalso, salidaCalificacion } = require('./falso-fetch');

const ACCESO = 'clave-de-acceso-de-prueba';
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
const formulario = clave => ({ method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'clave=' + encodeURIComponent(clave) });

test('sin CLAVE_ACCESO todo queda abierto como en local, y /salud responde', async () => {
  await conServidor({}, async pedir => {
    assert.equal((await pedir('/')).status, 200);
    assert.equal((await pedir('/api/estado')).status, 200);
    const s = await pedir('/salud');
    assert.equal(s.status, 200);
    assert.deepEqual(await s.json(), { estado: 'ok' });
  });
});

test('con CLAVE_ACCESO la página y la API piden acceso; /salud y el favicon no', async () => {
  await conServidor({ CLAVE_ACCESO: ACCESO }, async pedir => {
    const raiz = await pedir('/');
    assert.equal(raiz.status, 303);
    assert.equal(raiz.headers.get('location'), '/acceso');
    const api = await pedir('/api/estado');
    assert.equal(api.status, 401);
    assert.equal((await api.json()).error.codigo, 'sin_acceso');
    assert.equal((await pedir('/js/datos.js')).status, 303);
    assert.equal((await pedir('/salud')).status, 200);
    assert.equal((await pedir('/favicon.svg')).status, 200);
    const pagina = await pedir('/acceso');
    assert.equal(pagina.status, 200);
    assert.match(await pagina.text(), /Clave de acceso/);
  });
});

test('una clave incorrecta no da acceso; la correcta da una cookie que no contiene la clave', async () => {
  await conServidor({ CLAVE_ACCESO: ACCESO }, async pedir => {
    const mal = await pedir('/acceso', formulario('otra'));
    assert.equal(mal.status, 401);
    assert.equal(mal.headers.get('set-cookie'), null);
    assert.match(await mal.text(), /no es correcta/);
    const bien = await pedir('/acceso', formulario(ACCESO));
    assert.equal(bien.status, 303);
    const cookie = bien.headers.get('set-cookie');
    assert.match(cookie, /^ce_acceso=[0-9a-f]{64}; Path=\/; HttpOnly; SameSite=Lax/);
    assert.ok(!cookie.includes(ACCESO));
    const conCookie = { headers: { cookie: cookie.split(';')[0] } };
    assert.equal((await pedir('/', conCookie)).status, 200);
    assert.equal((await pedir('/api/estado', conCookie)).status, 200);
    assert.equal((await pedir('/', { headers: { cookie: 'ce_acceso=' + 'a'.repeat(64) } })).status, 303, 'una cookie falsa no sirve');
  });
});

test('el enlace del QR (/?acceso=CLAVE) entra y redirige sin la clave en la dirección', async () => {
  await conServidor({ CLAVE_ACCESO: ACCESO }, async pedir => {
    const r = await pedir('/?acceso=' + encodeURIComponent(ACCESO));
    assert.equal(r.status, 303);
    assert.equal(r.headers.get('location'), '/');
    assert.ok(r.headers.get('set-cookie'));
    const mal = await pedir('/?acceso=nada');
    assert.equal(mal.headers.get('location'), '/acceso');
    assert.equal(mal.headers.get('set-cookie'), null);
  });
});

test('demasiados intentos fallidos desde la misma IP se bloquean', async () => {
  await conServidor({ CLAVE_ACCESO: ACCESO }, async pedir => {
    for (let i = 0; i < 10; i++) assert.equal((await pedir('/acceso', formulario('mala' + i))).status, 401);
    const bloqueado = await pedir('/acceso', formulario(ACCESO));
    assert.equal(bloqueado.status, 429, 'ni con la clave correcta mientras dura el bloqueo');
  });
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

test('no arranca en público con IA real y sin CLAVE_ACCESO', () => {
  assert.match(problemaDeDespliegue(leerConfig({ HOST: '0.0.0.0', PROVEEDOR_IA_CLAVE: 'x' })), /CLAVE_ACCESO/);
  assert.equal(problemaDeDespliegue(leerConfig({ HOST: '0.0.0.0', PROVEEDOR_IA_CLAVE: 'x', CLAVE_ACCESO: 'y' })), null);
  assert.equal(problemaDeDespliegue(leerConfig({ PROVEEDOR_IA_CLAVE: 'x' })), null, 'en localhost no hace falta');
});

test('el limitador libera cupo cuando pasa la ventana', () => {
  let t = 0;
  const l = crearLimitador({ max: 2, ventanaMs: 1000, ahora: () => t });
  assert.ok(l.permitir('a')); assert.ok(l.permitir('a')); assert.ok(!l.permitir('a'));
  assert.ok(l.permitir('b'));
  t = 1001;
  assert.ok(l.permitir('a'));
});
