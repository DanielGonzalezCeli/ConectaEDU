// Pruebas del lector de .env y de la configuración del servidor.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parsearEnv, cargarEnv, leerConfig } = require('../servidor/entorno');

test('lector de .env: ignora comentarios y líneas vacías, quita comillas y respeta "=" en el valor', () => {
  const datos = parsearEnv('﻿# comentario\r\n\r\nA=1\r\n  B = dos palabras  \nC="con comillas"\nD=\'simples\'\nE=a=b=c\nF=\nlinea sin igual\n');
  assert.deepEqual(datos, { A: '1', B: 'dos palabras', C: 'con comillas', D: 'simples', E: 'a=b=c', F: '' });
});

test('lector de .env: no pisa variables que ya existen en el entorno', () => {
  const ruta = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'conectaedu-')), '.env');
  fs.writeFileSync(ruta, 'PROVEEDOR_IA_MODELO=desde-archivo\nLIMITE_LLAMADAS_POR_HORA=5\n');
  const env = { PROVEEDOR_IA_MODELO: 'desde-entorno' };
  assert.equal(cargarEnv(ruta, env), true);
  assert.equal(env.PROVEEDOR_IA_MODELO, 'desde-entorno');
  assert.equal(env.LIMITE_LLAMADAS_POR_HORA, '5');
  assert.equal(cargarEnv(path.join(path.dirname(ruta), 'no-existe'), env), false);
});

test('sin clave el modo es simulado y se usan los valores por defecto', () => {
  const c = leerConfig({});
  assert.equal(c.modoIA, 'simulado');
  assert.equal(c.clave, '');
  assert.equal(c.modelo, 'claude-sonnet-5-5');
  assert.equal(c.limite, 60);
  assert.deepEqual(c.esfuerzo, { calificar: 'medium', tutor: 'low', revisor: 'low' });
  assert.equal(leerConfig({ PROVEEDOR_IA_CLAVE: '   ' }).modoIA, 'simulado');
});

test('con clave el modo es real; el esfuerzo se configura y un valor inválido vuelve al de por defecto', () => {
  const c = leerConfig({ PROVEEDOR_IA_CLAVE: 'x', LIMITE_LLAMADAS_POR_HORA: '10', ESFUERZO_CALIFICAR: 'HIGH', ESFUERZO_REVISOR: 'muchisimo' });
  assert.equal(c.modoIA, 'real');
  assert.equal(c.limite, 10);
  assert.deepEqual(c.esfuerzo, { calificar: 'high', tutor: 'low', revisor: 'low' });
  assert.equal(leerConfig({ LIMITE_LLAMADAS_POR_HORA: 'abc' }).limite, 60);
});
