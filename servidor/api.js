/* ============================================================
   Rutas /api/*. Sin clave, el modo es simulado: /api/estado lo dice y
   las rutas de IA responden con un error claro (la app no las llama).
   ============================================================ */
const path = require('node:path');
const { ErrorIA, cuerpoError } = require('./errores');
const { crearClienteIA } = require('./cliente-ia');
const { crearRegistroUso, costoUSD } = require('./uso');
const { calificar } = require('./calificar');
const { responderTutor } = require('./tutor');
const { crearLimitador, ipDe } = require('./acceso');

const LIMITE_CUERPO = 8 * 1024 * 1024; // 8 MB por solicitud

function leerJSON(req, limite = LIMITE_CUERPO) {
  return new Promise((resolver, rechazar) => {
    const tipo = String(req.headers['content-type'] || '');
    // Exigir JSON impide que otra página web envíe formularios a este servidor local.
    if (!/^application\/json\b/i.test(tipo)) { req.resume(); return rechazar(new ErrorIA('tipo_contenido')); }
    const partes = [];
    let total = 0, cortado = false;
    req.on('data', d => {
      if (cortado) return;
      total += d.length;
      if (total > limite) { cortado = true; rechazar(new ErrorIA('muy_grande', 'La solicitud supera el límite de 8 MB.')); return; }
      partes.push(d);
    });
    req.on('end', () => {
      if (cortado) return;
      try { resolver(JSON.parse(Buffer.concat(partes).toString('utf8') || '{}')); }
      catch (e) { rechazar(new ErrorIA('entrada_invalida', 'El cuerpo de la solicitud no es JSON válido.')); }
    });
    req.on('error', () => rechazar(new ErrorIA('entrada_invalida')));
  });
}

function enviarJSON(res, estado, objeto) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(objeto));
}

// opciones: { config, fetch?, rutaUso?, ahora?, esperaReintentoMs?, tiempoEsperaMs? }
function crearAPI({ config, fetch, rutaUso = path.join(__dirname, '..', 'resultados', 'uso.csv'), ahora, esperaReintentoMs, tiempoEsperaMs }) {
  const uso = crearRegistroUso({ limite: config.limite, ruta: rutaUso, ahora });
  const porIp = crearLimitador({ max: config.limitePorIp || 40, ventanaMs: 3600e3, ahora });
  const revisarIp = req => { if (!porIp.permitir(ipDe(req, config.confiarProxy))) throw new ErrorIA('limite_ip'); };
  const cliente = config.clave
    ? crearClienteIA({ clave: config.clave, modelo: config.modelo, uso, fetch, esperaReintentoMs, tiempoEsperaMs })
    : null;

  const estado = () => {
    const r = uso.resumen();
    return { modoIA: config.modoIA, modelo: config.modoIA === 'real' ? config.modelo : null, llamadasUsadas: r.llamadasUsadas, limite: r.limite, sesion: r.sesion };
  };

  const RUTAS = {
    'GET /api/estado': async () => estado(),
    'POST /api/calificar': async req => {
      if (!cliente) throw new ErrorIA('sin_clave');
      revisarIp(req);
      const resultado = await calificar(await leerJSON(req), { cliente, esfuerzo: config.esfuerzo.calificar });
      // Costo con los tokens medidos y la tarifa pública (null si el modelo no está en la tabla).
      return Object.assign(resultado, { costoUSD: costoUSD(resultado.modelo, resultado.uso), estadoIA: estado() });
    },
    'POST /api/tutor': async req => {
      if (!cliente) throw new ErrorIA('sin_clave');
      revisarIp(req);
      const resultado = await responderTutor(await leerJSON(req), { cliente, esfuerzoTutor: config.esfuerzo.tutor, esfuerzoRevisor: config.esfuerzo.revisor });
      return Object.assign(resultado, { costoUSD: costoUSD(resultado.modelo, resultado.uso), estadoIA: estado() });
    }
  };

  return async function manejarAPI(req, res) {
    const ruta = req.method + ' ' + new URL(req.url, 'http://localhost').pathname;
    const accion = RUTAS[ruta];
    try {
      if (!accion) throw new ErrorIA('no_encontrado');
      enviarJSON(res, 200, await accion(req));
    } catch (err) {
      if (!(err instanceof ErrorIA)) console.error('Error interno en ' + ruta + ': ' + (err && err.name)); // sin contenido
      const { estado: codigo, cuerpo } = cuerpoError(err, config.clave);
      cuerpo.estadoIA = estado();
      enviarJSON(res, codigo, cuerpo);
    }
  };
}

module.exports = { crearAPI, leerJSON, LIMITE_CUERPO };
