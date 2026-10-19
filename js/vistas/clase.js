/* ---------- Docente: dentro de una clase ---------- */

const SECCIONES = [
  ['resumen', 'inicio', 'Resumen'],
  ['material', 'libro', 'Material del tutor'],
  ['tareas', 'tarea', 'Tareas y calificación'],
  ['actividad', 'grafico', 'Actividad del tutor'],
  ['estudiantes', 'usuarios', 'Estudiantes']
];

function lateralClase(clase, seccion) {
  const pend = notasPorAprobar(clase);
  return '<aside class="lateral">' +
    '<a class="volver" href="#/docente">' + icono('atras') + 'Mis clases</a>' +
    '<div class="clase-actual f-' + clase.color + '"><b>' + esc(clase.nombre) + '</b><span>' + esc([clase.materia, clase.paralelo].filter(Boolean).join(' · ')) + '</span></div>' +
    '<nav>' + SECCIONES.map(([id, ico, txt]) =>
      '<a href="#/docente/clase/' + clase.id + '/' + id + '" class="' + (id === seccion ? 'activa' : '') + '">' + icono(ico) + txt +
      (id === 'tareas' && pend ? '<span class="cuenta">' + pend + '</span>' : '') + '</a>').join('') + '</nav>' +
  '</aside>';
}

function vistaClaseDocente(id, seccion) {
  const clase = buscarClase(id);
  if (!clase) { ir('/docente'); return null; }
  const v = { resumen: seccionResumen, material: seccionMaterial, tareas: seccionTareas, actividad: seccionActividad, estudiantes: seccionEstudiantes }[seccion](clase);
  v.lateral = lateralClase(clase, seccion);
  return v;
}

function encabezadoClase(clase, titulo, texto, accion) {
  return '<div class="encabezado"><div><div class="miga"><a href="#/docente">Mis clases</a> / ' + esc(clase.nombre) + '</div><h1>' + titulo + '</h1><p>' + texto + '</p></div>' + (accion || '') + '</div>';
}

function tarjetaCodigo(clase) {
  return '<div class="tarjeta"><h2>' + icono('llave') + 'Código de la clase</h2><p class="nota">Tus estudiantes lo escriben en «Unirme a una clase».</p>' +
    '<div class="fila"><span class="codigo">' + clase.codigo + '</span><button class="btn sec" data-copiar="' + clase.codigo + '">' + icono('copiar') + 'Copiar</button></div></div>';
}
function enlazarCopiar(raiz) {
  raiz.querySelectorAll('[data-copiar]').forEach(b => b.addEventListener('click', () => copiar(b.dataset.copiar)));
}

/* ---------- Resumen ---------- */
function seccionResumen(clase) {
  const ruta = s => '#/docente/clase/' + clase.id + '/' + s;
  const aprobadas = clase.tareas.some(t => t.trabajos.some(x => x.estado === 'Aprobada') && t.calificada);
  const pasos = [
    [true, 'Crear la clase', null],
    [clase.material.length > 0, 'Subir material para el tutor', ruta('material')],
    [clase.estudiantes.length > 0, 'Compartir el código con tus estudiantes', ruta('estudiantes')],
    [clase.tareas.length > 0, 'Crear una tarea con tu rúbrica', ruta('tareas')],
    [aprobadas, 'Revisar y aprobar las primeras notas', ruta('tareas')]
  ];
  const hechos = pasos.filter(p => p[0]).length;
  const tutor = clase.tutor;
  return {
    html:
      encabezadoClase(clase, 'Resumen', 'Lo más importante de la clase de un vistazo.') +
      '<div class="metricas">' +
        metrica('usuarios', 'f-azul', clase.estudiantes.length, 'Estudiantes') +
        metrica('libro', 'f-turquesa', clase.material.length, 'Documentos del tutor') +
        metrica('tarea', 'f-violeta', clase.tareas.length, 'Tareas') +
        metrica('reloj', 'f-ambar', notasPorAprobar(clase), 'Notas por aprobar') +
      '</div>' +
      '<div class="dos">' +
        '<div class="tarjeta"><h2>' + icono('check') + 'Primeros pasos</h2><p class="nota">' + hechos + ' de ' + pasos.length + ' completados</p>' +
          '<div class="progreso" style="margin-top:0"><div style="width:' + (hechos / pasos.length * 100) + '%"></div></div>' +
          '<ul class="lista-pasos">' + pasos.map(([ok, t, r]) => '<li class="' + (ok ? 'hecho' : '') + '"><span class="check">' + (ok ? '✓' : '') + '</span><span class="t">' + t + '</span>' +
            (!ok && r ? '<a class="btn chico sec" href="' + r + '">Hacer</a>' : '') + '</li>').join('') + '</ul></div>' +
        '<div>' + tarjetaCodigo(clase) +
          '<div class="tarjeta"><h2>' + icono('chat') + 'Tutor en esta sesión</h2>' +
          (tutor
            ? '<p class="nota">Lo que hizo el estudiante de la demostración.</p><div class="fila"><span class="etiqueta e-violeta">' + tutor.estado.pistas + ' pistas</span><span class="etiqueta e-mal">' + tutor.estado.bloqueos + ' intentos de respuesta directa</span><span class="etiqueta e-neutro">' + (tutor.estado.terminado ? 'Problema completado' : 'Paso ' + (tutor.estado.paso + 1) + ' de 5') + '</span></div>' +
              '<div class="fila" style="margin-top:14px"><a class="btn chico sec" href="' + ruta('actividad') + '">Ver actividad completa</a></div>'
            : '<p class="nota" style="margin:0">' + (clase.material.length ? 'El tutor de demostración solo funciona en «Fundamentos de Estadística». Con IA real (Fase 1) usará el material de esta clase.' : 'Sube material para preparar el tutor de esta clase.') + '</p>') +
          '</div>' +
        '</div>' +
      '</div>',
    enlazar: enlazarCopiar
  };
}

/* ---------- Material del tutor ---------- */
function filaArchivo(item) {
  const listo = item.estado === 'listo';
  return '<li class="archivo" data-uid="' + item.uid + '">' + iconoArchivo(item.tipo) +
    '<div class="datos"><b title="' + esc(item.nombre) + '">' + esc(item.nombre) + '</b>' +
      '<span class="txt">' + (listo ? item.tipo + (item.tamano ? ' · ' + tamanoLegible(item.tamano) : '') : (item.texto || 'En cola…')) + '</span>' +
      (listo ? '' : '<div class="mini-barra"><div style="width:' + (item.progreso || 0) + '%"></div></div>') +
    '</div>' +
    (listo ? '<span class="etiqueta e-ok">' + icono('check') + 'Listo para el tutor</span>' : '') +
    '<span class="etiqueta e-sim">' + (item.ejemplo ? 'ejemplo' : 'simulado') + '</span>' +
    '<button class="quitar" data-quitar="' + item.uid + '" title="Quitar">' + icono('basura') + '</button>' +
  '</li>';
}

function pintarArchivo(item) {
  const el = document.querySelector('[data-uid="' + item.uid + '"]');
  if (!el) return;
  if (item.estado === 'listo') { el.outerHTML = filaArchivo(item); return; }
  el.querySelector('.txt').textContent = item.texto;
  el.querySelector('.mini-barra div').style.width = item.progreso + '%';
}

// Animación de "subiendo y leyendo". No se lee el archivo: es solo una demostración.
function simularProcesamiento(item) {
  const fases = [[30, 'Subiendo…'], [65, 'Subiendo…'], [85, 'Leyendo el documento…'], [100, 'Preparando para el tutor…']];
  let k = 0;
  const avanzar = () => {
    if (k < fases.length) { item.progreso = fases[k][0]; item.texto = fases[k][1]; k++; pintarArchivo(item); setTimeout(avanzar, 550); }
    else { item.estado = 'listo'; pintarArchivo(item); }
  };
  setTimeout(avanzar, 150);
}

function seccionMaterial(clase) {
  const r = clase.reglas;
  return {
    html:
      encabezadoClase(clase, 'Material del tutor', 'Sube guías, diapositivas y ejercicios. El tutor responderá solo con este material.',
        clase.tutorDemo ? '<button class="btn sec" id="probar">' + icono('ojo') + 'Probar como estudiante</button>' : '') +
      infoSim('Tus archivos <b>no se leen ni se envían</b> a ningún lado: en este prototipo solo se muestra su nombre y una animación. En la Fase 1, el tutor buscará en este material para responder cada pregunta.') +
      '<div class="lado derecha">' +
        '<div class="tarjeta"><h2>' + icono('subir') + 'Documentos</h2><p class="nota">PDF, Word, PowerPoint o texto.</p>' +
          '<div class="zona-subida" id="zona"><div class="grande-ico">' + icono('subir') + '</div><b>Arrastra tus archivos aquí</b>o haz clic para elegirlos</div>' +
          '<input type="file" id="archivo" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx" class="oculto">' +
          '<div class="fila" style="margin-top:10px"><button class="btn fantasma chico" id="ejemplo-doc">' + icono('mas') + 'Agregar un documento de ejemplo</button></div>' +
          '<ul class="archivos" id="lista">' + clase.material.map(filaArchivo).join('') + '</ul>' +
          (clase.material.length ? '' : '<p class="nota" id="sin-material" style="text-align:center;margin-top:10px">Todavía no hay material. El tutor no podrá ayudar hasta que subas algo.</p>') +
        '</div>' +
        '<div class="tarjeta"><h2>' + icono('escudo') + 'Reglas del tutor</h2><p class="nota">Tú decides cómo ayuda.</p>' +
          '<div class="interruptor"><div class="texto"><b>Nunca entregar el resultado final</b><span>Pregunta, luego pista general, luego pista concreta.</span></div><label class="switch"><input type="checkbox" checked disabled><span></span></label></div>' +
          '<div class="interruptor"><div class="texto"><b>Permitir ejemplo resuelto</b><span>Solo el paso actual, con otros datos.</span></div><label class="switch"><input type="checkbox" id="r-ejemplo"' + (r.permitirEjemplo ? ' checked' : '') + '><span></span></label></div>' +
          '<div class="campo" style="margin-top:8px"><label for="r-ind">Indicaciones</label><textarea id="r-ind">' + esc(r.indicaciones) + '</textarea><span class="ayuda">Se aplicarán cuando el tutor use IA (Fase 1).</span></div>' +
          '<button class="btn" id="guardar-reglas">Guardar reglas</button>' +
        '</div>' +
      '</div>',
    enlazar(raiz) {
      const lista = raiz.querySelector('#lista');
      const agregar = archivos => {
        archivos.forEach(f => {
          const item = { uid: uid(), nombre: f.name, tamano: f.size, tipo: tipoDeArchivo(f.name), estado: 'procesando', progreso: 0, texto: 'En cola…' };
          clase.material.push(item);
          lista.insertAdjacentHTML('beforeend', filaArchivo(item));
          simularProcesamiento(item);
        });
        const sin = raiz.querySelector('#sin-material'); if (sin && clase.material.length) sin.remove();
      };
      enlazarZonaSubida(raiz.querySelector('#zona'), raiz.querySelector('#archivo'), agregar);
      raiz.querySelector('#ejemplo-doc').addEventListener('click', () => agregar([{ name: 'Guía de ejercicios (ejemplo).pdf', size: 420000 }]));
      lista.addEventListener('click', e => {
        const b = e.target.closest('[data-quitar]'); if (!b) return;
        clase.material = clase.material.filter(m => m.uid !== b.dataset.quitar);
        b.closest('.archivo').remove();
        toast('Documento quitado del tutor');
      });
      raiz.querySelector('#guardar-reglas').addEventListener('click', () => {
        r.permitirEjemplo = raiz.querySelector('#r-ejemplo').checked;
        r.indicaciones = raiz.querySelector('#r-ind').value;
        toast('Reglas del tutor guardadas');
      });
      const probar = raiz.querySelector('#probar');
      if (probar) probar.addEventListener('click', () => verComoEstudiante(clase.id));
    }
  };
}

/* ---------- Actividad del tutor ---------- */
function seccionActividad(clase) {
  const tutor = clase.tutor;
  if (!tutor) {
    return { html: encabezadoClase(clase, 'Actividad del tutor', 'Qué intentan tus estudiantes y dónde se atascan.') +
      '<div class="tarjeta">' + vacio('grafico', 'Todavía no hay actividad', 'Cuando tus estudiantes usen el tutor, aquí verás sus conversaciones, las pistas que pidieron y en qué paso se atascan. En este prototipo, el tutor de demostración está en «Fundamentos de Estadística».',
        '<a class="btn sec" href="#/docente/clase/estadistica/actividad">Ver el ejemplo</a>') + '</div>' };
  }
  const e = tutor.estado;
  const conversacion = tutor.mensajes.length > 1
    ? tutor.mensajes.map(m => '<div><b>' + (m.rol === 'tutor' ? 'Tutor: ' : 'Estudiante: ') + '</b>' + esc(m.texto) + '</div>').join('')
    : vacio('chat', 'Sin conversación todavía', 'Entra como estudiante y escribe al tutor: lo verás aquí.', '<button class="btn sec" id="probar">' + icono('ojo') + 'Probar como estudiante</button>');
  const curso = DATOS.curso, n = curso.length;
  const barras = DATOS.problema.pasos.map((p, i) => {
    const k = curso.filter(x => x.atasco === i + 1).length;
    return '<div class="barra-fila"><span>Paso ' + (i + 1) + ' · ' + p.nombre + '</span><div class="barra-dato"><div style="width:' + Math.round(k / n * 100) + '%"></div></div><span>' + k + ' de ' + n + '</span></div>';
  }).join('');
  return {
    html:
      encabezadoClase(clase, 'Actividad del tutor', 'Qué intentan tus estudiantes y dónde se atascan. Algo que los tutores gratuitos no te muestran.') +
      '<div class="tarjeta"><h2>' + icono('chat') + 'Sesión del estudiante de la demostración <span class="etiqueta e-ok">en vivo</span></h2>' +
        '<p class="nota">Lo que pasa en el chat del estudiante aparece aquí.</p>' +
        '<div class="metricas">' +
          metrica('chispa', 'f-violeta', e.pistas, 'Pistas entregadas') +
          metrica('alerta', 'f-coral', e.bloqueos, 'Intentos de sacar la respuesta') +
          metrica('flecha', 'f-azul', e.terminado ? 'Completado' : (e.paso + 1) + ' de 5', 'Paso actual del problema') +
        '</div>' +
        '<div class="transcripcion">' + conversacion + '</div>' +
      '</div>' +
      '<div class="tarjeta"><h2>' + icono('grafico') + 'Dónde se atasca el curso <span class="etiqueta e-sim">datos de ejemplo</span></h2>' +
        '<p class="nota">8 estudiantes ficticios. Cada barra cuenta en qué paso se atascó cada uno: así sabes qué reforzar en la próxima clase.</p>' + barras +
        '<div class="tabla-envoltura" style="margin-top:16px"><table><thead><tr><th>Estudiante</th><th>Pistas usadas</th><th>Intentos de respuesta directa</th><th>Se atascó en</th></tr></thead><tbody>' +
        curso.map(x => '<tr><td>' + x.nombre + '</td><td>' + x.pistas + '</td><td>' + (x.intentos ? '<span class="etiqueta e-mal">' + x.intentos + '</span>' : '0') + '</td><td>' +
          (x.atasco ? '<span class="etiqueta e-aviso">Paso ' + x.atasco + '</span>' : '<span class="etiqueta e-ok">Sin atascos</span>') + '</td></tr>').join('') +
        '</tbody></table></div>' +
      '</div>',
    enlazar(raiz) {
      const p = raiz.querySelector('#probar'); if (p) p.addEventListener('click', () => verComoEstudiante(clase.id));
      const t = raiz.querySelector('.transcripcion'); t.scrollTop = t.scrollHeight;
    }
  };
}

/* ---------- Estudiantes ---------- */
function seccionEstudiantes(clase) {
  const tabla = clase.estudiantes.length
    ? '<div class="tabla-envoltura"><table><thead><tr><th>Estudiante</th><th>Estado</th></tr></thead><tbody>' +
      clase.estudiantes.map(e => '<tr><td>' + esc(e.nombre) + (e.demo ? ' <span class="etiqueta e-violeta">tú, en la demo</span>' : '') + '</td><td>' +
        (e.demo ? '<span class="etiqueta e-ok">Se unió con el código</span>' : '<span class="etiqueta e-sim">ficticio</span>') + '</td></tr>').join('') +
      '</tbody></table></div>'
    : vacio('usuarios', 'Aún no hay estudiantes', 'Comparte el código de la clase. Puedes probarlo tú mismo: cambia a la vista de estudiante desde tu menú y únete con el código.');
  return {
    html:
      encabezadoClase(clase, 'Estudiantes', 'Quiénes están en la clase y cómo invitarlos.') +
      '<div class="lado">' + tarjetaCodigo(clase) +
        '<div class="tarjeta"><h2>' + icono('usuarios') + clase.estudiantes.length + ' estudiantes</h2><p class="nota">Solo guardamos lo necesario: nombre y actividad en el tutor.</p>' + tabla + '</div>' +
      '</div>',
    enlazar: enlazarCopiar
  };
}

// El docente prueba el tutor: cambia a la vista de estudiante y entra a la clase.
function verComoEstudiante(claseId) {
  APP.usuario = Object.assign({ rol: 'estudiante' }, DATOS.cuentas.estudiante);
  unirAClase(buscarClase(claseId));
  ir('/estudiante/clase/' + claseId);
}
