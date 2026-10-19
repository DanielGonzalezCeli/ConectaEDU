// Servidor local mínimo para ver el prototipo en http://localhost:8000
// Solo usa Node (sin dependencias ni internet). Uso: npm start
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PUERTO = Number(process.env.PORT) || 8000;
const RAIZ = __dirname;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const archivo = path.join(RAIZ, ruta === '/' ? 'index.html' : ruta);
  // Solo se sirven archivos dentro del proyecto y de los tipos esperados.
  if (!archivo.startsWith(RAIZ + path.sep) || !TIPOS[path.extname(archivo)]) {
    res.writeHead(404); return res.end('No encontrado');
  }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] });
    res.end(datos);
  });
}).listen(PUERTO, '127.0.0.1', () => console.log('ConectaEdu (prototipo) en http://localhost:' + PUERTO));
