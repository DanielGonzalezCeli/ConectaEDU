/* ---------- Tareas con IA real: lectura de trabajos, calificación y comparación ----------
   Reutiliza la pantalla de revisión de tareas.js: cada resultado se convierte al
   mismo formato de trabajo (puntos, just, cita, confianza, final, estado). */

const num = (n, d = 2) => (n === null || n === undefined) ? '—' : Number(n).toLocaleString('es', { maximumFractionDigits: d });
const conSigno = n => (n > 0 ? '+' : '') + num(n);

function duracion(ms) {
  if (!(ms > 0)) return '—';
  const s = Math.round(ms / 1000);
  if (s < 1) return 'menos de 1 s';
  return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60) + ' s';
}

function nombreArchivoSeguro(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'tarea';
}

function descargarArchivo(nombre, contenido, tipo) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- Nueva tarea, paso «Trabajos» (modo real) ---------- */
function etiquetaUnica(b, nombre) {
  let base = String(nombre || '').trim();
  if (!base) { b.contador = (b.contador || 0) + 1; base = 'Trabajo ' + b.contador; }
  let etiqueta = base, k = 2;
  while (b.archivos.some(a => a.etiqueta === etiqueta)) etiqueta = base + ' (' + (k++) + ')';
  return etiqueta;
}

function filaEntrega(a, extra) {
  const detalle = a.pdfBase64 ? 'PDF · ' + tamanoLegible(a.tamano) : (a.texto || '').length.toLocaleString('es') + ' caracteres';
  return '<li class="archivo">' + iconoArchivo(a.pdfBase64 ? 'PDF' : 'Texto') +
    '<div class="datos"><b>' + esc(a.etiqueta) + '</b><span>' + (a.pegado ? 'Texto pegado' : esc(a.nombre)) + ' · ' + detalle + '</span></div>' + (extra || '') + '</li>';
}

function cuerpoTrabajosReal(b) {
  return '<h2>' + icono('subir') + 'Trabajos de los estudiantes</h2><p class="nota">Sube el lote completo o pega el texto de cada trabajo.</p>' +
    '<div class="info-real">' + icono('info') + '<span>Se leen archivos <b>.txt</b>, <b>.md</b> y <b>.pdf</b> (hasta 5 MB) en tu navegador y se envían al proveedor de IA solo cuando presionas «Calificar». ' +
      'El nombre del archivo no se envía: cada trabajo se identifica como «Trabajo 1», «Trabajo 2»… <b>Word (.docx) todavía no</b>: guárdalo como PDF o pega el texto.</span></div>' +
    '<div class="zona-subida" id="zona"><div class="grande-ico">' + icono('subir') + '</div><b>Arrastra los trabajos aquí</b>o haz clic para elegirlos (.txt, .md o .pdf)</div>' +
    '<input type="file" id="archivo" multiple accept=".pdf,.txt,.md,.doc,.docx" class="oculto">' +
    '<div class="fila" style="margin-top:10px"><button class="btn sec chico" id="pegar">' + icono('mas') + 'Pegar el texto de un trabajo</button>' +
      '<button class="btn fantasma chico" id="prueba">Usar 3 ensayos ficticios de prueba</button></div>' +
    '<ul class="archivos">' + b.archivos.map((a, i) => filaEntrega(a, '<button class="quitar" data-quitar="' + i + '" title="Quitar">' + icono('basura') + '</button>')).join('') + '</ul>' +
    '<div class="fila fin" style="margin-top:14px"><button class="btn fantasma" id="ant">' + icono('atras') + 'Atrás</button><button class="btn exito" id="crear"' + (b.archivos.length ? '' : ' disabled') + '>' + icono('check') + 'Crear tarea</button></div>';
}

function enlazarTrabajosReal(raiz, b, clase, claseId) {
  const $ = s => raiz.querySelector(s);
  enlazarZonaSubida($('#zona'), $('#archivo'), async archivos => {
    for (const f of archivos) {
      try { b.archivos.push(Object.assign({ nombre: f.name, tamano: f.size, etiqueta: etiquetaUnica(b, '') }, await leerTrabajo(f))); }
      catch (e) { toast(e.message); }
    }
    render();
  });
  $('#pegar').addEventListener('click', async () => {
    const r = await abrirVentana('Pegar el texto de un trabajo',
      '<div class="campo"><label for="p-nombre">Nombre para identificarlo (opcional)</label><input type="text" id="p-nombre" placeholder="Trabajo ' + ((b.contador || 0) + 1) + '"></div>' +
      '<div class="campo"><label for="p-texto">Texto del trabajo</label><textarea id="p-texto" rows="12"></textarea><span class="ayuda">Usa trabajos anonimizados: sin nombres, cédulas ni correos.</span></div>',
      [{ texto: 'Cancelar', clase: 'fantasma', valor: () => null },
       { texto: 'Agregar trabajo', valor: f => {
         const texto = f.querySelector('#p-texto').value;
         if (!texto.trim()) { f.querySelector('#p-texto').focus(); return undefined; }
         return { nombre: f.querySelector('#p-nombre').value, texto };
       } }]);
    if (!r) return;
    b.archivos.push({ nombre: '', etiqueta: etiquetaUnica(b, r.nombre), texto: r.texto, pegado: true, tamano: r.texto.length });
    render();
  });
  $('#prueba').addEventListener('click', () => {
    DATOS.ensayosPrueba.forEach(e => { if (!b.archivos.some(a => a.etiqueta === e.nombre)) b.archivos.push({ nombre: '', etiqueta: e.nombre, texto: e.texto, pegado: true, tamano: e.texto.length }); });
    render();
  });
  raiz.querySelectorAll('[data-quitar]').forEach(x => x.addEventListener('click', () => { b.archivos.splice(Number(x.dataset.quitar), 1); render(); }));
  $('#ant').addEventListener('click', () => { b.paso = 1; render(); });
  $('#crear').addEventListener('click', () => {
    const tarea = crearTarea({ id: 'tarea-' + uid(), nombre: b.nombre, entrega: b.entrega, instrucciones: b.instrucciones,
      rubrica: { nombre: b.nombre, criterios: b.criterios.map(c => Object.assign({}, c)) }, archivos: b.archivos.slice() });
    tarea.real = true;
    tarea.trabajos = [];
    clase.tareas.push(tarea);
    borradorTarea = null;
    toast('Tarea creada');
    ir('/docente/clase/' + claseId + '/tareas/' + tarea.id);
  });
}

/* ---------- Tarea antes de calificar (modo real) ---------- */
const ESTADO_ENTREGA = {
  pendiente: '<span class="estado">En espera</span>',
  calificando: '<span class="estado activo">Calificando…</span>',
  listo: '<span class="estado ok">' + 'Lista' + '</span>',
  error: '<span class="estado mal">Error</span>'
};

function vistaPreviaReal(tarea, tablaRubrica) {
  const n = tarea.archivos.length;
  return '<div class="tarjeta"><h2>' + icono('lapiz') + 'Rúbrica</h2><p class="nota">El asistente solo califica con estos criterios.</p>' + tablaRubrica + '</div>' +
    '<div class="tarjeta"><h2>' + icono('archivo') + 'Trabajos recibidos</h2>' +
      '<ul class="archivos" id="lista-entregas">' + filasEntregas(tarea) + '</ul>' +
      '<div class="fila" style="margin-top:8px"><button class="btn" id="calificar"' + (tarea.calificando ? ' disabled' : '') + '>' + icono('chispa') + 'Calificar ' + plural(n, 'trabajo', 'trabajos') + ' con mi rúbrica</button>' +
        '<span class="nota" style="margin:0">IA real' + (IA.modelo ? ' · ' + esc(IA.modelo) : '') + '. Las notas serán sugerencias: tú decides.</span></div>' +
      '<div id="zona-progreso"' + (tarea.calificando ? '' : ' class="oculto"') + '><div class="progreso"><div id="barra-progreso"></div></div><div id="texto-progreso" class="nota" aria-live="polite"></div></div>' +
    '</div>';
}

function filasEntregas(tarea) {
  return tarea.archivos.map(a => {
    const t = tarea.trabajos.find(x => x.archivoRef === a);
    const estado = t ? ESTADO_ENTREGA[t.estadoIA] || '' : '';
    return filaEntrega(a, estado + (t && t.error ? '<span class="error-linea">' + esc(t.error) + '</span>' : ''));
  }).join('');
}

function nuevoTrabajoReal(archivo, criterios) {
  return { id: archivo.etiqueta, archivoRef: archivo, estadoIA: 'pendiente', error: null, puntos: null, just: [], final: criterios.map(() => 0),
    cita: '', confianza: '—', estado: 'Sugerida', aprobacion: null, advertencias: [], notasDocente: criterios.map(() => '') };
}

async function calificarTrabajoReal(tarea, t) {
  const a = t.archivoRef;
  const r = await pedirCalificacion({
    rubrica: { nombre: tarea.rubrica.nombre, criterios: tarea.rubrica.criterios },
    trabajo: a.texto != null ? { texto: a.texto } : { pdfBase64: a.pdfBase64 },
    instrucciones: tarea.instrucciones
  });
  Object.assign(t, {
    puntos: r.puntos, just: r.just, cita: r.cita, citas: r.citas, estadoCitas: r.estadoCitas, confianzas: r.confianzas,
    confianza: r.confianza, advertencias: r.advertencias, comentarioGeneral: r.comentarioGeneral, modelo: r.modelo, uso: r.uso, costoUSD: r.costoUSD,
    final: r.puntos.slice(), estado: 'Sugerida', aprobacion: null,
    revisar: r.confianza === 'Baja' || r.advertencias.some(x => /recortó|no verificada|no devolvió/.test(x))
  });
}

function pintarProgresoReal(tarea) {
  const n = tarea.trabajos.length;
  const listos = tarea.trabajos.filter(t => t.estadoIA === 'listo' || t.estadoIA === 'error').length;
  const enCurso = tarea.trabajos.filter(t => t.estadoIA === 'calificando').length;
  const barra = document.getElementById('barra-progreso');
  if (barra) barra.style.width = (n ? listos / n * 100 : 0) + '%';
  const texto = document.getElementById('texto-progreso');
  if (texto) texto.textContent = listos < n ? 'Aplicando tu rúbrica: ' + listos + ' de ' + n + ' trabajos listos' + (enCurso ? ' (' + enCurso + ' en curso)' : '') + '…' : 'Terminado.';
  const lista = document.getElementById('lista-entregas');
  if (lista) lista.innerHTML = filasEntregas(tarea);
}

async function calificarLoteReal(tarea, btn) {
  if (!(await asegurarAvisoPrivacidad())) return;
  btn.disabled = true;
  const ruta = location.hash;
  document.getElementById('zona-progreso').classList.remove('oculto');
  tarea.trabajos = tarea.archivos.map(a => nuevoTrabajoReal(a, tarea.rubrica.criterios));
  tarea.calificando = true;
  const inicio = Date.now(); // cronómetro: desde «Calificar» hasta que termina el lote
  await calificarEnCola(tarea.trabajos, t => calificarTrabajoReal(tarea, t), () => pintarProgresoReal(tarea));
  tarea.msLote = Date.now() - inicio;
  tarea.calificando = false;
  tarea.calificada = true;
  const fallidos = tarea.trabajos.filter(t => t.estadoIA === 'error').length;
  toast(fallidos ? fallidos + ' trabajo(s) con error: puedes reintentarlos' : 'Listo: revisa las notas sugeridas');
  if (location.hash === ruta) render();
}

async function reintentarTrabajo(tarea, t) {
  if (!(await asegurarAvisoPrivacidad())) return;
  await calificarEnCola([t], x => calificarTrabajoReal(tarea, x), () => pintarResultados(tarea));
  if (t.estadoIA === 'error') toast('Sigue fallando: ' + t.error); else toast(t.id + ' calificado');
  render();
}

/* ---------- Comparación con el docente ---------- */
function pintarComparacion(tarea) {
  const cont = document.getElementById('comp-cuerpo');
  if (!cont) return;
  const criterios = tarea.rubrica.criterios;
  const r = compararConDocente(tarea.trabajos.filter(t => t.estadoIA === 'listo'), criterios);
  tarea.comparacion = r;
  if (!r.criterios) {
    cont.innerHTML = '<p class="vacio-linea">Todavía no hay notas tuyas. Abre un trabajo con «Revisar» y escribe en «Tu nota a mano» la nota que pusiste en cada criterio.</p>';
    return;
  }
  const sesgo = r.sesgo === 0 ? 'En promedio, la IA puso las mismas notas que tú.'
    : 'En promedio, la IA puso <b>' + num(Math.abs(r.sesgo)) + ' puntos ' + (r.sesgo > 0 ? 'más' : 'menos') + '</b> que tú por criterio.';
  cont.innerHTML =
    '<div class="comp-cifra"><b>' + num(r.porcentaje, 1) + ' %</b><span>de coincidencia por criterio (diferencia de ' + num(r.tolerancia) + ' puntos o menos), ' +
      'con ' + plural(r.trabajos, 'trabajo', 'trabajos') + ' y ' + plural(r.criterios, 'criterio', 'criterios') + ' comparados (' + r.coincidencias + ' coinciden).</span></div>' +
    '<p>Diferencia promedio por criterio: <b>' + num(r.difPromedio) + ' puntos</b>. ' + sesgo + '</p>' +
    '<div class="tabla-envoltura"><table class="apilable"><thead><tr><th>Criterio</th><th class="n">Comparados</th><th class="n">Coinciden</th><th class="n">Diferencia promedio</th><th class="n">IA − tú (promedio)</th></tr></thead><tbody>' +
      r.porCriterio.map(c => '<tr><td>' + esc(c.nombre) + '</td><td class="n">' + c.pares + '</td><td class="n">' + (c.pares ? c.coincidencias + ' (' + num(c.porcentaje, 1) + ' %)' : '—') + '</td><td class="n">' + num(c.difPromedio) + '</td><td class="n">' + (c.pares ? conSigno(c.sesgo) : '—') + '</td></tr>').join('') +
    '</tbody></table></div>' +
    '<div class="tabla-envoltura"><table class="apilable"><thead><tr><th>Trabajo</th><th class="n">Nota IA</th><th class="n">Tu nota</th><th class="n">Diferencia</th></tr></thead><tbody>' +
      r.porTrabajo.map(t => '<tr><td>' + esc(t.id) + '</td><td class="n">' + num(t.notaIA) + '</td><td class="n">' + (t.completo ? num(t.notaDocente) : 'faltan notas') + '</td><td class="n">' + (t.completo ? conSigno(t.diferencia) : '—') + '</td></tr>').join('') +
    '</tbody></table></div>' +
    (r.mayoresDiferencias.length
      ? '<h3>Donde más se alejó la IA</h3><ul class="diferencias">' + r.mayoresDiferencias.map(p =>
          '<li><b>' + esc(p.criterio) + '</b> · ' + esc(p.trabajo) + ': IA ' + num(p.notaIA) + ', tú ' + num(p.notaDocente) + ' (' + conSigno(p.diferencia) + ')<span>Justificación de la IA: ' + esc(p.justificacion) + '</span></li>').join('') + '</ul>'
      : '');
}

function pintarTiempos(tarea) {
  const cont = document.getElementById('comp-tiempos-res');
  if (!cont) return;
  const n = tarea.trabajos.filter(t => t.estadoIA === 'listo').length;
  const t = compararTiempos(tarea.msLote, n, tarea.minutosManual, tarea.minutosRevision);
  const lineas = ['<li>IA (cronómetro, desde «Calificar» hasta el final del lote): <b>' + duracion(tarea.msLote) + '</b> para ' + plural(n, 'trabajo', 'trabajos') +
    (n && tarea.msLote ? ' · ' + duracion(tarea.msLote / n) + ' por trabajo en promedio' : '') + '. No incluye reintentos posteriores.</li>'];
  if (t.minutosManual !== null) lineas.push('<li>Tú, a mano: <b>' + num(t.minutosManual, 1) + ' min</b> · ' + num(t.minutosManualPorTrabajo, 1) + ' min por trabajo.</li>');
  if (t.minutosRevision !== null) lineas.push('<li>Tu revisión y aprobación de las sugerencias: <b>' + num(t.minutosRevision, 1) + ' min</b> · ' + num(t.minutosRevisionPorTrabajo, 1) + ' min por trabajo.</li>');
  cont.innerHTML = '<ul class="tiempos">' + lineas.join('') + '</ul>';
}

function seccionComparacion(tarea) {
  const n = tarea.trabajos.length;
  return '<div class="tarjeta" id="comparacion"><h2>' + icono('grafico') + 'Comparación con el docente</h2>' +
    '<p class="nota">Compara la nota que sugirió la IA (antes de tus cambios) con la que tú pusiste a mano. Describe solo esta tarea: no es una precisión general del producto.</p>' +
    '<div id="comp-cuerpo"></div>' +
    '<h3>Tiempo</h3>' +
    '<div class="dos">' +
      '<div class="campo"><label for="min-manual">¿Cuántos minutos tardaste en calificar estos ' + n + ' trabajos a mano?</label><input type="number" min="0" step="1" id="min-manual" value="' + esc(tarea.minutosManual || '') + '" style="max-width:140px"></div>' +
      '<div class="campo"><label for="min-revision">¿Cuántos minutos te tomó revisar y aprobar las sugerencias?</label><input type="number" min="0" step="1" id="min-revision" value="' + esc(tarea.minutosRevision || '') + '" style="max-width:140px"></div>' +
    '</div>' +
    '<div id="comp-tiempos-res"></div>' +
    '<div class="fila" style="margin-top:12px"><button class="btn sec" id="btn-comparacion">' + icono('descargar') + 'Descargar comparacion_' + esc(nombreArchivoSeguro(tarea.nombre)) + '.csv</button>' +
      '<button class="btn fantasma" id="btn-json">' + icono('descargar') + 'Descargar resultados de la sesión (JSON)</button></div>' +
    '<p class="nota" style="margin:8px 0 0">Todo vive en esta pestaña: al recargar la página se pierde. Descarga los resultados antes de salir.</p>' +
  '</div>';
}

function resultadosSesion(tarea) {
  return {
    generado: new Date().toISOString(),
    tarea: tarea.nombre,
    rubrica: tarea.rubrica,
    modelo: (tarea.trabajos.find(t => t.modelo) || {}).modelo || null,
    cronometroLoteMs: tarea.msLote || null,
    minutosDocenteAMano: tarea.minutosManual || null,
    minutosDocenteRevision: tarea.minutosRevision || null,
    // No se incluye el texto de los trabajos.
    trabajos: tarea.trabajos.map(t => ({ id: t.id, estadoIA: t.estadoIA, error: t.error, sugerenciaIA: t.puntos, notaFinal: t.final, justificaciones: t.just,
      citas: t.citas, estadoCitas: t.estadoCitas, confianzas: t.confianzas, confianza: t.confianza, advertencias: t.advertencias,
      comentarioGeneral: t.comentarioGeneral, notasDocenteAMano: t.notasDocente, estado: t.estado, aprobacion: t.aprobacion, uso: t.uso, costoUSD: t.costoUSD })),
    costoIA: totalesCosto(tarea),
    comparacion: tarea.comparacion || null
  };
}

/* ---------- Tokens y costo de la IA ----------
   Vienen del servidor: tokens medidos por la API y tarifa pública del modelo.
   Solo cuentan las calificaciones que terminaron bien (los intentos fallidos
   también pueden cobrarse y no se suman aquí). */
const usd = n => 'US$ ' + Number(n).toLocaleString('es', { minimumFractionDigits: 3, maximumFractionDigits: 4 });

function totalesCosto(tarea) {
  const listos = tarea.trabajos.filter(t => t.estadoIA === 'listo' && t.uso);
  const conCosto = listos.filter(t => typeof t.costoUSD === 'number');
  return {
    trabajos: listos.length,
    llamadas: listos.reduce((s, t) => s + (t.uso.llamadas || 1), 0),
    tokensEntrada: listos.reduce((s, t) => s + (t.uso.tokensEntrada || 0), 0),
    tokensSalida: listos.reduce((s, t) => s + (t.uso.tokensSalida || 0), 0),
    costoUSD: conCosto.length === listos.length && listos.length ? Math.round(conCosto.reduce((s, t) => s + t.costoUSD, 0) * 1e6) / 1e6 : null
  };
}

function textoCostoLote(tarea) {
  const c = totalesCosto(tarea);
  if (!c.trabajos) return '';
  return 'Costo de la IA en esta tarea: ' + plural(c.trabajos, 'trabajo calificado', 'trabajos calificados') + ' · ' + plural(c.llamadas, 'llamada', 'llamadas') + ' · ' +
    c.tokensEntrada.toLocaleString('es') + ' tokens de entrada y ' + c.tokensSalida.toLocaleString('es') + ' de salida · ' +
    (c.costoUSD !== null ? usd(c.costoUSD) + ' (' + usd(c.costoUSD / c.trabajos) + ' por trabajo)' : 'costo no disponible para este modelo') +
    '. Tarifa pública del proveedor; no incluye intentos fallidos.';
}

function textoCostoTrabajo(t) {
  if (!t.uso) return '';
  return t.uso.tokensEntrada.toLocaleString('es') + ' tokens de entrada · ' + t.uso.tokensSalida.toLocaleString('es') + ' de salida' +
    (typeof t.costoUSD === 'number' ? ' · ' + usd(t.costoUSD) : '') + (t.uso.llamadas > 1 ? ' · ' + t.uso.llamadas + ' llamadas' : '');
}

function enlazarResultadosReal(raiz, tarea) {
  pintarComparacion(tarea);
  pintarTiempos(tarea);
  const minutos = (id, campo) => raiz.querySelector(id).addEventListener('input', e => { tarea[campo] = e.target.value; pintarTiempos(tarea); });
  minutos('#min-manual', 'minutosManual');
  minutos('#min-revision', 'minutosRevision');
  raiz.querySelector('#btn-comparacion').addEventListener('click', () => {
    pintarComparacion(tarea);
    descargarArchivo('comparacion_' + nombreArchivoSeguro(tarea.nombre) + '.csv', '﻿' + csvComparacion(tarea.comparacion), 'text/csv;charset=utf-8;');
    toast('CSV de comparación descargado');
  });
  raiz.querySelector('#btn-json').addEventListener('click', () => {
    pintarComparacion(tarea);
    descargarArchivo('resultados_' + nombreArchivoSeguro(tarea.nombre) + '.json', JSON.stringify(resultadosSesion(tarea), null, 2), 'application/json');
    toast('Resultados descargados');
  });
}
