// Pruebas de las rutas HTTP con un servidor real en un puerto libre y un fetch
// falso hacia el proveedor (no salen a internet ni gastan dinero).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { crearServidor } = require('../servidor.js');
const { leerConfig } = require('../servidor/entorno');
const { respuestaModelo, respuestaError, crearFetchFalso, salidaCalificacion } = require('./falso-fetch');

const CLAVE = 'sk-ant-api03-CLAVE-DE-PRUEBA-NO-REAL-123';
const rubrica = { nombre: 'R', criterios: [{ nombre: 'Contenido', desc: '', max: 5 }, { nombre: 'Forma', desc: '', max: 5 }] };
const texto = 'Este es un trabajo de prueba con suficiente texto para citar.';
const okCalificacion = () => respuestaModelo(salidaCalificacion(rubrica.criterios, texto));

async function conServidor(opciones, prueba) {
  const servidor = crearServidor(Object.assign({ rutaUso: null, esperaReintentoMs: 1 }, opciones));
  await new Promise(r => servidor.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + servidor.address().port;
  const pedir = async (metodo, ruta, cuerpo, tipo = 'application/json') => {
    const r = await fetch(base + ruta, { method: metodo, headers: cuerpo !== undefined ? { 'content-type': tipo } : {}, body: cuerpo === undefined ? undefined : (typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo)) });
    const textoRespuesta = await r.text();
    let json = null; try { json = JSON.parse(textoRespuesta); } catch (e) { /* no JSON */ }
    return { estado: r.status, texto: textoRespuesta, json, cabeceras: [...r.headers].join('\n') };
  };
  try { await prueba(pedir); } finally { servidor.close(); }
}

test('sin clave: /api/estado dice "simulado" y las rutas de IA no llaman al proveedor', async () => {
  const f = crearFetchFalso([]);
  await conServidor({ config: leerConfig({}), fetch: f }, async pedir => {
    const e = await pedir('GET', '/api/estado');
    assert.equal(e.estado, 200);
    assert.equal(e.json.modoIA, 'simulado');
    assert.equal(e.json.modelo, null);
    assert.equal(e.json.limite, 60);
    const c = await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } });
    assert.equal(c.estado, 503);
    assert.equal(c.json.error.codigo, 'sin_clave');
    assert.match(c.json.error.mensaje, /falta PROVEEDOR_IA_CLAVE/);
    assert.equal((await pedir('POST', '/api/tutor', {})).json.error.codigo, 'sin_clave');
  });
  assert.equal(f.llamadas.length, 0);
});

test('la clave nunca aparece en ninguna respuesta, error ni cabecera', async () => {
  const f = crearFetchFalso([
    okCalificacion(),
    respuestaError(401, 'invalid x-api-key: ' + CLAVE),
    respuestaError(400, 'Your credit balance is too low. key=' + CLAVE),
    respuestaError(400, 'campo raro; clave ' + CLAVE),
    respuestaError(500, CLAVE)
  ]);
  const config = leerConfig({ PROVEEDOR_IA_CLAVE: CLAVE });
  await conServidor({ config, fetch: f }, async pedir => {
    const respuestas = [
      await pedir('GET', '/api/estado'),
      await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } }),
      await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } }),
      await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } }),
      await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } }),
      await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } }),
      await pedir('POST', '/api/calificar', '{ no es json'),
      await pedir('GET', '/api/no-existe'),
      await pedir('GET', '/.env')
    ];
    assert.equal(respuestas[0].json.modoIA, 'real');
    assert.equal(respuestas[0].json.modelo, 'claude-sonnet-5-5');
    assert.equal(respuestas[1].estado, 200);
    assert.equal(respuestas[2].json.error.codigo, 'clave_invalida');
    assert.equal(respuestas[3].json.error.codigo, 'sin_credito');
    assert.equal(respuestas[4].json.error.codigo, 'solicitud_rechazada');
    assert.equal(respuestas[5].json.error.codigo, 'proveedor');
    assert.equal(respuestas[8].estado, 404, '.env no se sirve como archivo');
    for (const r of respuestas) {
      assert.ok(!r.texto.includes(CLAVE) && !r.cabeceras.includes(CLAVE), 'la clave apareció en: ' + r.texto);
      assert.ok(!/sk-ant-/.test(r.texto), 'apareció algo con forma de clave: ' + r.texto);
      assert.ok(!/x-api-key/i.test(r.cabeceras));
    }
  });
  // Al proveedor la clave solo va en la cabecera, nunca en el cuerpo.
  for (const l of f.llamadas) {
    assert.equal(l.opciones.headers['x-api-key'], CLAVE);
    assert.equal(l.opciones.headers['anthropic-version'], '2023-06-01');
    assert.ok(!l.opciones.body.includes(CLAVE));
  }
});

test('el tope de llamadas por hora corta antes de llamar al proveedor', async () => {
  const f = crearFetchFalso([okCalificacion(), okCalificacion(), okCalificacion()]);
  const config = leerConfig({ PROVEEDOR_IA_CLAVE: CLAVE, LIMITE_LLAMADAS_POR_HORA: '2' });
  await conServidor({ config, fetch: f }, async pedir => {
    assert.equal((await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } })).estado, 200);
    const segunda = await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } });
    assert.equal(segunda.json.estadoIA.llamadasUsadas, 2);
    const tercera = await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } });
    assert.equal(tercera.estado, 429);
    assert.equal(tercera.json.error.codigo, 'limite_local');
    assert.match(tercera.json.error.mensaje, /límite de 2 llamadas por hora/);
  });
  assert.equal(f.llamadas.length, 2);
});

test('el tope se libera cuando pasa una hora', async () => {
  let reloj = 0;
  const f = crearFetchFalso([okCalificacion(), okCalificacion()]);
  const config = leerConfig({ PROVEEDOR_IA_CLAVE: CLAVE, LIMITE_LLAMADAS_POR_HORA: '1' });
  await conServidor({ config, fetch: f, ahora: () => reloj }, async pedir => {
    assert.equal((await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } })).estado, 200);
    assert.equal((await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } })).estado, 429);
    reloj += 3600e3 + 1;
    assert.equal((await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } })).estado, 200);
  });
});

test('un 429 o 529 del proveedor se reintenta una vez', async () => {
  const f = crearFetchFalso([respuestaError(529, 'Overloaded'), okCalificacion(), respuestaError(429, 'rate', { 'retry-after': '0' }), respuestaError(429, 'rate')]);
  await conServidor({ config: leerConfig({ PROVEEDOR_IA_CLAVE: CLAVE }), fetch: f }, async pedir => {
    const r = await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } });
    assert.equal(r.estado, 200);
    assert.equal(r.json.estadoIA.llamadasUsadas, 2, 'el reintento también cuenta para el tope');
    const r2 = await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } });
    assert.equal(r2.estado, 429);
    assert.equal(r2.json.error.codigo, 'limite_proveedor');
  });
  assert.equal(f.llamadas.length, 4);
});

test('tiempo agotado, rechazo del modelo y respuesta cortada dan errores claros', async () => {
  const colgado = (cuerpo, opciones) => new Promise((_, rechazar) => opciones.signal.addEventListener('abort', () => rechazar(new Error('abortado'))));
  const f = crearFetchFalso([colgado, respuestaModelo('{}', { stop_reason: 'refusal' }), respuestaModelo('{"criterios":', { stop_reason: 'max_tokens' })]);
  await conServidor({ config: leerConfig({ PROVEEDOR_IA_CLAVE: CLAVE }), fetch: f, tiempoEsperaMs: 30 }, async pedir => {
    const a = await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } });
    assert.equal(a.estado, 504);
    assert.equal(a.json.error.codigo, 'tiempo_agotado');
    const b = await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } });
    assert.equal(b.estado, 422);
    assert.match(b.json.error.mensaje, /declinó/);
    const c = await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } });
    assert.equal(c.json.error.codigo, 'respuesta_cortada');
  });
});

test('solo se acepta JSON y con un tamaño máximo de 8 MB', async () => {
  const f = crearFetchFalso([]);
  await conServidor({ config: leerConfig({ PROVEEDOR_IA_CLAVE: CLAVE }), fetch: f }, async pedir => {
    const a = await pedir('POST', '/api/calificar', 'rubrica=1', 'text/plain');
    assert.equal(a.estado, 415);
    const b = await pedir('POST', '/api/calificar', JSON.stringify({ relleno: 'x'.repeat(8 * 1024 * 1024 + 10) }));
    assert.equal(b.estado, 413);
    assert.equal(b.json.error.codigo, 'muy_grande');
  });
  assert.equal(f.llamadas.length, 0);
});

test('la respuesta de /api/calificar trae la forma que usa la pantalla', async () => {
  const f = crearFetchFalso([okCalificacion()]);
  await conServidor({ config: leerConfig({ PROVEEDOR_IA_CLAVE: CLAVE }), fetch: f }, async pedir => {
    const r = (await pedir('POST', '/api/calificar', { rubrica, trabajo: { texto } })).json;
    for (const k of ['puntos', 'just', 'cita', 'confianza', 'citas', 'advertencias', 'comentarioGeneral', 'uso', 'modelo']) assert.ok(k in r, 'falta ' + k);
    assert.deepEqual(r.puntos, [1, 1]);
    assert.equal(r.confianza, 'Alta');
    assert.equal(r.uso.tokensEntrada, 1000);
    assert.equal(r.uso.tokensSalida, 200);
    assert.equal(r.modelo, 'claude-sonnet-5-5');
    // 1000 tokens de entrada a US$ 2/M + 200 de salida a US$ 10/M = US$ 0,004
    assert.equal(r.costoUSD, 0.004);
  });
});
