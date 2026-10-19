/* ============================================================
   Configuración del servidor leída de .env (sin la librería dotenv).
   La clave solo vive aquí, en memoria del proceso de Node.
   ============================================================ */
const fs = require('node:fs');

// Convierte el texto de un .env en un objeto. Ignora comentarios y líneas vacías.
function parsearEnv(texto) {
  const datos = {};
  String(texto).replace(/^﻿/, '').split(/\r?\n/).forEach(linea => {
    const l = linea.trim();
    if (!l || l.startsWith('#')) return;
    const i = l.indexOf('=');
    if (i <= 0) return;
    const nombre = l.slice(0, i).trim();
    let valor = l.slice(i + 1).trim();
    if (valor.length >= 2 && (valor[0] === '"' || valor[0] === "'") && valor[valor.length - 1] === valor[0]) valor = valor.slice(1, -1);
    datos[nombre] = valor;
  });
  return datos;
}

// Carga el .env en `env` sin pisar variables que ya existan en el entorno.
function cargarEnv(ruta, env = process.env) {
  let texto;
  try { texto = fs.readFileSync(ruta, 'utf8'); } catch (e) { return false; }
  const datos = parsearEnv(texto);
  Object.keys(datos).forEach(k => { if (env[k] === undefined) env[k] = datos[k]; });
  return true;
}

const ESFUERZOS = ['low', 'medium', 'high', 'xhigh', 'max'];
const MODELO_POR_DEFECTO = 'claude-sonnet-5-5';

function esfuerzo(valor, porDefecto) {
  const v = String(valor || '').trim().toLowerCase();
  return ESFUERZOS.includes(v) ? v : porDefecto;
}

// Configuración que usa el resto del servidor. Sin clave, el modo es simulado.
function leerConfig(env = process.env) {
  const clave = String(env.PROVEEDOR_IA_CLAVE || '').trim();
  const limite = parseInt(env.LIMITE_LLAMADAS_POR_HORA, 10);
  return {
    clave,
    modoIA: clave ? 'real' : 'simulado',
    modelo: String(env.PROVEEDOR_IA_MODELO || '').trim() || MODELO_POR_DEFECTO,
    limite: limite > 0 ? limite : 60,
    esfuerzo: {
      calificar: esfuerzo(env.ESFUERZO_CALIFICAR, 'medium'),
      tutor: esfuerzo(env.ESFUERZO_TUTOR, 'low'),
      revisor: esfuerzo(env.ESFUERZO_REVISOR, 'low')
    }
  };
}

module.exports = { parsearEnv, cargarEnv, leerConfig, ESFUERZOS, MODELO_POR_DEFECTO };
