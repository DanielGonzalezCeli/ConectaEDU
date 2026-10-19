// Pruebas del cálculo de notas y de la regla "el docente decide".
const { test } = require('node:test');
const assert = require('node:assert/strict');
const DATOS = require('../js/datos.js');
const C = require('../js/logica-calificador.js');

const criterios = DATOS.rubrica.criterios;
const nuevos = () => C.prepararTrabajos(DATOS.trabajos);
const fecha = new Date(2026, 9, 5, 9, 30);

test('los datos de ejemplo respetan la rúbrica', () => {
  assert.equal(C.suma(criterios.map(c => c.max)), 10);
  for (const t of DATOS.trabajos) {
    assert.equal(t.puntos.length, criterios.length, t.id);
    assert.equal(t.just.length, criterios.length, t.id);
    t.puntos.forEach((p, i) => assert.ok(p >= 0 && p <= criterios[i].max, t.id + ' criterio ' + i));
  }
});

test('nota total y formato con coma decimal', () => {
  assert.equal(C.suma([3.5, 2.5, 2, 1]), 9);
  assert.equal(C.fmt(6.5), '6,5');
  assert.equal(C.fmt(9), '9');
});

test('los puntos se limitan entre 0 y el máximo del criterio', () => {
  assert.equal(C.limitarPuntos('5', 4), 4);
  assert.equal(C.limitarPuntos('-1', 4), 0);
  assert.equal(C.limitarPuntos('', 4), 0);
  assert.equal(C.limitarPuntos('2,5', 4), 2.5);
});

test('editar un criterio cambia la nota y el estado', () => {
  const [t] = nuevos();
  C.editarCriterio(t, 0, '9', criterios);
  assert.equal(t.final[0], 4);
  assert.equal(C.suma(t.final), 9.5);
  assert.equal(t.estado, 'Editada');
  assert.deepEqual(t.puntos, DATOS.trabajos[0].puntos, 'la sugerencia original no se toca');
});

test('error 4 corregido: editar después de aprobar exige volver a aprobar', () => {
  const [t] = nuevos();
  C.aprobar(t, 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  assert.equal(t.estado, 'Aprobada');
  C.editarCriterio(t, 1, '1', criterios);
  assert.equal(t.estado, 'Editada');
  assert.equal(t.aprobacion, null);
});

test('reescribir el mismo valor no quita la aprobación', () => {
  const [t] = nuevos();
  C.aprobar(t, 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  C.editarCriterio(t, 0, String(t.final[0]), criterios);
  assert.equal(t.estado, 'Aprobada');
});

test('error 7 corregido: la aprobación guarda quién, cuándo, rúbrica y nota', () => {
  const [t] = nuevos();
  C.aprobar(t, 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  assert.deepEqual(t.aprobacion, { por: 'Docente de ejemplo', fecha, rubrica: DATOS.rubrica.nombre, nota: 9 });
});

test('error 5 corregido: el CSV solo incluye notas aprobadas', () => {
  const ts = nuevos();
  assert.equal(C.generarCSV(ts).trim().split('\n').length, 1, 'sin aprobadas, solo encabezado');
  C.aprobar(ts[2], 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  assert.equal(C.generarCSV(ts), 'Estudiante,Nota final,Aprobada por,Fecha de aprobación\nEstudiante 03,4.5,Docente de ejemplo,2026-10-05 09:30\n');
});

test('los de confianza baja aparecen primero', () => {
  assert.equal(C.ordenarParaRevision(nuevos())[0].confianza, 'Baja');
});

test('error 6 corregido: el panel del curso tiene datos coherentes', () => {
  assert.equal(DATOS.curso.length, 8);
  DATOS.curso.forEach(e => assert.ok(e.atasco === null || (e.atasco >= 1 && e.atasco <= DATOS.problema.pasos.length)));
});
