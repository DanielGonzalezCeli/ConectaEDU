/* ============================================================
   Lógica del tutor SIMULADO (sin interfaz, se prueba con Node).
   No hay IA: son reglas escritas a mano sobre un solo problema.
   Regla central: el tutor nunca dice un valor que el estudiante
   no haya dicho antes.
   ============================================================ */

function crearEstadoTutor() {
  return { paso: 0, nivel: 0, pistas: 0, bloqueos: 0, terminado: false };
}

// Extrae números del texto. La coma es decimal solo si une dos números
// sueltos ("2,5" → 2.5); en una lista como "4,8,6,5,7" separa datos.
function numerosDe(texto) {
  const t = texto.replace(/(^|[^\d,])(\d+),(\d+)(?!\d|,\d)/g, '$1$2.$3');
  const m = t.match(/\d+(\.\d+)?/g);
  return m ? m.map(Number) : [];
}

// Si el estudiante copia los datos del enunciado (3 o más de ellos), esos
// números no cuentan como respuesta. Evita que el 6 de los datos se tome
// como la media en "4+8+6+5+7=30".
function numerosRespuesta(texto, datos) {
  const nums = numerosDe(texto);
  const citados = new Set(nums.filter(n => datos.includes(n)));
  if (citados.size < 3) return nums;
  const porQuitar = datos.slice();
  return nums.filter(n => {
    const k = porQuitar.indexOf(n);
    if (k === -1) return true;
    porQuitar.splice(k, 1);
    return false;
  });
}

const coincide = (nums, esperado) => nums.some(n => esperado.some(e => Math.abs(n - e) < 1e-6));

const RE_PISTA = /pista|ayuda|no s[eé]|no entiendo|c[oó]mo (empiezo|se hace|lo hago)|atasc/;
const RE_PROFESOR = /soy (el |la |tu |su )?(profe|profesor|profesora|docente)\b/;
const RE_URGENTE = /urgente|prisa|apurad/;
const RE_EJEMPLO = /(ejemplo|ejercicio) (resuelto|parecido|similar|igual)|mu[eé]strame (un|otro) (ejemplo|ejercicio)/;
const RE_DIRECTO = /(dame|dime|d[ií]game|p[aá]same|quiero|necesito|mu[eé]strame|cu[aá]l es) (ya |solo |s[oó]lo )?(la |el )?(respuesta|soluci[oó]n|resultado)|resu[eé]lve(lo|me)?\b|hazlo (t[uú]|por m[ií])|d[aá]melo/;

function darPista(estado, paso) {
  const idx = Math.min(estado.nivel, 2);
  estado.nivel = Math.min(estado.nivel + 1, 3);
  estado.pistas++;
  return paso.pistas[idx];
}

// Procesa un mensaje del estudiante. Modifica `estado` y devuelve
// { texto, fuente, tipo } con tipo: avance | fin | bloqueo | pista | repetido | error | otro.
// opciones.permitirEjemplo (por defecto true) lo decide el docente.
function procesarMensaje(estado, texto, problema, opciones = {}) {
  const permitirEjemplo = opciones.permitirEjemplo !== false;
  const pasos = problema.pasos;
  if (estado.terminado) {
    return { tipo: 'otro', fuente: 'Banco de ejercicios del docente', texto: 'Ya resolviste este problema. Si quieres, practica con otro de la guía.' };
  }
  const t = texto.toLowerCase();
  const nums = numerosRespuesta(texto, problema.datos);

  // 1) ¿Respondió bien? Primero un paso posterior nombrado explícitamente
  //    ("la media es 6"), luego el paso actual. Avanza hasta un solo paso
  //    después del que respondió; nunca encadena pasos que no dijo.
  let resuelto = -1;
  for (let j = pasos.length - 1; j > estado.paso; j--) {
    if (pasos[j].claves.test(t) && coincide(nums, pasos[j].esperado)) { resuelto = j; break; }
  }
  if (resuelto === -1 && coincide(nums, pasos[estado.paso].esperado)) resuelto = estado.paso;
  if (resuelto !== -1) {
    const p = pasos[resuelto];
    if (resuelto === pasos.length - 1) {
      estado.paso = resuelto;
      estado.terminado = true;
      return { tipo: 'fin', fuente: p.fuente, texto: '¡Lo lograste! Resolviste el problema por tu cuenta: media 6 y desviación estándar muestral de unos 1,58, usando n menos 1. Pistas usadas en total: ' + estado.pistas + '.' };
    }
    estado.paso = resuelto + 1;
    estado.nivel = 0;
    return { tipo: 'avance', fuente: p.fuente, texto: p.ok };
  }

  // 2) ¿Intenta sacar la respuesta? Se cuenta para el panel del docente.
  const p = pasos[estado.paso];
  const pidePista = RE_PISTA.test(t);
  const esProfesor = RE_PROFESOR.test(t);
  const esEjemplo = RE_EJEMPLO.test(t);
  const esDirecto = RE_DIRECTO.test(t);
  const esUrgente = RE_URGENTE.test(t) && !pidePista;
  if (esProfesor || esEjemplo || esDirecto || esUrgente) {
    estado.bloqueos++;
    let intro;
    if (esProfesor) intro = 'Desde el chat no puedo comprobar quién eres. Tu docente configuró este tutor para guiar y no para resolver. Si eres el docente, revisa el panel. Mientras, te ayudo así: ';
    else if (esEjemplo && permitirEjemplo) return { tipo: 'bloqueo', fuente: p.fuente, texto: 'Con otros datos te muestro solo este paso: ' + p.ejemplo + ' Aplica ese mismo paso a tus datos. ' + p.pregunta };
    else if (esEjemplo) intro = 'Tu docente prefirió que no muestre ejemplos resueltos. Te ayudo con una pista: ';
    else if (RE_URGENTE.test(t)) intro = 'Entiendo que tengas prisa. Aun así, mi función es que llegues tú al resultado, y con una pista vas más rápido: ';
    else intro = 'No te voy a dar el resultado final, pero sí el siguiente paso: ';
    return { tipo: 'bloqueo', fuente: p.fuente, texto: intro + darPista(estado, p) };
  }

  // 3) Pide ayuda de forma legítima.
  if (pidePista) return { tipo: 'pista', fuente: p.fuente, texto: darPista(estado, p) };

  // 4) Dio un número: ¿es un resultado que ya tenía o un error?
  if (nums.length) {
    const anterior = pasos.slice(0, estado.paso).find(q => coincide(nums, q.esperado));
    if (anterior) return { tipo: 'repetido', fuente: p.fuente, texto: 'Ese valor es el de «' + anterior.nombre.toLowerCase() + '», que ya tienes. Ahora: ' + p.pregunta };
    return { tipo: 'error', fuente: p.fuente, texto: 'Ese valor no coincide con lo que espero. Revisa tu cálculo. ' + darPista(estado, p) };
  }

  return { tipo: 'otro', fuente: p.fuente, texto: 'Cuéntame qué has hecho hasta ahora. ' + p.pregunta };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { crearEstadoTutor, numerosDe, numerosRespuesta, procesarMensaje };
}
