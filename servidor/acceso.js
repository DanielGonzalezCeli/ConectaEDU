/* ============================================================
   Protección para el despliegue público (Render):
   - Límite de llamadas por IP.
   - Cabeceras de seguridad básicas.
   El acceso es libre: no se pide clave para ver la página ni para
   usar el calificador o el tutor.
   ============================================================ */

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

function cabecerasSeguridad(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
}

// Devuelve un "portero" que pone las cabeceras de seguridad y responde /salud.
// true = la solicitud puede seguir; false = ya se respondió.
function crearPortero() {
  return async function portero(req, res) {
    cabecerasSeguridad(res);
    const ruta = new URL(req.url, 'http://localhost').pathname;
    if (ruta === '/salud') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('{"estado":"ok"}');
      return false;
    }
    return true;
  };
}

module.exports = { crearPortero, crearLimitador, ipDe };
