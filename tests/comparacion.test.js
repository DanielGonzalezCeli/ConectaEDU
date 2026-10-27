// Pruebas de la comparación IA vs. docente (lo que se mostrará en la demostración).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { compararConDocente, compararTiempos, csvComparacion, notaDocente } = require('../js/logica-comparacion.js');

const criterios = [{ nombre: 'Tesis', max: 4 }, { nombre: 'Argumentación', max: 3 }, { nombre: 'Fuentes', max: 2 }];

test('coincide si la diferencia es de 0,5 puntos o menos (incluido el borde)', () => {
  const r = compararConDocente([{ id: 'T1', puntos: [3, 2, 1], just: ['a', 'b', 'c'], notasDocente: [2.5, '2', '0,4'] }], criterios);
  assert.deepEqual(r.pares.map(p => p.coincide), [true, true, false]);
  assert.equal(r.criterios, 3);
  assert.equal(r.coincidencias, 2);
  assert.equal(r.porcentaje, 66.7);
});

test('solo cuentan los criterios con nota del docente y los trabajos sin notas quedan fuera', () => {
  const r = compararConDocente([
    { id: 'T1', puntos: [4, 3, 2], notasDocente: [4, '', null] },
    { id: 'T2', puntos: [1, 1, 1], notasDocente: [] },
    { id: 'T3', error: 'falló', puntos: [] , notasDocente: [1, 1, 1] }
  ], criterios);
  assert.equal(r.trabajos, 1);
  assert.equal(r.criterios, 1);
  assert.equal(r.porTrabajo[0].completo, false);
  assert.equal(r.porTrabajo[0].notaDocente, null, 'sin todas las notas no se compara el total');
});

test('diferencia promedio, sesgo (la IA más alta es positivo) y diferencia en la nota total', () => {
  const r = compararConDocente([
    { id: 'T1', puntos: [4, 3, 2], notasDocente: [3, 2, 2] },
    { id: 'T2', puntos: [2, 1, 0], notasDocente: [2, 2, 0] }
  ], criterios);
  assert.equal(r.difPromedio, 0.5);          // |1|+|1|+0+0+|−1|+0 = 3 / 6
  assert.equal(r.sesgo, 0.17);               // (1+1+0+0−1+0) / 6
  assert.deepEqual(r.porTrabajo.map(t => t.diferencia), [2, -1]);
  assert.deepEqual(r.porTrabajo.map(t => [t.notaIA, t.notaDocente]), [[9, 7], [3, 4]]);
  assert.equal(r.porCriterio[1].porcentaje, 0);
  assert.equal(r.porCriterio[2].porcentaje, 100);
});

test('las mayores diferencias salen ordenadas y con su justificación', () => {
  const r = compararConDocente([{ id: 'T1', puntos: [4, 0, 2], just: ['j1', 'j2', 'j3'], notasDocente: [3.5, 3, 2] }], criterios);
  assert.deepEqual(r.mayoresDiferencias.map(p => [p.criterio, p.diferencia, p.justificacion]), [['Argumentación', -3, 'j2'], ['Tesis', 0.5, 'j1']]);
});

test('sin notas del docente no hay porcentaje (no se inventa)', () => {
  const r = compararConDocente([{ id: 'T1', puntos: [1, 1, 1], notasDocente: [] }], criterios);
  assert.equal(r.criterios, 0);
  assert.equal(r.porcentaje, null);
  assert.equal(r.difPromedio, null);
});

test('CSV de comparación con encabezado y comillas cuando hace falta', () => {
  const r = compararConDocente([{ id: 'Trabajo, 1', puntos: [3, 2, 1], notasDocente: [3, 1, ''] }], criterios);
  const csv = csvComparacion(r);
  assert.equal(csv.split('\n')[0], 'Trabajo,Criterio,Nota IA,Nota docente,Diferencia,Coincide (±0.5)');
  assert.equal(csv.split('\n')[1], '"Trabajo, 1",Tesis,3,3,0,sí');
  assert.equal(csv.split('\n')[2], '"Trabajo, 1",Argumentación,2,1,1,no');
  assert.equal(csv.trim().split('\n').length, 3);
});

test('tiempos: minutos por trabajo con IA (cronómetro) y a mano (lo que anota el docente)', () => {
  const t = compararTiempos(90000, 3, '45', '6');
  assert.equal(t.minutosIA, 1.5);
  assert.equal(t.minutosIAPorTrabajo, 0.5);
  assert.equal(t.minutosManualPorTrabajo, 15);
  assert.equal(t.minutosRevisionPorTrabajo, 2);
  assert.equal(compararTiempos(0, 3, '', '').minutosManual, null);
  assert.equal(notaDocente('abc'), null);
});
