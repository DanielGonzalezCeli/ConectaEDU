/* ============================================================
   Modo IA real en el navegador.
   - Pregunta al servidor (/api/estado) si hay IA real. Si no responde
     (página abierta con doble clic, sin servidor), sigue en simulado.
   - El navegador NUNCA ve la clave: solo habla con nuestro servidor.
   - Nada de trabajos se guarda en localStorage: todo vive en memoria.
   ============================================================ */

const IA = { modo: 'simulado', modelo: null, llamadasUsadas: 0, limite: 0, sesion: null, aceptacionAviso: null };

function modoReal() { return IA.modo === 'real'; }

function actualizarEstadoIA(e) {
  if (!e) return;
  Object.assign(IA, { modo: e.modoIA === 'real' ? 'real' : 'simulado', modelo: e.modelo, llamadasUsadas: e.llamadasUsadas || 0, limite: e.limite || 0, sesion: e.sesion || null });
  pintarBanner();
}

async function cargarEstadoIA() {
  try {
    const r = await fetch('api/estado', { cache: 'no-store' });
    if (r.ok) actualizarEstadoIA(await r.json());
  } catch (e) { /* sin servidor: modo simulado */ }
}

// En modo simulado, el banner queda exactamente como está en index.html.
function pintarBanner() {
  const b = document.getElementById('banner');
  if (!b || !modoReal()) return;
  const s = IA.sesion;
  b.className = 'banner real';
  // Las partes "solo-ancho" se ocultan en celular para que el aviso no ocupe media pantalla.
  b.innerHTML = '<b>IA REAL</b> · <span class="solo-ancho">modelo </span>' + esc(IA.modelo) + ' · <span class="solo-ancho">llamadas usadas en la última hora: </span>' + IA.llamadasUsadas + ' de ' + IA.limite + '<span class="solo-movil"> llamadas por hora</span>' +
    (s && s.llamadas ? '<span class="solo-ancho"> · tokens del servidor: ' + s.tokensEntrada.toLocaleString('es') + ' de entrada y ' + s.tokensSalida.toLocaleString('es') + ' de salida</span>' : '') +
    '. Las notas son <b>sugerencias</b><span class="solo-ancho">: el docente revisa y aprueba cada una</span>. <b>Prototipo:</b> las cuentas, las clases de ejemplo y su tutor siguen simulados<span class="solo-ancho">; el tutor real está en «Tutor con tu material»</span>.';
}

/* ---------- Ventana modal sencilla ---------- */
function abrirVentana(titulo, cuerpoHTML, botones) {
  return new Promise(resolver => {
    const fondo = document.createElement('div');
    fondo.className = 'ventana-fondo';
    fondo.innerHTML = '<div class="ventana" role="dialog" aria-modal="true" aria-labelledby="ventana-titulo"><h2 id="ventana-titulo">' + titulo + '</h2>' +
      '<div class="ventana-cuerpo">' + cuerpoHTML + '</div><div class="fila fin">' +
      botones.map((b, i) => '<button class="btn ' + (b.clase || '') + '" data-i="' + i + '">' + b.texto + '</button>').join('') + '</div></div>';
    document.body.appendChild(fondo);
    const cerrar = valor => { fondo.remove(); document.removeEventListener('keydown', tecla); resolver(valor); };
    const tecla = e => { if (e.key === 'Escape') cerrar(null); };
    document.addEventListener('keydown', tecla);
    fondo.querySelectorAll('[data-i]').forEach(btn => btn.addEventListener('click', () => {
      const b = botones[Number(btn.dataset.i)];
      const valor = b.valor ? b.valor(fondo) : b.texto;
      if (valor !== undefined) cerrar(valor);
    }));
    const primero = fondo.querySelector('textarea, input, button');
    if (primero) primero.focus();
  });
}

// Aviso de privacidad (HU-12): una vez por sesión, antes del primer envío a la IA.
// El texto y la regla viven en js/logica-privacidad.js.
async function asegurarAvisoPrivacidad() {
  if (avisoAceptado(IA)) return true;
  const ok = await abrirVentana(AVISO_PRIVACIDAD.titulo, htmlAvisoPrivacidad(),
    [{ texto: 'Cancelar', clase: 'fantasma', valor: () => false },
     { texto: 'Aceptar y continuar', valor: f => { if (f.querySelector('#acepto-aviso').checked) return true; f.querySelector('#falta-aviso').classList.remove('oculto'); return undefined; } }]);
  if (ok === true) registrarAceptacion(IA, new Date());
  return avisoAceptado(IA);
}

/* ---------- Lectura de archivos en el navegador ---------- */
const LIMITE_PDF = 5 * 1024 * 1024;

function aBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binario = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(binario);
}

// Devuelve { texto } o { pdfBase64 }, o lanza un Error con un mensaje para el docente.
async function leerTrabajo(archivo) {
  const ext = (archivo.name.split('.').pop() || '').toLowerCase();
  if (ext === 'txt' || ext === 'md') {
    const texto = await archivo.text();
    if (!texto.trim()) throw new Error('«' + archivo.name + '» está vacío.');
    return { texto };
  }
  if (ext === 'pdf') {
    if (archivo.size > LIMITE_PDF) throw new Error('«' + archivo.name + '» pesa más de 5 MB.');
    return { pdfBase64: aBase64(await archivo.arrayBuffer()) };
  }
  if (ext === 'doc' || ext === 'docx') throw new Error('Word todavía no está soportado: guarda «' + archivo.name + '» como PDF o pega su texto.');
  throw new Error('«' + archivo.name + '» no es .txt, .md ni .pdf.');
}

/* ---------- Llamada al calificador ---------- */
async function pedirCalificacion(cuerpo) {
  // Segundo candado: aunque una pantalla olvide pedir el aviso, nada sale sin aceptarlo.
  if (!avisoAceptado(IA)) {
    const err = new Error('Acepta el aviso de privacidad antes de calificar.'); err.codigo = 'sin_aviso'; throw err;
  }
  let r, datos = null;
  try {
    r = await fetch('api/calificar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
    datos = await r.json();
  } catch (e) {
    const err = new Error('No se pudo conectar con el servidor de ConectaEdu.'); err.codigo = 'red'; throw err;
  }
  if (datos && datos.estadoIA) actualizarEstadoIA(datos.estadoIA);
  if (!r.ok) {
    const err = new Error((datos && datos.error && datos.error.mensaje) || 'Error ' + r.status + '.');
    err.codigo = (datos && datos.error && datos.error.codigo) || 'http_' + r.status;
    if (r.status === 401) err.message = 'Tu acceso venció. Recarga la página e ingresa la clave de acceso.';
    throw err;
  }
  return datos;
}

/* ---------- Llamada al tutor real ---------- */
// Envía el material y la pregunta. El servidor no guarda nada.
async function pedirTutor(cuerpo) {
  let r, datos = null;
  try {
    r = await fetch('api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });
    datos = await r.json();
  } catch (e) {
    const err = new Error('No se pudo conectar con el servidor de ConectaEdu.'); err.codigo = 'red'; throw err;
  }
  if (datos && datos.estadoIA) actualizarEstadoIA(datos.estadoIA);
  if (!r.ok) {
    const err = new Error((datos && datos.error && datos.error.mensaje) || 'Error ' + r.status + '.');
    err.codigo = (datos && datos.error && datos.error.codigo) || 'http_' + r.status;
    if (r.status === 401) err.message = 'Tu acceso venció. Recarga la página e ingresa la clave de acceso.';
    throw err;
  }
  return datos;
}

const esperarMs = ms => new Promise(r => setTimeout(r, ms));

// Califica una lista con hasta 3 trabajos a la vez. Si el proveedor responde 429,
// baja a 1 a la vez y reintenta ese trabajo. Si se agota el tope local, se detiene.
async function calificarEnCola(items, calificarUno, alCambiar) {
  const cola = items.slice();
  let concurrencia = 3, activos = 0, detenido = false;
  await new Promise(fin => {
    const siguiente = () => {
      if ((!cola.length || detenido) && !activos) return fin();
      while (!detenido && activos < concurrencia && cola.length) {
        const t = cola.shift();
        activos++;
        t.estadoIA = 'calificando'; t.error = null;
        alCambiar();
        calificarUno(t).then(() => { t.estadoIA = 'listo'; }, async err => {
          if (err.codigo === 'limite_proveedor' && !t.reintento429) {
            t.reintento429 = true; concurrencia = 1; t.estadoIA = 'pendiente';
            await esperarMs(3000);
            cola.unshift(t);
            return;
          }
          t.estadoIA = 'error'; t.error = err.message;
          if (['limite_local', 'limite_ip', 'sin_clave', 'sin_acceso', 'sin_aviso', 'http_401'].includes(err.codigo)) {
            detenido = true;
            cola.splice(0).forEach(x => { x.estadoIA = 'error'; x.error = err.message; });
          }
        }).finally(() => { activos--; alCambiar(); siguiente(); });
      }
    };
    siguiente();
  });
}
