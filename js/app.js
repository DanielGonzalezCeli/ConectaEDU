/* ============================================================
   Enrutador y marco de la aplicación.
   Cada pantalla tiene una dirección (#/docente, #/estudiante/clase/...),
   así funcionan los botones Atrás/Adelante del navegador.
   ============================================================ */

const RUTAS = [
  [/^\/ingresar$/, vistaIngreso, null],
  [/^\/docente$/, vistaMisClases, 'docente'],
  [/^\/docente\/nueva-clase$/, vistaNuevaClase, 'docente'],
  [/^\/docente\/clase\/([\w-]+)\/tareas\/nueva$/, vistaNuevaTarea, 'docente'],
  [/^\/docente\/clase\/([\w-]+)\/tareas\/([\w-]+)$/, vistaTarea, 'docente'],
  [/^\/docente\/clase\/([\w-]+)\/(resumen|material|tareas|actividad|estudiantes)$/, vistaClaseDocente, 'docente'],
  [/^\/estudiante$/, vistaEstudianteInicio, 'estudiante'],
  [/^\/estudiante\/clase\/([\w-]+)$/, vistaTutorEstudiante, 'estudiante']
];

let rutaAnterior = null;

function inicioDelRol() { return APP.usuario ? '/' + APP.usuario.rol : '/ingresar'; }

function render() {
  const ruta = location.hash.slice(1) || '/ingresar';
  const coincidencia = RUTAS.map(([re, vista, rol]) => ({ m: ruta.match(re), vista, rol })).find(x => x.m);
  if (!coincidencia) { ir(inicioDelRol()); return; }
  if (coincidencia.rol && (!APP.usuario || APP.usuario.rol !== coincidencia.rol)) { ir(APP.usuario ? inicioDelRol() : '/ingresar'); return; }
  if (!coincidencia.rol && APP.usuario) { ir(inicioDelRol()); return; }

  const v = coincidencia.vista(...coincidencia.m.slice(1));
  if (!v) return; // la vista redirigió

  const raiz = document.getElementById('app');
  raiz.innerHTML = v.sinMarco ? v.html : marco(v);
  if (!v.sinMarco) enlazarMarco(raiz);
  if (v.enlazar) v.enlazar(raiz);
  if (ruta !== rutaAnterior) { window.scrollTo(0, 0); rutaAnterior = ruta; }
}

function marco(v) {
  const u = APP.usuario;
  const iniciales = u.nombre.split(' ').filter(p => p.length > 2).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const otroRol = u.rol === 'docente' ? 'estudiante' : 'docente';
  return '<header class="barra">' +
      '<a class="logo" href="#' + inicioDelRol() + '"><span class="marca">C</span>ConectaEdu</a>' +
      '<div class="usuario"><span class="chip-rol">' + (u.rol === 'docente' ? 'Docente' : 'Estudiante') + '</span>' +
        '<button class="avatar" id="btn-avatar" title="Mi cuenta">' + iniciales + '</button>' +
        '<div class="menu oculto" id="menu">' +
          '<div class="quien"><b>' + esc(u.nombre) + '</b>' + esc(u.correo) + '</div>' +
          '<button data-accion="rol">' + icono('cambiar') + 'Ver como ' + otroRol + '</button>' +
          '<button data-accion="reiniciar">' + icono('reloj') + 'Reiniciar la demostración</button>' +
          '<button data-accion="salir">' + icono('salir') + 'Cerrar sesión</button>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<div class="cuerpo">' + (v.lateral || '') + '<main class="contenido">' + v.html + '</main></div>' +
    '<div class="pie">ConectaEdu · Emprendimiento Tecnológico · PUCE · Prototipo para validación, no es un producto terminado</div>';
}

function enlazarMarco(raiz) {
  const menu = raiz.querySelector('#menu');
  raiz.querySelector('#btn-avatar').addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('oculto'); });
  document.addEventListener('click', () => menu.classList.add('oculto'), { once: true });
  menu.addEventListener('click', e => {
    const b = e.target.closest('[data-accion]'); if (!b) return;
    const accion = b.dataset.accion;
    if (accion === 'rol') {
      const rol = APP.usuario.rol === 'docente' ? 'estudiante' : 'docente';
      APP.usuario = Object.assign({ rol }, DATOS.cuentas[rol]);
      toast('Ahora ves la página como ' + rol);
      ir('/' + rol);
    } else if (accion === 'reiniciar') {
      iniciarDatos(); borradorClase = null; borradorTarea = null; rolIngreso = 'docente';
      toast('Demostración reiniciada');
      ir('/ingresar');
    } else {
      APP.usuario = null;
      ir('/ingresar');
    }
  });
}

iniciarDatos();
window.addEventListener('hashchange', render);
render();
