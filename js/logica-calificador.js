/* ============================================================
   Lógica del calificador (sin interfaz, se prueba con Node).
   Regla: ninguna nota sale del sistema sin aprobación del docente.
   ============================================================ */

const suma = arr => arr.reduce((a, b) => a + b, 0);
const fmt = n => (Math.round(n * 10) / 10).toString().replace('.', ',');

// Prepara cada trabajo: nota final editable, estado y registro de aprobación.
function prepararTrabajos(trabajos) {
  return trabajos.map(t => Object.assign({}, t, {
    final: t.puntos.slice(), estado: 'Sugerida', aprobacion: null
  }));
}

// Convierte lo que escribe el docente en un puntaje válido entre 0 y el máximo.
function limitarPuntos(valor, max) {
  let v = parseFloat(String(valor).replace(',', '.'));
  if (isNaN(v)) v = 0;
  return Math.max(0, Math.min(max, v));
}

// Cambiar un criterio invalida cualquier aprobación previa: hay que volver a aprobar.
function editarCriterio(trabajo, i, valor, criterios) {
  const v = limitarPuntos(valor, criterios[i].max);
  if (v === trabajo.final[i]) return v;
  trabajo.final[i] = v;
  trabajo.estado = 'Editada';
  trabajo.aprobacion = null;
  return v;
}

function aprobar(trabajo, docente, rubrica, fecha) {
  trabajo.estado = 'Aprobada';
  trabajo.aprobacion = { por: docente, fecha: fecha, rubrica: rubrica, nota: suma(trabajo.final) };
}

// Los de confianza baja van primero; el resto mantiene su orden.
function ordenarParaRevision(trabajos) {
  return trabajos.slice().sort((a, b) => (a.confianza === 'Baja' ? -1 : 0) - (b.confianza === 'Baja' ? -1 : 0));
}

function fechaISO(fecha) {
  const p = n => String(n).padStart(2, '0');
  return fecha.getFullYear() + '-' + p(fecha.getMonth() + 1) + '-' + p(fecha.getDate()) + ' ' + p(fecha.getHours()) + ':' + p(fecha.getMinutes());
}

// CSV para el aula virtual: SOLO notas aprobadas por el docente.
function generarCSV(trabajos) {
  let csv = 'Estudiante,Nota final,Aprobada por,Fecha de aprobación\n';
  trabajos.filter(t => t.estado === 'Aprobada').forEach(t => {
    csv += t.id + ',' + suma(t.final) + ',' + t.aprobacion.por + ',' + fechaISO(t.aprobacion.fecha) + '\n';
  });
  return csv;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { suma, fmt, prepararTrabajos, limitarPuntos, editarCriterio, aprobar, ordenarParaRevision, fechaISO, generarCSV };
}
