/* ============================================================
   Protección para el despliegue público (Render):
   - Clave de acceso (CLAVE_ACCESO): sin ella no se ve la página ni se
     llama a la IA. Se guarda en una cookie firmada; la clave no viaja
     de vuelta al navegador.
   - Límite de llamadas por IP y de intentos fallidos de acceso.
   - Cabeceras de seguridad básicas.
   ============================================================ */
const crypto = require('node:crypto');

const COOKIE = 'ce_acceso';
const DURACION_COOKIE_S = 12 * 3600;

// Ventana deslizante en memoria: permite `max` eventos por `ventanaMs` y por llave.
function crearLimitador({ max, ventanaMs, ahora = () => Date.now() }) {
  const marcas = new Map();
  const vigentes = llave => {
    const desde = ahora() - ventanaMs;
    const lista = (marcas.get(llave) || []).filter(m => m > desde);
    if (lista.length) marcas.set(llave, lista); else marcas.delete(llave);
    return lista;
  };
  return {
    permitir(llave) {
      const lista = vigentes(llave);
      if (lista.length >= max) return false;
      lista.push(ahora());
      marcas.set(llave, lista);
      return true;
    },
    // Cuenta sin consumir (para intentos fallidos se registra aparte).
    agotado: llave => vigentes(llave).length >= max,
    registrar(llave) { const l = vigentes(llave); l.push(ahora()); marcas.set(llave, l); }
  };
}

// IP del cliente. Detrás del proxy de Render, la real viene en X-Forwarded-For.
function ipDe(req, confiarProxy) {
  if (confiarProxy) {
    const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (xff) return xff;
  }
  return req.socket.remoteAddress || 'desconocida';
}

function ficha(claveAcceso) {
  return crypto.createHmac('sha256', claveAcceso).update('conectaedu-acceso-v1').digest('hex');
}

// Comparación en tiempo constante (no revela cuántos caracteres coinciden).
function iguales(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function leerCookies(req) {
  const salida = {};
  String(req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) salida[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return salida;
}

function cabecerasSeguridad(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
}

function paginaAcceso(mensaje) {
  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>ConectaEdu · Acceso</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><style>' +
    'body{margin:0;font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;background:#F7F5F0;color:#18222F;display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}' +
    'main{width:min(380px,100%)}h1{font-size:22px;color:#0B3A6E;margin:0 0 6px}p{color:#4F5B6C;margin:0 0 18px;font-size:15px}' +
    'label{display:block;font-weight:600;font-size:14px;margin-bottom:6px}input{width:100%;box-sizing:border-box;font:inherit;padding:11px 12px;border:1px solid #B9C3D1;border-radius:8px;background:#fff}' +
    'input:focus-visible,button:focus-visible{outline:3px solid #1F5FA8;outline-offset:2px}button{margin-top:12px;width:100%;font:inherit;font-weight:600;padding:11px;border:0;border-radius:8px;background:#0B3A6E;color:#fff;cursor:pointer}' +
    '.error{color:#B5352E;font-weight:600;margin:0 0 12px}</style></head><body><main>' +
    '<h1>ConectaEdu</h1><p>Demostración privada. Escribe la clave de acceso que te dio el equipo.</p>' +
    (mensaje ? '<p class="error" role="alert">' + mensaje + '</p>' : '') +
    '<form method="post" action="acceso"><label for="clave">Clave de acceso</label>' +
    '<input id="clave" name="clave" type="password" autocomplete="current-password" required autofocus>' +
    '<button type="submit">Entrar</button></form></main></body></html>';
}

function leerFormulario(req, limite = 4096) {
  return new Promise(resolver => {
    let datos = '';
    req.on('data', d => { datos += d; if (datos.length > limite) { datos = ''; req.destroy(); } });
    req.on('end', () => resolver(new URLSearchParams(datos)));
    req.on('error', () => resolver(new URLSearchParams()));
  });
}

// Devuelve un "portero" que decide si la solicitud sigue o ya fue respondida.
// opciones: { claveAcceso, confiarProxy, intentosMax, ventanaIntentosMs, ahora }
function crearPortero({ claveAcceso, confiarProxy = false, intentosMax = 10, ventanaIntentosMs = 15 * 60e3, ahora } = {}) {
  const fallos = crearLimitador({ max: intentosMax, ventanaMs: ventanaIntentosMs, ahora });
  const esperada = claveAcceso ? ficha(claveAcceso) : null;

  const autorizado = req => !esperada || iguales(leerCookies(req)[COOKIE] || '', esperada);

  function darCookie(req, res) {
    const segura = confiarProxy && String(req.headers['x-forwarded-proto'] || '').includes('https');
    res.setHeader('Set-Cookie', COOKIE + '=' + esperada + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + DURACION_COOKIE_S + (segura ? '; Secure' : ''));
  }
  const html = (res, estado, cuerpo) => { res.writeHead(estado, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(cuerpo); };
  const ir = (res, destino) => { res.writeHead(303, { Location: destino, 'Cache-Control': 'no-store' }); res.end(); };

  // true = la solicitud puede seguir; false = ya se respondió.
  return async function portero(req, res) {
    cabecerasSeguridad(res);
    const url = new URL(req.url, 'http://localhost');
    const ruta = url.pathname;
    if (ruta === '/salud') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('{"estado":"ok"}');
      return false;
    }
    if (!esperada) return true;
    const ip = ipDe(req, confiarProxy);

    const intentar = (valor, alFallar) => {
      if (fallos.agotado(ip)) { html(res, 429, paginaAcceso('Demasiados intentos fallidos. Espera 15 minutos.')); return; }
      if (iguales(valor, claveAcceso)) { darCookie(req, res); ir(res, '/'); return; }
      fallos.registrar(ip);
      alFallar();
    };

    if (ruta === '/acceso' && req.method === 'POST') {
      const form = await leerFormulario(req);
      intentar(form.get('clave') || '', () => html(res, 401, paginaAcceso('La clave no es correcta.')));
      return false;
    }
    // Enlace del QR: /?acceso=CLAVE entra directo y la clave sale de la barra de direcciones.
    if (url.searchParams.has('acceso')) {
      intentar(url.searchParams.get('acceso'), () => ir(res, '/acceso'));
      return false;
    }
    if (autorizado(req)) {
      if (ruta === '/acceso') { ir(res, '/'); return false; }
      return true;
    }
    if (ruta === '/acceso' || ruta === '/favicon.svg') {
      if (ruta === '/acceso') { html(res, 200, paginaAcceso('')); return false; }
      return true;
    }
    if (ruta.startsWith('/api/')) {
      res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ error: { codigo: 'sin_acceso', mensaje: 'Falta la clave de acceso. Recarga la página e ingrésala.' } }));
      return false;
    }
    ir(res, '/acceso');
    return false;
  };
}

// Evita publicar la IA sin protección: fuera de localhost, con clave de IA, exige CLAVE_ACCESO.
function problemaDeDespliegue(config) {
  const local = ['127.0.0.1', 'localhost', '::1'].includes(config.host);
  if (!local && config.clave && !config.claveAcceso) {
    return 'El servidor escucha en ' + config.host + ' con IA real pero sin CLAVE_ACCESO. Configura CLAVE_ACCESO para no exponer la clave de IA a cualquiera.';
  }
  return null;
}

module.exports = { crearPortero, crearLimitador, ipDe, problemaDeDespliegue, COOKIE };
