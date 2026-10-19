// Servidor local de ConectaEdu en http://localhost:8000
// Solo usa Node (sin dependencias). Uso: npm start
// - Sirve los archivos de la página, igual que antes.
// - Rutas /api/* para la IA real. La clave se lee de .env y nunca sale de aquí.
//   Sin clave, la página funciona en modo simulado, sin internet.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { cargarEnv, leerConfig } = require('./servidor/entorno');
const { crearAPI } = require('./servidor/api');

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
  const api = crearAPI(opciones);
  return http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) return api(req, res);
    servirArchivo(req, res);
  });
}

if (require.main === module) {
  cargarEnv(path.join(RAIZ, '.env'));
  const config = leerConfig();
  const PUERTO = Number(process.env.PORT) || 8000;
  crearServidor({ config }).listen(PUERTO, '127.0.0.1', () => {
    console.log('ConectaEdu en http://localhost:' + PUERTO);
    console.log(config.modoIA === 'real'
      ? 'Modo IA real · modelo ' + config.modelo + ' · límite ' + config.limite + ' llamadas por hora'
      : 'Modo simulado (no hay PROVEEDOR_IA_CLAVE en .env)');
  });
}

module.exports = { crearServidor };
