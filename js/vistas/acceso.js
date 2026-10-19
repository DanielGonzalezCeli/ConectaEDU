/* ---------- Inicio de sesión (simulado) ---------- */
let rolIngreso = 'docente';

function vistaIngreso() {
  const cuenta = DATOS.cuentas[rolIngreso];
  return {
    sinMarco: true,
    html:
      '<div class="ingreso">' +
        '<section class="hero">' +
          '<div class="logo"><span class="marca">C</span>ConectaEdu</div>' +
          '<h1>Califica con tu rúbrica.<br>Convierte tu material en un tutor.</h1>' +
          '<p>Un asistente para docentes universitarios que califican solos. Tú decides cada nota y ves cómo aprenden tus estudiantes.</p>' +
          '<div class="ventaja"><div class="icono">' + icono('tarea') + '</div><div><b>Tu rúbrica, tu decisión final</b><span>Nota sugerida por criterio, con justificación y nivel de confianza. Ninguna nota se publica sin tu aprobación.</span></div></div>' +
          '<div class="ventaja"><div class="icono">' + icono('chat') + '</div><div><b>Un tutor que no da la respuesta</b><span>Responde solo con el material que subes y guía con preguntas y pistas.</span></div></div>' +
          '<div class="ventaja"><div class="icono">' + icono('grafico') + '</div><div><b>Ves lo que pasa</b><span>Qué intentan tus estudiantes, dónde se atascan y cuántas veces pidieron la respuesta.</span></div></div>' +
        '</section>' +
        '<section class="formulario"><div class="caja">' +
          '<h2>Iniciar sesión</h2><p class="nota">Elige cómo quieres entrar a la demostración.</p>' +
          '<div class="segmento">' +
            '<button data-rol="docente" class="' + (rolIngreso === 'docente' ? 'activa' : '') + '">' + icono('birrete') + 'Soy docente</button>' +
            '<button data-rol="estudiante" class="' + (rolIngreso === 'estudiante' ? 'activa' : '') + '">' + icono('usuario') + 'Soy estudiante</button>' +
          '</div>' +
          '<form id="form-ingreso">' +
            '<div class="campo"><label for="correo">Correo</label><input type="email" id="correo" value="' + cuenta.correo + '" autocomplete="off"></div>' +
            '<div class="campo"><label for="clave">Contraseña</label><input type="password" id="clave" value="demostracion"></div>' +
            '<button class="btn grande" type="submit">Ingresar ' + icono('flecha') + '</button>' +
          '</form>' +
          '<div class="info-sim" style="margin-top:18px">' + icono('candado') + '<span>Inicio de sesión simulado: la cuenta de ejemplo ya está escrita y no se verifica ninguna contraseña. En el producto real cada docente tendrá su propia cuenta.</span></div>' +
        '</div></section>' +
      '</div>',
    enlazar(raiz) {
      raiz.querySelectorAll('.segmento button').forEach(b => b.addEventListener('click', () => { rolIngreso = b.dataset.rol; render(); }));
      raiz.querySelector('#form-ingreso').addEventListener('submit', e => {
        e.preventDefault();
        APP.usuario = Object.assign({ rol: rolIngreso }, DATOS.cuentas[rolIngreso]);
        ir(rolIngreso === 'docente' ? '/docente' : '/estudiante');
      });
    }
  };
}
