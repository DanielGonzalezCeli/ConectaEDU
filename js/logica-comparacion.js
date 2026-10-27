/* ============================================================
   Comparación de la nota sugerida por la IA con la nota que el docente
   puso a mano (sin interfaz, se prueba con Node).
   Solo cuenta los criterios que tienen nota del docente. El resultado
   describe ESTA tarea; no es una precisión general del producto.
   ============================================================ */

const TOLERANCIA_COINCIDENCIA = 0.5;
const redondear = (n, d = 2) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
const sumar = arr => arr.reduce((a, b) => a + b, 0);

// "2,5" → 2.5; vacío o inválido → null.
function notaDocente(valor) {
  if (valor === null || valor === undefined || String(valor).trim() === '') return null;
  const v = parseFloat(String(valor).replace(',', '.'));
  return Number.isFinite(v) ? v : null;
}

// trabajos: [{ id, puntos (sugerencia original de la IA), just, notasDocente: [..] }]
function compararConDocente(trabajos, criterios, tolerancia = TOLERANCIA_COINCIDENCIA) {
  const pares = [];
  const porTrabajo = [];
  trabajos.forEach(t => {
    if (!t || !Array.isArray(t.puntos) || t.puntos.length !== criterios.length) return; // sin sugerencia de la IA
    const nd = (t.notasDocente || []).map(notaDocente);
    if (!nd.some(v => v !== null)) return;
    criterios.forEach((c, i) => {
      if (nd[i] === null) return;
      const diferencia = redondear(t.puntos[i] - nd[i]);
      pares.push({ trabajo: t.id, criterio: c.nombre, i, notaIA: t.puntos[i], notaDocente: nd[i], diferencia,
        coincide: Math.abs(diferencia) <= tolerancia + 1e-9, justificacion: (t.just || [])[i] || '' });
    });
    const completo = criterios.every((c, i) => nd[i] !== null);
    porTrabajo.push({ id: t.id, notaIA: redondear(sumar(t.puntos)), notaDocente: completo ? redondear(sumar(nd)) : null,
      diferencia: completo ? redondear(sumar(t.puntos) - sumar(nd)) : null, completo });
  });

  const resumen = lista => lista.length ? {
    porcentaje: redondear(100 * lista.filter(p => p.coincide).length / lista.length, 1),
    difPromedio: redondear(sumar(lista.map(p => Math.abs(p.diferencia))) / lista.length),
    // Positivo: la IA puso, en promedio, más puntos que el docente.
    sesgo: redondear(sumar(lista.map(p => p.diferencia)) / lista.length)
  } : { porcentaje: null, difPromedio: null, sesgo: null };

  return Object.assign({
    tolerancia,
    trabajos: porTrabajo.length,
    criterios: pares.length,
    coincidencias: pares.filter(p => p.coincide).length,
    porCriterio: criterios.map((c, i) => {
      const lista = pares.filter(p => p.i === i);
      return Object.assign({ nombre: c.nombre, max: c.max, pares: lista.length, coincidencias: lista.filter(p => p.coincide).length }, resumen(lista));
    }),
    porTrabajo,
    pares,
    mayoresDiferencias: pares.filter(p => p.diferencia !== 0)
      .sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia)).slice(0, 5)
  }, resumen(pares));
}

// Tiempos medidos: el del lote con IA (cronómetro) y los que anota el docente.
function compararTiempos(msLote, nTrabajos, minutosManual, minutosRevision) {
  const n = nTrabajos > 0 ? nTrabajos : null;
  const manual = notaDocente(minutosManual);
  const revision = notaDocente(minutosRevision);
  const minIA = msLote > 0 ? msLote / 60000 : null;
  return {
    trabajos: nTrabajos,
    minutosIA: minIA === null ? null : redondear(minIA, 1),
    minutosIAPorTrabajo: minIA === null || !n ? null : redondear(minIA / n, 2),
    minutosManual: manual,
    minutosManualPorTrabajo: manual === null || !n ? null : redondear(manual / n, 1),
    minutosRevision: revision,
    minutosRevisionPorTrabajo: revision === null || !n ? null : redondear(revision / n, 1)
  };
}

// CSV de la comparación: trabajo, criterio, nota IA, nota docente, diferencia, coincide.
function csvComparacion(resultado) {
  const campo = v => { const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return 'Trabajo,Criterio,Nota IA,Nota docente,Diferencia,Coincide (±' + resultado.tolerancia + ')\n' +
    resultado.pares.map(p => [p.trabajo, p.criterio, p.notaIA, p.notaDocente, p.diferencia, p.coincide ? 'sí' : 'no'].map(campo).join(',')).join('\n') +
    (resultado.pares.length ? '\n' : '');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { compararConDocente, compararTiempos, csvComparacion, notaDocente, TOLERANCIA_COINCIDENCIA };
}
