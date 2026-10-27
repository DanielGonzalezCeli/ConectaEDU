/* ============================================================
   Tope de llamadas por hora y registro de uso.
   El registro (resultados/uso.csv) guarda SOLO metadatos: nunca el
   contenido de trabajos, rúbricas ni conversaciones.
   ============================================================ */
const fs = require('node:fs');
const path = require('node:path');
const { ErrorIA } = require('./errores');

// Tarifa pública en USD por millón de tokens [entrada, salida]. Sirve para
// calcular el costo con los tokens medidos; si el modelo no está, no se estima.
const TARIFAS = {
  'claude-sonnet-5-5': [2, 10],
  'claude-sonnet-5': [2, 10],
  'claude-opus-5-5': [4, 20],
  'claude-haiku-5-5': [0.1, 0.5]
};

// Costo en USD de una llamada. Escribir en caché cuesta 1,25 veces la entrada
// y leer de caché, 0,1 veces.
function costoUSD(modelo, u) {
  const t = TARIFAS[modelo];
  if (!t) return null;
  const entrada = (u.tokensEntrada || 0) + 1.25 * (u.cacheEscritos || 0) + 0.1 * (u.cacheLeidos || 0);
  return (entrada * t[0] + (u.tokensSalida || 0) * t[1]) / 1e6;
}

const COLUMNAS = ['fecha', 'endpoint', 'modelo', 'tokens_entrada', 'tokens_salida', 'cache_leidos', 'cache_escritos', 'ms', 'estado', 'costo_usd'];

function crearRegistroUso({ limite = 60, ruta = null, ahora = () => Date.now() } = {}) {
  let marcas = []; // momento de cada llamada de la última hora
  const sesion = { llamadas: 0, tokensEntrada: 0, tokensSalida: 0, cacheLeidos: 0, cacheEscritos: 0, costoUSD: 0 };

  const recientes = () => { const t = ahora() - 3600e3; marcas = marcas.filter(m => m > t); return marcas.length; };

  // Se llama ANTES de cada llamada al proveedor (también en los reintentos).
  function reservar() {
    if (recientes() >= limite) {
      throw new ErrorIA('limite_local', 'Se alcanzó el límite de ' + limite + ' llamadas por hora (LIMITE_LLAMADAS_POR_HORA). Espera o sube el límite en .env.');
    }
    marcas.push(ahora());
  }

  function registrar(fila) {
    const costo = costoUSD(fila.modelo, fila);
    sesion.llamadas++;
    ['tokensEntrada', 'tokensSalida', 'cacheLeidos', 'cacheEscritos'].forEach(k => { sesion[k] += fila[k] || 0; });
    if (costo != null) sesion.costoUSD += costo;
    if (!ruta) return;
    const valores = [new Date(ahora()).toISOString(), fila.endpoint, fila.modelo, fila.tokensEntrada || 0, fila.tokensSalida || 0,
      fila.cacheLeidos || 0, fila.cacheEscritos || 0, fila.ms || 0, fila.estado, costo == null ? '' : costo.toFixed(6)];
    try {
      fs.mkdirSync(path.dirname(ruta), { recursive: true });
      if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, COLUMNAS.join(',') + '\n');
      fs.appendFileSync(ruta, valores.map(v => String(v).replace(/[,\r\n]/g, ' ')).join(',') + '\n');
    } catch (e) { /* el registro nunca debe tumbar la aplicación */ }
  }

  function resumen() {
    return { llamadasUsadas: recientes(), limite, sesion: Object.assign({}, sesion, { costoUSD: Math.round(sesion.costoUSD * 1e6) / 1e6 }) };
  }

  return { reservar, registrar, resumen };
}

module.exports = { crearRegistroUso, costoUSD, TARIFAS, COLUMNAS };
