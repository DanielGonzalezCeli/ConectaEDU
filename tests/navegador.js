// Carga scripts del navegador (clásicos, sin módulos) en un contexto aislado de
// Node, con los globales que se le pasen (por ejemplo, un fetch falso).
// Así se prueba el mismo archivo que usa la página, sin abrir un navegador.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function cargarScripts(archivos, globales = {}) {
  const contexto = vm.createContext(Object.assign({ console, setTimeout, clearTimeout, Promise, Error, JSON, Date }, globales));
  for (const archivo of archivos) {
    const ruta = path.join(__dirname, '..', archivo);
    vm.runInContext(fs.readFileSync(ruta, 'utf8'), contexto, { filename: ruta });
  }
  // Evalúa una expresión dentro del contexto (para leer constantes y funciones de nivel superior).
  return expresion => vm.runInContext(expresion, contexto);
}

module.exports = { cargarScripts };
