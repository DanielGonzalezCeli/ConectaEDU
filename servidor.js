// Servidor de ConectaEdu (local en http://localhost:8000, o en Render).
// Solo usa Node (sin dependencias). Uso: npm start
// - Sirve los archivos de la página, igual que antes.
// - Rutas /api/* para la IA real. La clave se lee de .env (o de las variables
//   de entorno de Render) y nunca sale de aquí.
// - Sin clave, la página funciona en modo simulado, sin internet.
// - Con CLAVE_ACCESO, pide una clave antes de mostrar la página (despliegue público).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { cargarEnv, leerConfig } = require('./servidor/entorno');
const { crearAPI } = require('./servidor/api');
const { crearPortero, problemaDeDespliegue } = require('./servidor/acceso');

const RAIZ = __dirname;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function servirArchivo(req, res) {
  const ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const archivo = path.join(RAIZ, ruta === '/' ? 'index.html' : ruta);
  // Solo se sirven archivos dentro del proyecto y de los tipos esperados
  // (así nunca se sirven .env ni resultados/uso.csv).
  if (!archivo.startsWith(RAIZ + path.sep) || !TIPOS[path.extname(archivo)]) {
    res.writeHead(404); return res.end('No encontrado');
  }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] });
    res.end(datos);
  });
}

// opciones: lo mismo que crearAPI (las pruebas inyectan config y fetch).
function crearServidor(opciones) {
  const { config } = opciones;
  const api = crearAPI(opciones);
  const portero = crearPortero({ claveAcceso: config.claveAcceso, confiarProxy: config.confiarProxy, ahora: opciones.ahora });
  return http.createServer(async (req, res) => {
    if (!(await portero(req, res))) return;
    if (req.url.startsWith('/api/')) return api(req, res);
    servirArchivo(req, res);
  });
}

if (require.main === module) {
  cargarEnv(path.join(RAIZ, '.env'));
  const config = leerConfig();
  const problema = problemaDeDespliegue(config);
  if (problema) { console.error(problema); process.exit(1); }
  const PUERTO = Number(process.env.PORT) || 8000;
  crearServidor({ config }).listen(PUERTO, config.host, () => {
    console.log('ConectaEdu en http://' + (config.host === '0.0.0.0' ? 'localhost' : config.host) + ':' + PUERTO);
    console.log(config.modoIA === 'real'
      ? 'Modo IA real · modelo ' + config.modelo + ' · límite ' + config.limite + ' llamadas por hora · ' + config.limitePorIp + ' solicitudes por IP y hora'
      : 'Modo simulado (no hay PROVEEDOR_IA_CLAVE)');
    console.log(config.claveAcceso ? 'Acceso protegido con CLAVE_ACCESO' : 'Acceso libre (sin CLAVE_ACCESO)');
  });
}

module.exports = { crearServidor };
