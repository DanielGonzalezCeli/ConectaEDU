/* ---------- Docente: tareas y calificación ---------- */

function estadoTarea(t) {
  if (t.calificada) {
    const ap = t.trabajos.filter(x => x.estado === 'Aprobada').length;
    return ap === t.trabajos.length ? '<span class="etiqueta e-ok">' + icono('check') + 'Todas aprobadas</span>'
      : '<span class="etiqueta e-aviso">' + ap + ' de ' + t.trabajos.length + ' aprobadas</span>';
  }
  return t.archivos.length ? '<span class="etiqueta e-violeta">Lista para calificar</span>' : '<span class="etiqueta e-neutro">Sin trabajos</span>';
}

function seccionTareas(clase) {
  const nueva = '<a class="btn" href="#/docente/clase/' + clase.id + '/tareas/nueva">' + icono('mas') + 'Nueva tarea</a>';
  const cuerpo = clase.tareas.length
    ? '<div class="tabla-envoltura"><table><thead><tr><th>Tarea</th><th>Entrega</th><th>Trabajos</th><th>Estado</th><th></th></tr></thead><tbody>' +
      clase.tareas.map(t => '<tr><td><b>' + esc(t.nombre) + '</b>' + (t.archivos.some(a => a.ejemplo) ? ' <span class="etiqueta e-sim">ejemplo</span>' : '') + '</td><td>' + esc(t.entrega || '—') + '</td><td>' + t.archivos.length + '</td><td>' + estadoTarea(t) + '</td>' +
        '<td><a class="btn chico sec" href="#/docente/clase/' + clase.id + '/tareas/' + t.id + '">Abrir</a></td></tr>').join('') +
      '</tbody></table></div>'
    : vacio('tarea', 'Todavía no hay tareas', 'Crea una tarea, define tu rúbrica y sube los trabajos. El asistente sugiere una nota por criterio y tú decides la nota final.', nueva);
  return {
    html: encabezadoClase(clase, 'Tareas y calificación', 'Califica con tu propia rúbrica. Ninguna nota sale sin tu aprobación.', clase.tareas.length ? nueva : '') +
      '<div class="tarjeta">' + cuerpo + '</div>'
  };
}

/* ---------- Asistente: nueva tarea ---------- */
let borradorTarea = null;

function vistaNuevaTarea(claseId) {
  const clase = buscarClase(claseId);
  if (!clase) { ir('/docente'); return null; }
  if (!borradorTarea || borradorTarea.claseId !== claseId) {
    borradorTarea = { claseId, paso: 0, nombre: '', entrega: '', instrucciones: '', criterios: [{ nombre: '', desc: '', max: 5 }], archivos: [] };
  }
  const b = borradorTarea;
  const total = b.criterios.reduce((s, c) => s + (Number(c.max) || 0), 0);
  let cuerpo = '';
  if (b.paso === 0) {
    cuerpo =
      '<h2>' + icono('tarea') + 'Datos de la tarea</h2><p class="nota">Puede ser un ensayo, un informe o las preguntas abiertas de un examen.</p>' +
      '<div class="campo"><label for="t-nombre">Nombre de la tarea *</label><input type="text" id="t-nombre" placeholder="Ej.: Informe de laboratorio 2" value="' + esc(b.nombre) + '"></div>' +
      '<div class="campo"><label for="t-entrega">Fecha de entrega</label><input type="date" id="t-entrega" value="' + esc(b.entrega) + '" style="max-width:220px"></div>' +
      '<div class="campo"><label for="t-inst">Instrucciones para los estudiantes</label><textarea id="t-inst" placeholder="Opcional">' + esc(b.instrucciones) + '</textarea></div>' +
      '<div class="fila fin"><a class="btn fantasma" href="#/docente/clase/' + claseId + '/tareas">Cancelar</a><button class="btn" id="sig">Siguiente ' + icono('flecha') + '</button></div>';
  } else if (b.paso === 1) {
    cuerpo =
      '<h2>' + icono('lapiz') + 'Tu rúbrica</h2><p class="nota">El asistente califica solo con estos criterios. Escríbelos como los usas en clase.</p>' +
      '<div class="tabla-envoltura"><table><thead><tr><th style="width:28%">Criterio</th><th>Qué se evalúa</th><th style="width:110px">Puntos</th><th style="width:44px"></th></tr></thead><tbody id="criterios">' +
      b.criterios.map((c, i) => '<tr><td><input type="text" data-i="' + i + '" data-k="nombre" value="' + esc(c.nombre) + '" placeholder="Ej.: Argumentación"></td>' +
        '<td><input type="text" data-i="' + i + '" data-k="desc" value="' + esc(c.desc) + '" placeholder="Qué debe lograr el estudiante"></td>' +
        '<td><input type="number" class="num" min="0.5" step="0.5" data-i="' + i + '" data-k="max" value="' + esc(c.max) + '"></td>' +
        '<td><button class="quitar" data-quitar="' + i + '" title="Quitar criterio">' + icono('basura') + '</button></td></tr>').join('') +
      '</tbody></table></div>' +
      '<div class="fila" style="margin:12px 0 16px"><button class="btn sec chico" id="agregar">' + icono('mas') + 'Agregar criterio</button><button class="btn fantasma chico" id="usar-ejemplo">Usar la rúbrica de ejemplo (ensayo sobre 10)</button><span class="espacio"></span><b>Total: <span id="total">' + fmt(total) + '</span> puntos</b></div>' +
      (rubricaEsEjemplo({ criterios: b.criterios }) ? '' : infoSim('En este prototipo, la calificación simulada solo existe para la <b>rúbrica de ejemplo</b>. Con una rúbrica propia podrás crear la tarea, pero la calificación real llegará en la Fase 2.')) +
      '<div class="fila fin"><button class="btn fantasma" id="ant">' + icono('atras') + 'Atrás</button><button class="btn" id="sig">Siguiente ' + icono('flecha') + '</button></div>';
  } else {
    cuerpo =
      '<h2>' + icono('subir') + 'Trabajos de los estudiantes</h2><p class="nota">Sube el lote completo de una vez.</p>' +
      infoSim('Los archivos <b>no se leen ni se envían</b>: en el prototipo solo se muestran sus nombres y se califican los 5 ensayos de ejemplo.') +
      '<div class="zona-subida" id="zona"><div class="grande-ico">' + icono('subir') + '</div><b>Arrastra los trabajos aquí</b>o haz clic para elegirlos (PDF o Word)</div>' +
      '<input type="file" id="archivo" multiple accept=".pdf,.doc,.docx,.txt" class="oculto">' +
      '<div class="fila" style="margin-top:10px"><button class="btn fantasma chico" id="ejemplos">' + icono('mas') + 'Usar los 5 trabajos de ejemplo</button></div>' +
      '<ul class="archivos">' + b.archivos.map((a, i) => '<li class="archivo">' + iconoArchivo(tipoDeArchivo(a.nombre)) + '<div class="datos"><b>' + esc(a.nombre) + '</b><span>' + tamanoLegible(a.tamano) + '</span></div>' +
        (a.ejemplo ? '<span class="etiqueta e-sim">ejemplo</span>' : '') + '<button class="quitar" data-quitar="' + i + '">' + icono('basura') + '</button></li>').join('') + '</ul>' +
      '<div class="fila fin" style="margin-top:14px"><button class="btn fantasma" id="ant">' + icono('atras') + 'Atrás</button><button class="btn exito" id="crear"' + (b.archivos.length ? '' : ' disabled') + '>' + icono('check') + 'Crear tarea</button></div>';
  }
  return {
    lateral: lateralClase(clase, 'tareas'),
    html:
      '<div class="miga"><a href="#/docente/clase/' + claseId + '/tareas">Tareas</a> / Nueva tarea</div>' +
      '<div class="encabezado"><div><h1>Nueva tarea</h1><p>Datos, rúbrica y trabajos.</p></div></div>' +
      '<div style="max-width:820px">' + pasosAsistente(['Datos', 'Rúbrica', 'Trabajos'], b.paso) + '<div class="tarjeta">' + cuerpo + '</div></div>',
    enlazar(raiz) {
      const $ = s => raiz.querySelector(s);
      if (b.paso === 0) {
        $('#sig').addEventListener('click', () => {
          b.nombre = $('#t-nombre').value.trim(); b.entrega = $('#t-entrega').value; b.instrucciones = $('#t-inst').value;
          if (!b.nombre) { $('#t-nombre').style.borderColor = 'var(--rojo)'; $('#t-nombre').focus(); toast('Escribe el nombre de la tarea'); return; }
          b.paso = 1; render();
        });
      } else if (b.paso === 1) {
        raiz.querySelectorAll('#criterios input').forEach(inp => inp.addEventListener('input', () => {
          const c = b.criterios[Number(inp.dataset.i)];
          c[inp.dataset.k] = inp.value;
          $('#total').textContent = fmt(b.criterios.reduce((s, x) => s + (Number(x.max) || 0), 0));
        }));
        raiz.querySelectorAll('[data-quitar]').forEach(x => x.addEventListener('click', () => {
          if (b.criterios.length === 1) { toast('La rúbrica necesita al menos un criterio'); return; }
          b.criterios.splice(Number(x.dataset.quitar), 1); render();
        }));
        $('#agregar').addEventListener('click', () => { b.criterios.push({ nombre: '', desc: '', max: 1 }); render(); });
        $('#usar-ejemplo').addEventListener('click', () => { b.criterios = DATOS.rubrica.criterios.map(c => Object.assign({}, c)); render(); toast('Rúbrica de ejemplo cargada'); });
        $('#ant').addEventListener('click', () => { b.paso = 0; render(); });
        $('#sig').addEventListener('click', () => {
          const malo = b.criterios.find(c => !c.nombre.trim() || !(Number(c.max) > 0));
          if (malo) { toast('Cada criterio necesita un nombre y puntos mayores que 0'); return; }
          b.criterios.forEach(c => { c.max = Number(c.max); });
          b.paso = 2; render();
        });
      } else {
        enlazarZonaSubida($('#zona'), $('#archivo'), archivos => {
          archivos.forEach(f => b.archivos.push({ nombre: f.name, tamano: f.size }));
          render();
        });
        $('#ejemplos').addEventListener('click', () => {
          archivosEjemplo().forEach(a => { if (!b.archivos.some(x => x.nombre === a.nombre)) b.archivos.push(a); });
          render();
        });
        raiz.querySelectorAll('[data-quitar]').forEach(x => x.addEventListener('click', () => { b.archivos.splice(Number(x.dataset.quitar), 1); render(); }));
        $('#ant').addEventListener('click', () => { b.paso = 1; render(); });
        $('#crear').addEventListener('click', () => {
          const tarea = crearTarea({ id: 'tarea-' + uid(), nombre: b.nombre, entrega: b.entrega, instrucciones: b.instrucciones,
            rubrica: { nombre: b.nombre, criterios: b.criterios.map(c => Object.assign({}, c)) }, archivos: b.archivos.slice() });
          clase.tareas.push(tarea);
          borradorTarea = null;
          toast('Tarea creada');
          ir('/docente/clase/' + claseId + '/tareas/' + tarea.id);
        });
      }
    }
  };
}

/* ---------- Tarea: calificar, revisar y aprobar ---------- */
let detalleAbierto = null;

function vistaTarea(claseId, tareaId) {
  const clase = buscarClase(claseId);
  const tarea = clase && clase.tareas.find(t => t.id === tareaId);
  if (!tarea) { ir('/docente/clase/' + claseId + '/tareas'); return null; }
  const criterios = tarea.rubrica.criterios;
  const simulable = rubricaEsEjemplo(tarea.rubrica);
  const tablaRubrica = '<div class="tabla-envoltura"><table><thead><tr><th>Criterio</th><th>Qué se evalúa</th><th>Puntos</th></tr></thead><tbody>' +
    criterios.map(c => '<tr><td><b>' + esc(c.nombre) + '</b></td><td>' + esc(c.desc || '') + '</td><td>' + fmt(c.max) + '</td></tr>').join('') + '</tbody></table></div>';
  const totalRubrica = fmt(criterios.reduce((s, c) => s + c.max, 0));

  let html = '<div class="miga"><a href="#/docente/clase/' + claseId + '/tareas">Tareas</a> / ' + esc(tarea.nombre) + '</div>' +
    '<div class="encabezado"><div><h1>' + esc(tarea.nombre) + '</h1><p>' + (tarea.entrega ? 'Entrega: ' + esc(tarea.entrega) + ' · ' : '') + tarea.archivos.length + ' trabajos · rúbrica sobre ' + totalRubrica + '</p></div>' + estadoTarea(tarea) + '</div>';

  if (!tarea.calificada) {
    html +=
      '<div class="tarjeta"><h2>' + icono('lapiz') + 'Rúbrica</h2><p class="nota">El asistente solo califica con estos criterios.</p>' + tablaRubrica + '</div>' +
      '<div class="tarjeta"><h2>' + icono('archivo') + 'Trabajos recibidos</h2>' +
        '<ul class="archivos">' + tarea.archivos.map(a => '<li class="archivo">' + iconoArchivo(tipoDeArchivo(a.nombre)) + '<div class="datos"><b>' + esc(a.nombre) + '</b><span>' + tamanoLegible(a.tamano) + '</span></div>' + (a.ejemplo ? '<span class="etiqueta e-sim">ejemplo</span>' : '') + '</li>').join('') + '</ul>' +
        (simulable
          ? (tarea.archivos.some(a => !a.ejemplo) ? infoSim('Tus archivos no se leen: en el prototipo se califican los 5 ensayos de ejemplo.') : '') +
            '<div class="fila" style="margin-top:8px"><button class="btn" id="calificar">' + icono('chispa') + 'Calificar con mi rúbrica</button><span class="nota" style="margin:0">Las notas serán sugerencias: tú decides.</span></div>' +
            '<div id="zona-progreso" class="oculto"><div class="progreso"><div id="barra-progreso"></div></div><div id="texto-progreso" class="nota"></div></div>'
          : infoSim('La calificación simulada solo existe para la rúbrica de ejemplo. Con tu rúbrica, la calificación real llegará en la Fase 2.') +
            '<button class="btn" disabled>' + icono('chispa') + 'Calificar con mi rúbrica</button>') +
      '</div>';
  } else {
    html +=
      '<div class="metricas" id="metricas-calif"></div>' +
      '<div class="tarjeta"><h2>' + icono('chispa') + 'Notas sugeridas <span class="etiqueta e-sim">simuladas</span></h2>' +
        '<p class="nota">Son sugerencias. Puedes cambiar cualquier criterio y tú apruebas la nota final. Los de confianza baja aparecen primero.</p>' +
        '<div class="tabla-envoltura"><table><thead><tr><th>Estudiante</th><th>Nota sugerida</th><th>Confianza</th><th>Estado</th><th></th></tr></thead><tbody id="filas-calif"></tbody></table></div>' +
        '<div id="detalle-calif"></div>' +
        '<div class="fila" style="margin-top:16px"><button class="btn sec" id="btn-exportar">' + icono('descargar') + 'Descargar CSV para el aula virtual</button><span class="nota" style="margin:0" id="aviso-exportar"></span></div>' +
      '</div>' +
      '<details class="tarjeta"><summary style="cursor:pointer;font-weight:600;color:var(--puce)">Ver la rúbrica usada</summary><div style="margin-top:12px">' + tablaRubrica + '</div></details>';
  }

  return {
    lateral: lateralClase(clase, 'tareas'),
    html,
    enlazar(raiz) {
      if (!tarea.calificada) {
        const btn = raiz.querySelector('#calificar');
        if (btn) btn.addEventListener('click', () => calificarLote(tarea, btn));
        return;
      }
      pintarResultados(tarea);
      raiz.querySelector('#btn-exportar').addEventListener('click', () => exportarCSV(tarea));
      if (detalleAbierto) { verDetalle(tarea, detalleAbierto); detalleAbierto = null; }
    }
  };
}

function calificarLote(tarea, btn) {
  btn.disabled = true;
  const rutaActual = location.hash;
  document.getElementById('zona-progreso').classList.remove('oculto');
  const n = tarea.trabajos.length;
  let i = 0;
  const paso = () => {
    if (location.hash !== rutaActual) { tarea.calificada = true; return; } // salió de la página: termina en silencio
    i++;
    document.getElementById('barra-progreso').style.width = (i / n * 100) + '%';
    document.getElementById('texto-progreso').textContent = 'Aplicando tu rúbrica al trabajo ' + i + ' de ' + n + '…';
    if (i < n) setTimeout(paso, 600);
    else setTimeout(() => { tarea.calificada = true; toast('Listo: revisa las notas sugeridas'); render(); }, 500);
  };
  setTimeout(paso, 400);
}

function pintarResultados(tarea) {
  const trabajos = tarea.trabajos;
  const total = fmt(tarea.rubrica.criterios.reduce((s, c) => s + c.max, 0));
  const filas = document.getElementById('filas-calif');
  filas.innerHTML = '';
  ordenarParaRevision(trabajos).forEach(t => {
    const tr = document.createElement('tr');
    const claseConf = t.confianza === 'Alta' ? 'e-ok' : t.confianza === 'Media' ? 'e-aviso' : 'e-mal';
    const claseEst = t.estado === 'Aprobada' ? 'e-ok' : t.estado === 'Editada' ? 'e-aviso' : 'e-neutro';
    tr.innerHTML = '<td><b>' + t.id + '</b></td><td><b>' + fmt(suma(t.final)) + '</b> / ' + total + '</td>' +
      '<td><span class="etiqueta ' + claseConf + '">' + t.confianza + (t.confianza === 'Baja' ? ' · revisar primero' : '') + '</span></td>' +
      '<td><span class="etiqueta ' + claseEst + '">' + (t.estado === 'Aprobada' ? icono('check') : '') + t.estado + '</span></td>' +
      '<td><button class="btn chico sec" data-id="' + t.id + '">Revisar</button></td>';
    filas.appendChild(tr);
  });
  filas.querySelectorAll('button').forEach(b => b.addEventListener('click', () => verDetalle(tarea, b.dataset.id)));
  const aprobadas = trabajos.filter(t => t.estado === 'Aprobada').length;
  const porRevisar = trabajos.filter(t => t.confianza === 'Baja' && t.estado !== 'Aprobada').length;
  document.getElementById('metricas-calif').innerHTML =
    metrica('tarea', 'f-azul', trabajos.length, 'Trabajos calificados') +
    metrica('alerta', 'f-coral', porRevisar, 'Por revisar primero') +
    metrica('check', 'f-verde', aprobadas + ' de ' + trabajos.length, 'Aprobados por ti');
  document.getElementById('btn-exportar').disabled = aprobadas === 0;
  document.getElementById('aviso-exportar').textContent = aprobadas === 0
    ? 'Aprueba al menos una nota para exportar. Solo se exportan notas aprobadas.'
    : 'Se exportan solo las notas aprobadas (' + aprobadas + ' de ' + trabajos.length + ').';
}

function textoRegistro(t) {
  if (!t.aprobacion) return 'Registro para reclamos: todavía sin aprobar. Al aprobar se guarda la rúbrica usada, la justificación por criterio, quién aprobó la nota y cuándo.';
  return 'Registro para reclamos (simulado, se pierde al recargar la página): rúbrica «' + t.aprobacion.rubrica + '», nota ' + fmt(t.aprobacion.nota) +
    ', aprobada por ' + t.aprobacion.por + ' el ' + fechaISO(t.aprobacion.fecha) + '.';
}

function verDetalle(tarea, id) {
  const t = tarea.trabajos.find(x => x.id === id);
  const criterios = tarea.rubrica.criterios;
  const cont = document.getElementById('detalle-calif');
  let html = '<div class="detalle"><div class="fila"><h2 style="margin:0;font-size:17px;color:var(--puce)">' + t.id + '</h2><span class="espacio"></span><button class="btn fantasma chico" id="btn-cerrar">Cerrar</button></div>' +
    '<div class="nota" style="margin:10px 0 0">Fragmento del trabajo que sustenta la sugerencia:</div><div class="cita">“' + t.cita + '”</div>' +
    '<div class="tabla-envoltura"><table><thead><tr><th>Criterio</th><th>Puntos</th><th>Justificación de la sugerencia</th></tr></thead><tbody>';
  criterios.forEach((c, i) => {
    html += '<tr><td><b>' + esc(c.nombre) + '</b></td><td style="white-space:nowrap"><input class="num" type="number" step="0.5" min="0" max="' + c.max + '" value="' + t.final[i] + '" data-i="' + i + '"> / ' + fmt(c.max) + '</td><td>' + t.just[i] + '</td></tr>';
  });
  html += '</tbody></table></div><div class="fila" style="margin-top:14px"><b style="font-size:16px">Nota final: <span id="nota-final">' + fmt(suma(t.final)) + '</span></b><span class="espacio"></span>' +
    '<button class="btn exito" id="btn-aprobar">' + icono('check') + (t.estado === 'Aprobada' ? 'Aprobada' : 'Aprobar nota') + '</button></div>' +
    '<div class="registro" id="registro"></div></div>';
  cont.innerHTML = html;
  const registro = document.getElementById('registro');
  const pintarRegistro = () => {
    registro.className = 'registro' + (t.aprobacion ? '' : ' pendiente');
    registro.innerHTML = icono(t.aprobacion ? 'escudo' : 'info') + '<span></span>';
    registro.querySelector('span').textContent = textoRegistro(t);
    document.getElementById('btn-aprobar').disabled = t.estado === 'Aprobada';
  };
  pintarRegistro();
  cont.querySelectorAll('input.num').forEach(inp => {
    const i = Number(inp.dataset.i);
    inp.addEventListener('input', () => {
      editarCriterio(t, i, inp.value, criterios);
      document.getElementById('nota-final').textContent = fmt(suma(t.final));
      document.getElementById('btn-aprobar').innerHTML = icono('check') + 'Aprobar nota';
      pintarRegistro();
      pintarResultados(tarea);
    });
    // Al salir del campo, mostrar el valor que realmente quedó guardado (p. ej. 5 en un criterio de 4 queda en 4).
    inp.addEventListener('change', () => { inp.value = t.final[i]; });
  });
  document.getElementById('btn-aprobar').addEventListener('click', () => {
    aprobar(t, APP.usuario.nombre, tarea.rubrica.nombre, new Date());
    toast('Nota de ' + t.id + ' aprobada');
    detalleAbierto = t.id; // se queda abierto para que veas el registro
    render();
  });
  document.getElementById('btn-cerrar').addEventListener('click', () => { cont.innerHTML = ''; });
  cont.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function exportarCSV(tarea) {
  const blob = new Blob(['﻿' + generarCSV(tarea.trabajos)], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'notas_' + tarea.id + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  toast('CSV descargado');
}
