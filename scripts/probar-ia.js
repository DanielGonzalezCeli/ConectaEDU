// npm run probar-ia · Hace UNA llamada mínima real al modelo configurado
// para comprobar la clave y el modelo (cuesta menos de un centavo de dólar).
// No muestra la clave en ningún caso.
const path = require('node:path');
const { cargarEnv, leerConfig } = require('../servidor/entorno');
const { crearClienteIA } = require('../servidor/cliente-ia');
const { crearRegistroUso, costoUSD } = require('../servidor/uso');
const { cuerpoError } = require('../servidor/errores');

const RAIZ = path.join(__dirname, '..');
cargarEnv(path.join(RAIZ, '.env'));
const config = leerConfig();

if (!config.clave) {
  console.error('Falta la clave: abre el archivo .env, pega tu clave después de PROVEEDOR_IA_CLAVE= y guarda.');
  process.exit(1);
}

const uso = crearRegistroUso({ limite: config.limite, ruta: path.join(RAIZ, 'resultados', 'uso.csv') });
const cliente = crearClienteIA({ clave: config.clave, modelo: config.modelo, uso });

console.log('Probando el modelo ' + config.modelo + '…');
cliente.llamar({
  etiqueta: 'probar-ia',
  system: 'Responde en español.',
  messages: [{ role: 'user', content: 'Esto es una prueba de conexión. Pon "OK" en el campo estado.' }],
  esquema: { type: 'object', additionalProperties: false, required: ['estado'], properties: { estado: { type: 'string' } } },
  esfuerzo: 'low',
  maxTokens: 1024
}).then(r => {
  const costo = costoUSD(r.modelo, r.uso);
  console.log('OK, modelo ' + r.modelo + ' responde (respuesta: «' + r.datos.estado + '»).');
  console.log('Tiempo: ' + r.ms + ' ms · tokens de entrada: ' + r.uso.tokensEntrada + ' · tokens de salida: ' + r.uso.tokensSalida +
    (costo != null ? ' · costo: US$ ' + costo.toFixed(5) : ''));
  console.log('Esfuerzo configurado: calificar ' + config.esfuerzo.calificar + ', tutor ' + config.esfuerzo.tutor + ', revisor ' + config.esfuerzo.revisor + '.');
}).catch(err => {
  const { cuerpo } = cuerpoError(err, config.clave);
  console.error('Error: ' + cuerpo.error.mensaje + (cuerpo.error.detalle ? '\nDetalle del proveedor: ' + cuerpo.error.detalle : ''));
  process.exit(1);
});
