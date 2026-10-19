/* ---------- Docente: mis clases y crear clase ---------- */

function tarjetaClase(c, ruta) {
  return '<a class="clase" href="#' + ruta + '">' +
    '<div class="franja c-' + c.color + '"><b>' + esc(c.nombre) + '</b><span>' + esc([c.materia, c.paralelo, c.periodo].filter(Boolean).join(' · ')) + '</span></div>' +
    '<div class="info"><span>' + icono('usuarios') + plural(c.estudiantes.length, 'estudiante', 'estudiantes') + '</span><span>' + icono('libro') + plural(c.material.length, 'documento', 'documentos') + '</span><span>' + icono('tarea') + plural(c.tareas.length, 'tarea', 'tareas') + '</span></div>' +
  '</a>';
}

function vistaMisClases() {
  const pendientes = [];
  APP.clases.forEach(c => {
    const porAprobar = notasPorAprobar(c);
    if (porAprobar) pendientes.push({ texto: '<b>' + esc(c.nombre) + ':</b> ' + porAprobar + ' notas sugeridas esperan tu aprobación', ruta: '/docente/clase/' + c.id + '/tareas', ico: 'tarea', color: 'f-ambar' });
    c.tareas.filter(t => !t.calificada && t.archivos.length).forEach(t =>
      pendientes.push({ texto: '<b>' + esc(c.nombre) + ':</b> «' + esc(t.nombre) + '» tiene ' + t.archivos.length + ' trabajos listos para calificar', ruta: '/docente/clase/' + c.id + '/tareas/' + t.id, ico: 'chispa', color: 'f-violeta' }));
    if (!c.material.length) pendientes.push({ texto: '<b>' + esc(c.nombre) + ':</b> sube material para que el tutor pueda ayudar', ruta: '/docente/clase/' + c.id + '/material', ico: 'subir', color: 'f-turquesa' });
  });
  const listaPend = pendientes.length
    ? '<ul class="lista-pasos">' + pendientes.map(p => '<li><div class="icono ' + p.color + '" style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center">' + icono(p.ico) + '</div><span class="t">' + p.texto + '</span><a class="btn chico sec" href="#' + p.ruta + '">Ir</a></li>').join('') + '</ul>'
    : '<p class="nota" style="margin:0">Todo al día. 🎉</p>';

  return {
    html:
      '<div class="encabezado"><div><h1>Hola, ' + esc(APP.usuario.nombre) + '</h1><p>Estas son tus clases de este periodo.</p></div>' +
      '<a class="btn" href="#/docente/nueva-clase">' + icono('mas') + 'Crear clase</a></div>' +
      '<div class="tarjeta"><h2>' + icono('reloj') + 'Pendientes</h2><p class="nota">Lo que necesita tu atención, calculado a partir de tus clases.</p>' + listaPend + '</div>' +
      '<h2 style="font-size:18px;color:var(--puce);margin:26px 0 14px">Mis clases</h2>' +
      '<div class="rejilla">' + APP.clases.map(c => tarjetaClase(c, '/docente/clase/' + c.id + '/resumen')).join('') +
        '<a class="clase nueva" href="#/docente/nueva-clase">' + icono('mas') + 'Crear una clase nueva</a>' +
      '</div>'
  };
}

/* ---------- Asistente para crear clase ---------- */
let borradorClase = null;

function nuevoBorrador() {
  return { paso: 0, nombre: '', materia: '', periodo: '2026-2', paralelo: '', color: 'violeta', permitirEjemplo: true, indicaciones: 'Guía con preguntas y pistas. No entregues el resultado final.', creada: null };
}

function vistaNuevaClase() {
  if (!borradorClase) borradorClase = nuevoBorrador();
  const b = borradorClase;
  let cuerpo = '';
  if (b.paso === 0) {
    cuerpo =
      '<h2>' + icono('libro') + 'Datos de la clase</h2><p class="nota">Así la verán tus estudiantes.</p>' +
      '<div class="campo"><label for="c-nombre">Nombre de la materia *</label><input type="text" id="c-nombre" placeholder="Ej.: Cálculo Diferencial" value="' + esc(b.nombre) + '"></div>' +
      '<div class="dos">' +
        '<div class="campo"><label for="c-materia">Código de la materia</label><input type="text" id="c-materia" placeholder="Ej.: MAT-110" value="' + esc(b.materia) + '"></div>' +
        '<div class="campo"><label for="c-paralelo">Paralelo</label><input type="text" id="c-paralelo" placeholder="Ej.: Paralelo 3" value="' + esc(b.paralelo) + '"></div>' +
      '</div>' +
      '<div class="dos">' +
        '<div class="campo"><label for="c-periodo">Periodo</label><select id="c-periodo">' + ['2026-2', '2027-1'].map(p => '<option' + (p === b.periodo ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></div>' +
        '<div class="campo"><label>Color de la clase</label><div class="colores">' + COLORES.map(col =>
          '<input type="radio" name="color" id="col-' + col + '" value="' + col + '"' + (col === b.color ? ' checked' : '') + '><label for="col-' + col + '" class="c-' + col + '" title="' + col + '"></label>').join('') + '</div></div>' +
      '</div>' +
      '<div class="fila fin"><a class="btn fantasma" href="#/docente">Cancelar</a><button class="btn" id="sig">Siguiente ' + icono('flecha') + '</button></div>';
  } else if (b.paso === 1) {
    cuerpo =
      '<h2>' + icono('chat') + 'Reglas del tutor</h2><p class="nota">Tú decides cómo ayuda el tutor a tus estudiantes. Puedes cambiarlo después.</p>' +
      '<div class="interruptor"><div class="texto"><b>Nunca entregar el resultado final</b><span>El tutor guía con una pregunta, luego una pista general y luego una concreta. Siempre activo.</span></div><label class="switch"><input type="checkbox" checked disabled><span></span></label></div>' +
      '<div class="interruptor"><div class="texto"><b>Permitir un ejemplo resuelto con otros datos</b><span>Si el estudiante lo pide, el tutor muestra solo el paso actual con datos distintos.</span></div><label class="switch"><input type="checkbox" id="c-ejemplo"' + (b.permitirEjemplo ? ' checked' : '') + '><span></span></label></div>' +
      '<div class="campo" style="margin-top:10px"><label for="c-ind">Indicaciones para el tutor</label><textarea id="c-ind">' + esc(b.indicaciones) + '</textarea><span class="ayuda">Se aplicarán cuando el tutor use IA (Fase 1).</span></div>' +
      '<div class="fila fin"><button class="btn fantasma" id="ant">' + icono('atras') + 'Atrás</button><button class="btn" id="sig">Crear clase ' + icono('check') + '</button></div>';
  } else {
    const c = buscarClase(b.creada);
    cuerpo =
      '<div style="text-align:center;padding:10px 0">' +
        '<div class="grande-ico f-verde" style="width:64px;height:64px;border-radius:20px;margin:0 auto 12px;display:grid;place-items:center;color:var(--verde)">' + icono('check') + '</div>' +
        '<h2 style="justify-content:center;font-size:22px">¡Clase creada!</h2>' +
        '<p class="nota">Comparte este código con tus estudiantes para que se unan a <b>' + esc(c.nombre) + '</b>.</p>' +
        '<div class="codigo">' + c.codigo + '</div>' +
        '<div class="fila" style="justify-content:center;margin-top:14px"><button class="btn sec" id="copiar">' + icono('copiar') + 'Copiar código</button></div>' +
        '<p class="nota" style="margin-top:22px">Siguiente paso recomendado: sube el material de la materia para preparar el tutor.</p>' +
        '<div class="fila" style="justify-content:center"><a class="btn" href="#/docente/clase/' + c.id + '/material">' + icono('subir') + 'Subir material</a><a class="btn fantasma" href="#/docente/clase/' + c.id + '/resumen">Ir a la clase</a></div>' +
      '</div>';
  }
  return {
    html:
      '<div class="miga"><a href="#/docente">Mis clases</a> / Crear clase</div>' +
      '<div class="encabezado"><div><h1>Crear clase</h1><p>Tres pasos y queda lista para tus estudiantes.</p></div></div>' +
      '<div style="max-width:720px">' + pasosAsistente(['Datos de la clase', 'Reglas del tutor', 'Invitar estudiantes'], b.paso) +
      '<div class="tarjeta">' + cuerpo + '</div></div>',
    enlazar(raiz) {
      const $ = s => raiz.querySelector(s);
      if (b.paso === 0) {
        $('#sig').addEventListener('click', () => {
          b.nombre = $('#c-nombre').value.trim(); b.materia = $('#c-materia').value.trim();
          b.paralelo = $('#c-paralelo').value.trim(); b.periodo = $('#c-periodo').value;
          b.color = raiz.querySelector('input[name=color]:checked').value;
          if (!b.nombre) { $('#c-nombre').focus(); $('#c-nombre').style.borderColor = 'var(--rojo)'; toast('Escribe el nombre de la materia'); return; }
          b.paso = 1; render();
        });
      } else if (b.paso === 1) {
        const guardar = () => { b.permitirEjemplo = $('#c-ejemplo').checked; b.indicaciones = $('#c-ind').value; };
        $('#ant').addEventListener('click', () => { guardar(); b.paso = 0; render(); });
        $('#sig').addEventListener('click', () => {
          guardar();
          const id = 'clase-' + uid();
          APP.clases.push({
            id, nombre: b.nombre, materia: b.materia, periodo: b.periodo, paralelo: b.paralelo, color: b.color,
            codigo: generarCodigo(b.nombre), tutorDemo: false, ejemplo: false, material: [],
            reglas: { permitirEjemplo: b.permitirEjemplo, indicaciones: b.indicaciones }, estudiantes: [], tareas: [], tutor: null
          });
          b.creada = id; b.paso = 2; render();
          toast('Clase creada');
        });
      } else {
        $('#copiar').addEventListener('click', () => copiar(buscarClase(b.creada).codigo));
        borradorClase = null; // la próxima vez empieza de cero
      }
    }
  };
}
