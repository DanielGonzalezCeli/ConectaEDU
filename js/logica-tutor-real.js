/* ============================================================
   Tutor real con el material del docente (sin interfaz, se prueba con Node).
   El material y la conversación viven solo en la memoria de la pestaña:
   se envían al servidor con cada pregunta y se borran al recargar.
   No se pide ni se guarda ningún nombre de estudiante.
   ============================================================ */

// Los mismos límites que valida el servidor (servidor/tutor.js).
const LIMITES_TUTOR = { caracteres: 60000, bytesPdf: 5 * 1024 * 1024, pdfs: 5, pregunta: 2000 };

function crearEstadoTutorReal() {
  return { material: [], mensajes: [], costoUSD: 0, contador: 0 };
}

// Bytes reales de un archivo en base64 (sin contar el relleno «=»).
function bytesDeBase64(b64) {
  const s = String(b64 || '').replace(/\s/g, '');
  const relleno = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor(s.length * 3 / 4) - relleno);
}

function resumenMaterial(material) {
  const pdfs = material.filter(m => m.pdfBase64);
  return {
    documentos: material.length,
    caracteres: material.reduce((s, m) => s + (m.texto ? m.texto.length : 0), 0),
    pdfs: pdfs.length,
    bytesPdf: pdfs.reduce((s, m) => s + bytesDeBase64(m.pdfBase64), 0)
  };
}

function nombreUnico(material, nombre) {
  const base = String(nombre || '').trim().slice(0, 200) || 'Documento';
  let n = base, i = 2;
  while (material.some(m => m.nombre === n)) n = base + ' (' + (i++) + ')';
  return n;
}

// Agrega un documento { nombre, texto } o { nombre, pdfBase64 }.
// Devuelve un mensaje de error para el docente, o null si se agregó.
function agregarMaterial(estado, doc) {
  const r = resumenMaterial(estado.material);
  if (doc.pdfBase64) {
    if (r.pdfs >= LIMITES_TUTOR.pdfs) return 'Se pueden usar hasta ' + LIMITES_TUTOR.pdfs + ' PDF a la vez.';
    if (r.bytesPdf + bytesDeBase64(doc.pdfBase64) > LIMITES_TUTOR.bytesPdf) return 'Los PDF sumarían más de 5 MB. Quita alguno o usa uno más corto.';
    estado.material.push({ id: 'm' + (++estado.contador), nombre: nombreUnico(estado.material, doc.nombre), pdfBase64: doc.pdfBase64 });
    return null;
  }
  const texto = String(doc.texto || '');
  if (!texto.trim()) return 'El texto está vacío.';
  if (r.caracteres + texto.length > LIMITES_TUTOR.caracteres) {
    return 'El texto sumaría ' + (r.caracteres + texto.length).toLocaleString('es') + ' caracteres y el límite es ' + LIMITES_TUTOR.caracteres.toLocaleString('es') + '.';
  }
  estado.material.push({ id: 'm' + (++estado.contador), nombre: nombreUnico(estado.material, doc.nombre), texto });
  return null;
}

function quitarMaterial(estado, id) {
  estado.material = estado.material.filter(m => m.id !== id);
}

// Lo que se envía a POST /api/tutor. El historial lleva solo texto, rol y tipo:
// ni nombres ni datos del estudiante.
function cuerpoPregunta(estado, pregunta) {
  return {
    material: estado.material.map(m => (m.pdfBase64 ? { nombre: m.nombre, pdfBase64: m.pdfBase64 } : { nombre: m.nombre, texto: m.texto })),
    pregunta: String(pregunta).trim(),
    historial: estado.mensajes.filter(m => !m.error).map(m => ({ rol: m.rol, texto: m.texto, tipo: m.tipo || null })),
    reglas: { permitirEjemplo: false }
  };
}

function registrarIntercambio(estado, pregunta, r) {
  estado.mensajes.push({ rol: 'alumno', texto: String(pregunta).trim() });
  estado.mensajes.push({
    rol: 'tutor', texto: r.respuesta, tipo: r.tipo, fuentes: r.fuentes || [],
    cita: r.cita || '', citaEstado: r.citaEstado || null, bloqueada: !!r.bloqueada
  });
  if (typeof r.costoUSD === 'number') estado.costoUSD += r.costoUSD;
}

// Etiqueta visible del tipo de respuesta.
const ETIQUETA_TIPO = {
  sin_material: { texto: 'No está en el material', clase: 'e-aviso' },
  rechazo: { texto: 'Pista en lugar de la respuesta', clase: 'e-violeta' },
  pista: { texto: 'Pista', clase: 'e-violeta' },
  pregunta: { texto: 'Pregunta guía', clase: 'e-neutro' }
};

const TEXTO_CITA = {
  verificada: 'cita verificada en el material',
  no_verificable: 'cita de un PDF: compárala con el documento'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LIMITES_TUTOR, crearEstadoTutorReal, bytesDeBase64, resumenMaterial, agregarMaterial, quitarMaterial, cuerpoPregunta, registrarIntercambio, ETIQUETA_TIPO, TEXTO_CITA };
}
