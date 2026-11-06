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

/* ---------- HU-08: editar por criterio y aprobar; la aprobada se distingue ---------- */
test('HU-08: recién calificada, la nota está "sugerida" y no hay criterios editados', () => {
  const [t] = nuevos();
  assert.equal(C.estadoNota(t), 'sugerida');
  assert.deepEqual(C.criteriosEditados(t), []);
});

test('HU-08: editar un criterio la deja "editada" y marca ese criterio', () => {
  const [t] = nuevos();
  C.editarCriterio(t, 1, '1', criterios);
  assert.equal(C.estadoNota(t), 'editada');
  assert.deepEqual(C.criteriosEditados(t), [1]);
  assert.deepEqual(C.resumenNota(t), { sugerida: 9, final: 7.5, estado: 'editada', editados: [1] });
});

test('HU-08: aprobar deja la nota "aprobada", con quién y cuándo', () => {
  const [t] = nuevos();
  C.editarCriterio(t, 0, '3', criterios);
  C.aprobar(t, 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  assert.equal(C.estadoNota(t), 'aprobada');
  assert.equal(t.aprobacion.por, 'Docente de ejemplo');
  assert.equal(t.aprobacion.fecha, fecha);
  assert.equal(t.aprobacion.nota, 8.5);
});

test('HU-08: el docente puede aprobar la sugerencia sin cambiarla', () => {
  const [t] = nuevos();
  C.aprobar(t, 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  assert.equal(C.estadoNota(t), 'aprobada');
  assert.deepEqual(C.criteriosEditados(t), []);
});

test('HU-08: editar una nota aprobada la vuelve "editada" y exige aprobar otra vez', () => {
  const [t] = nuevos();
  C.aprobar(t, 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  C.editarCriterio(t, 2, '0', criterios);
  assert.equal(C.estadoNota(t), 'editada');
  assert.equal(t.aprobacion, null);
});

test('HU-08: si vuelve al valor sugerido sin aprobar, sigue siendo una sugerencia', () => {
  const [t] = nuevos();
  C.editarCriterio(t, 0, '1', criterios);
  C.editarCriterio(t, 0, String(t.puntos[0]), criterios);
  assert.equal(C.estadoNota(t), 'sugerida');
});

test('HU-08: la nota aprobada tiene un estilo distinto de la sugerida y de la editada', () => {
  const clases = ['sugerida', 'editada', 'aprobada'].map(e => C.ESTILO_NOTA[e].celda);
  assert.equal(new Set(clases).size, 3);
  assert.equal(C.ESTILO_NOTA.aprobada.clase, 'e-ok');
  assert.match(C.ESTILO_NOTA.sugerida.texto, /sin aprobar/);
});

/* ---------- HU-09: CSV solo con notas aprobadas ---------- */
test('HU-09: una nota editada después de aprobarla no sale en el CSV', () => {
  const ts = nuevos();
  C.aprobar(ts[0], 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  C.aprobar(ts[1], 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  C.editarCriterio(ts[1], 0, '0', criterios);
  const filas = C.generarCSV(ts).trim().split('\n');
  assert.equal(filas.length, 2, 'encabezado + 1 aprobada');
  assert.match(filas[1], /^Estudiante 01,/);
});

test('HU-09: sugeridas y editadas sin aprobar no salen en el CSV', () => {
  const ts = nuevos();
  C.editarCriterio(ts[0], 0, '1', criterios);
  assert.equal(C.generarCSV(ts), 'Estudiante,Nota final,Aprobada por,Fecha de aprobación\n');
});

test('HU-09: comas, comillas y saltos de línea no rompen las columnas', () => {
  const [t] = nuevos();
  t.id = 'Trabajo 1, grupo "A"';
  C.aprobar(t, 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  const fila = C.generarCSV([t]).split('\n')[1];
  assert.equal(fila, '"Trabajo 1, grupo ""A""",9,Docente de ejemplo,2026-10-05 09:30');
  assert.equal(C.celdaCSV('línea 1\nlínea 2'), '"línea 1\nlínea 2"');
});

test('HU-09: un texto que Excel leería como fórmula se exporta como texto', () => {
  assert.equal(C.celdaCSV('=HYPERLINK("http://x")'), '"\'=HYPERLINK(""http://x"")"');
  assert.equal(C.celdaCSV('+57'), "'+57");
  assert.equal(C.celdaCSV('@SUMA'), "'@SUMA");
  assert.equal(C.celdaCSV(-1), "'-1");
});

test('HU-09: la nota se redondea a dos decimales', () => {
  const [t] = nuevos();
  t.final = [0.1, 0.2, 0, 0];
  C.aprobar(t, 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  assert.match(C.generarCSV([t]).split('\n')[1], /^Estudiante 01,0\.3,/);
});

test('HU-09: el archivo empieza con BOM UTF-8 para que Excel muestre las tildes', () => {
  const ts = nuevos();
  C.aprobar(ts[0], 'Docente de ejemplo', DATOS.rubrica.nombre, fecha);
  const contenido = C.contenidoCSV(ts);
  assert.equal(contenido.charCodeAt(0), 0xFEFF);
  assert.ok(contenido.includes('Fecha de aprobación'), 'la tilde se conserva');
});
