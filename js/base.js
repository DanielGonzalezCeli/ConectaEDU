/* ============================================================
   Estado de la demostración y funciones de apoyo.
   Todo vive en memoria: al recargar la página se reinicia.
   No se guarda nada en el navegador ni en un servidor.
   ============================================================ */

const APP = { usuario: null, clases: [], unidas: [] };

const COLORES = ['turquesa', 'azul', 'violeta', 'coral', 'ambar', 'verde'];

// Datos de un trabajo de ejemplo para la lista de archivos de una tarea.
const archivosEjemplo = () => DATOS.trabajos.map((t, i) => ({ nombre: 'Ensayo_' + t.id.replace(' ', '_') + '.pdf', tamano: 180000 + i * 23000, ejemplo: true }));

function crearTarea(datos) {
  return {
    id: datos.id, nombre: datos.nombre, entrega: datos.entrega || '', instrucciones: datos.instrucciones || '',
    rubrica: datos.rubrica || { nombre: DATOS.rubrica.nombre, criterios: DATOS.rubrica.criterios.map(c => Object.assign({}, c)) },
    archivos: datos.archivos || (datos.ejemplo ? archivosEjemplo() : []),
    calificada: false,
    trabajos: prepararTrabajos(DATOS.trabajos)
  };
}

function iniciarDatos() {
  APP.usuario = null;
  APP.unidas = [];
  APP.clases = DATOS.clasesEjemplo.map(c => ({
    id: c.id, nombre: c.nombre, materia: c.materia, periodo: c.periodo, paralelo: c.paralelo, color: c.color,
    codigo: c.codigo, tutorDemo: c.tutorDemo, ejemplo: true,
    material: c.material.map(m => ({ uid: uid(), nombre: m.nombre, tipo: m.tipo, estado: 'listo', ejemplo: true })),
    reglas: { permitirEjemplo: true, indicaciones: 'Guía con preguntas y pistas. No entregues el resultado final.' },
    estudiantes: c.id === 'estadistica' ? DATOS.curso.map(e => ({ nombre: e.nombre }))
      : c.id === 'comunicacion' ? DATOS.trabajos.map(t => ({ nombre: t.id })) : [],
    tareas: c.tareas.map(crearTarea),
    tutor: c.tutorDemo ? { estado: crearEstadoTutor(), mensajes: [{ rol: 'tutor', texto: DATOS.problema.enunciado, fuente: DATOS.problema.fuenteEnunciado }] } : null
  }));
}

/* ---------- Utilidades ---------- */
let contadorUid = 0;
function uid() { return 'u' + (++contadorUid); }

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function ir(ruta) { location.hash = '#' + ruta; }
function buscarClase(id) { return APP.clases.find(c => c.id === id); }

function toast(texto) {
  const cont = document.getElementById('toasts');
  const d = document.createElement('div');
  d.className = 'toast';
  d.innerHTML = icono('check') + '<span></span>';
  d.querySelector('span').textContent = texto;
  cont.appendChild(d);
  setTimeout(() => d.remove(), 3200);
}

function copiar(texto) {
  const ok = () => toast('Copiado: ' + texto);
  try { navigator.clipboard.writeText(texto).then(ok, () => toast('Código: ' + texto)); }
  catch (e) { toast('Código: ' + texto); }
}

// "1 tarea", "3 tareas"
function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

function tamanoLegible(bytes) {
  if (!bytes) return '';
  return bytes > 1048576 ? (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}
function tipoDeArchivo(nombre) {
  const ext = (nombre.split('.').pop() || '').toLowerCase();
  return { pdf: 'PDF', doc: 'Word', docx: 'Word', ppt: 'Diapositivas', pptx: 'Diapositivas', xls: 'Excel', xlsx: 'Excel', txt: 'Texto' }[ext] || 'Archivo';
}
const COLOR_TIPO = { PDF: 'f-coral', Word: 'f-azul', Diapositivas: 'f-ambar', Excel: 'f-verde', Texto: 'f-violeta', Archivo: 'f-violeta' };
function iconoArchivo(tipo) {
  const corto = { PDF: 'PDF', Word: 'DOC', Diapositivas: 'PPT', Excel: 'XLS', Texto: 'TXT' }[tipo] || 'ARC';
  return '<span class="tipo ' + (COLOR_TIPO[tipo] || 'f-violeta') + '">' + corto + '</span>';
}

function generarCodigo(nombre) {
  const base = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5).padEnd(5, 'X');
  const al = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 3; i++) r += al[Math.floor(Math.random() * al.length)];
  return base + '-' + r;
}

// ¿La rúbrica de la tarea es la de ejemplo? Solo para ella hay resultados simulados.
function rubricaEsEjemplo(rubrica) {
  const a = rubrica.criterios, b = DATOS.rubrica.criterios;
  return a.length === b.length && a.every((c, i) => c.nombre.trim() === b[i].nombre && Number(c.max) === b[i].max);
}

function notasPorAprobar(clase) {
  return clase.tareas.filter(t => t.calificada).reduce((n, t) => n + t.trabajos.filter(x => x.estado !== 'Aprobada').length, 0);
}

/* ---------- Piezas de interfaz reutilizables ---------- */
function vacio(ico, titulo, texto, accion) {
  return '<div class="vacio"><div class="grande-ico">' + icono(ico) + '</div><b>' + titulo + '</b><p>' + texto + '</p>' + (accion || '') + '</div>';
}
function infoSim(texto) {
  return '<div class="info-sim">' + icono('info') + '<span>' + texto + '</span></div>';
}
function metrica(ico, color, valor, texto) {
  return '<div class="metrica"><div class="icono ' + color + '">' + icono(ico) + '</div><div><b>' + valor + '</b><span>' + texto + '</span></div></div>';
}
function pasosAsistente(nombres, actual) {
  return '<div class="pasos">' + nombres.map((n, i) =>
    '<div class="' + (i < actual ? 'hecho' : i === actual ? 'actual' : '') + '"><span>' + n + '</span></div>').join('') + '</div>';
}

// Zona para arrastrar archivos. Solo se usan el nombre y el tamaño: el contenido nunca se lee.
function enlazarZonaSubida(zona, input, alRecibir) {
  zona.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { alRecibir(Array.from(input.files)); input.value = ''; });
  zona.addEventListener('dragover', e => { e.preventDefault(); zona.classList.add('encima'); });
  zona.addEventListener('dragleave', () => zona.classList.remove('encima'));
  zona.addEventListener('drop', e => { e.preventDefault(); zona.classList.remove('encima'); alRecibir(Array.from(e.dataTransfer.files)); });
}
