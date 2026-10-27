/* ============================================================
   Errores con mensaje en español y código HTTP.
   Nunca incluyen la clave ni las cabeceras de la petición.
   ============================================================ */

const MENSAJES = {
  sin_clave: [503, 'El modo real no está activo: falta PROVEEDOR_IA_CLAVE en el archivo .env.'],
  clave_invalida: [502, 'El proveedor de IA rechazó la clave. Revisa PROVEEDOR_IA_CLAVE en el archivo .env.'],
  sin_permiso: [502, 'La clave no tiene permiso para usar este modelo.'],
  sin_credito: [402, 'La cuenta del proveedor de IA no tiene crédito suficiente. Recarga saldo y vuelve a intentar.'],
  modelo_no_encontrado: [502, 'El modelo configurado en PROVEEDOR_IA_MODELO no existe o no está disponible para esta clave.'],
  limite_proveedor: [429, 'El proveedor de IA está recibiendo demasiadas solicitudes. Espera un momento y vuelve a intentar.'],
  sobrecargado: [503, 'El proveedor de IA está sobrecargado en este momento. Vuelve a intentar en unos segundos.'],
  limite_ip: [429, 'Se hicieron demasiadas solicitudes desde esta conexión en la última hora. Espera unos minutos.'],
  limite_local: [429, 'Se alcanzó el límite de llamadas por hora configurado en LIMITE_LLAMADAS_POR_HORA.'],
  tiempo_agotado: [504, 'El modelo tardó más de 60 segundos en responder. Vuelve a intentar.'],
  red: [502, 'No se pudo conectar con el proveedor de IA. Revisa la conexión a internet.'],
  rechazo: [422, 'El modelo declinó procesar este contenido. Revisa el trabajo y vuelve a intentar, o califícalo a mano.'],
  respuesta_cortada: [502, 'La respuesta del modelo se cortó antes de terminar. Vuelve a intentar.'],
  respuesta_invalida: [502, 'La respuesta del modelo no tiene el formato esperado. Vuelve a intentar.'],
  solicitud_rechazada: [502, 'El proveedor de IA rechazó la solicitud.'],
  proveedor: [502, 'El proveedor de IA devolvió un error inesperado.'],
  entrada_invalida: [400, 'La solicitud no es válida.'],
  muy_grande: [413, 'La solicitud es demasiado grande.'],
  tipo_contenido: [415, 'La solicitud debe enviarse como JSON.'],
  no_encontrado: [404, 'Ruta no encontrada.'],
  interno: [500, 'Error interno del servidor.']
};

class ErrorIA extends Error {
  // `mensaje` reemplaza el texto por defecto; `detalle` agrega información segura.
  constructor(codigo, mensaje, detalle) {
    const base = MENSAJES[codigo] || MENSAJES.interno;
    super(mensaje || base[1]);
    this.name = 'ErrorIA';
    this.codigo = MENSAJES[codigo] ? codigo : 'interno';
    this.estadoHttp = base[0];
    if (detalle) this.detalle = String(detalle).slice(0, 300);
  }
}

// Quita la clave de cualquier texto, por si un mensaje externo la repitiera.
function sinClave(texto, clave) {
  let t = String(texto == null ? '' : texto);
  if (clave) t = t.split(clave).join('[oculta]');
  return t.replace(/sk-ant-[A-Za-z0-9_\-]+/g, '[oculta]');
}

// Forma pública de un error: { error: { codigo, mensaje, detalle? } }.
function cuerpoError(err, clave) {
  const e = err instanceof ErrorIA ? err : new ErrorIA('interno');
  const cuerpo = { codigo: e.codigo, mensaje: sinClave(e.message, clave) };
  if (e.detalle) cuerpo.detalle = sinClave(e.detalle, clave);
  return { estado: e.estadoHttp, cuerpo: { error: cuerpo } };
}

module.exports = { ErrorIA, sinClave, cuerpoError, MENSAJES };
