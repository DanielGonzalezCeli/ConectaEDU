/* ============================================================
   Cliente mínimo de la API de Claude (Messages API) con fetch de Node.
   - La clave va solo en la cabecera x-api-key de la petición al proveedor.
   - La salida se pide como JSON con un esquema (salidas estructuradas):
     la API garantiza que la respuesta cumple ese esquema.
   - Espera máxima de 60 s por intento y un reintento si responde 429 o 529.
   - `fetch` se puede inyectar: las pruebas nunca llaman a la API real.
   ============================================================ */
const { ErrorIA, sinClave } = require('./errores');

const URL_API = 'https://api.anthropic.com/v1/messages';
const VERSION_API = '2023-06-01';

const esperar = ms => new Promise(r => setTimeout(r, ms));

function usoDe(datos) {
  const u = (datos && datos.usage) || {};
  return {
    tokensEntrada: u.input_tokens || 0,
    tokensSalida: u.output_tokens || 0,
    cacheLeidos: u.cache_read_input_tokens || 0,
    cacheEscritos: u.cache_creation_input_tokens || 0
  };
}

function errorDeProveedor(status, datos, clave) {
  const msg = sinClave((datos && datos.error && datos.error.message) || '', clave);
  if (status === 401) return new ErrorIA('clave_invalida');
  if (status === 403) return new ErrorIA('sin_permiso');
  if (status === 404) return new ErrorIA('modelo_no_encontrado');
  if (status === 429) return new ErrorIA('limite_proveedor');
  if (status === 529) return new ErrorIA('sobrecargado');
  if (status === 400 && /credit balance/i.test(msg)) return new ErrorIA('sin_credito');
  if (status === 400) return new ErrorIA('solicitud_rechazada', null, msg);
  return new ErrorIA('proveedor', 'El proveedor de IA devolvió un error (' + status + ').');
}

function crearClienteIA({ clave, modelo, uso, fetch: f = globalThis.fetch, tiempoEsperaMs = 60000, esperaReintentoMs = 2000 }) {

  // Un intento HTTP. Reserva un cupo del tope por hora antes de llamar.
  async function intentar(cuerpo, etiqueta) {
    uso.reservar();
    const inicio = Date.now();
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), tiempoEsperaMs);
    try {
      const r = await f(URL_API, {
        method: 'POST',
        headers: { 'x-api-key': clave, 'anthropic-version': VERSION_API, 'content-type': 'application/json' },
        body: JSON.stringify(cuerpo),
        signal: control.signal
      });
      const texto = await r.text();
      let datos = null;
      try { datos = JSON.parse(texto); } catch (e) { /* cuerpo no JSON */ }
      return { r, datos, ms: Date.now() - inicio };
    } catch (e) {
      const codigo = control.signal.aborted ? 'tiempo_agotado' : 'red';
      uso.registrar({ endpoint: etiqueta, modelo, ms: Date.now() - inicio, estado: codigo });
      throw new ErrorIA(codigo);
    } finally {
      clearTimeout(reloj);
    }
  }

  // Llama al modelo y devuelve { datos (JSON ya validado por la API), uso, modelo, ms }.
  async function llamar({ etiqueta, system, messages, esquema, esfuerzo = 'low', maxTokens = 16000 }) {
    const cuerpo = {
      model: modelo,
      max_tokens: maxTokens,
      system,
      messages,
      output_config: { effort: esfuerzo, format: { type: 'json_schema', schema: esquema } }
    };
    let res = await intentar(cuerpo, etiqueta);
    if (res.r.status === 429 || res.r.status === 529) {
      uso.registrar(Object.assign({ endpoint: etiqueta, modelo, ms: res.ms, estado: 'http_' + res.r.status }, usoDe(res.datos)));
      const segundos = parseFloat(res.r.headers && res.r.headers.get && res.r.headers.get('retry-after'));
      await esperar(Math.min(10000, segundos > 0 ? segundos * 1000 : esperaReintentoMs));
      res = await intentar(cuerpo, etiqueta);
    }
    const { r, datos, ms } = res;
    const u = usoDe(datos);
    const modeloUsado = (datos && datos.model) || modelo;
    const fila = estado => uso.registrar(Object.assign({ endpoint: etiqueta, modelo: modeloUsado, ms, estado }, u));

    if (!r.ok) { fila('http_' + r.status); throw errorDeProveedor(r.status, datos, clave); }
    if (!datos) { fila('respuesta_invalida'); throw new ErrorIA('respuesta_invalida'); }
    if (datos.stop_reason === 'refusal') { fila('rechazo'); throw new ErrorIA('rechazo'); }
    if (datos.stop_reason === 'max_tokens') { fila('respuesta_cortada'); throw new ErrorIA('respuesta_cortada'); }

    const bloque = (datos.content || []).find(b => b.type === 'text');
    let salida;
    try { salida = JSON.parse(bloque.text); } catch (e) { fila('respuesta_invalida'); throw new ErrorIA('respuesta_invalida'); }
    fila('ok');
    return { datos: salida, uso: u, modelo: modeloUsado, ms };
  }

  return { llamar, modelo };
}

// Suma el uso de varias llamadas (reintentos, revisión del tutor...).
function sumarUso(lista) {
  return lista.reduce((t, u) => ({
    tokensEntrada: t.tokensEntrada + (u.tokensEntrada || 0),
    tokensSalida: t.tokensSalida + (u.tokensSalida || 0),
    cacheLeidos: t.cacheLeidos + (u.cacheLeidos || 0),
    cacheEscritos: t.cacheEscritos + (u.cacheEscritos || 0),
    llamadas: t.llamadas + 1
  }), { tokensEntrada: 0, tokensSalida: 0, cacheLeidos: 0, cacheEscritos: 0, llamadas: 0 });
}

module.exports = { crearClienteIA, sumarUso, URL_API, VERSION_API };
