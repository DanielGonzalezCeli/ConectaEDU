/* ---------- Tutor real con el material del docente ----------
   Una sola pantalla para la demostración: a la izquierda el docente pega o
   sube su material; a la derecha el estudiante pregunta. Sin cuentas ni
   clases: todo vive en esta pestaña y se borra al recargar. */

function vistaTutorReal() {
  const st = APP.tutorReal;
  const real = modoReal();
  const r = resumenMaterial(st.material);
  const listaMaterial = st.material.length
    ? '<ul class="archivos">' + st.material.map(m => '<li class="archivo">' + iconoArchivo(m.pdfBase64 ? 'PDF' : 'Texto') +
        '<div class="datos"><b title="' + esc(m.nombre) + '">' + esc(m.nombre) + '</b><span>' +
        (m.pdfBase64 ? 'PDF · ' + tamanoLegible(bytesDeBase64(m.pdfBase64)) : m.texto.length.toLocaleString('es') + ' caracteres') + '</span></div>' +
        '<button class="quitar" data-quitar="' + m.id + '" title="Quitar">' + icono('basura') + '</button></li>').join('') + '</ul>' +
      '<p class="nota resumen-material">' + r.documentos + (r.documentos === 1 ? ' documento' : ' documentos') + ' · ' +
        r.caracteres.toLocaleString('es') + ' de ' + LIMITES_TUTOR.caracteres.toLocaleString('es') + ' caracteres de texto · ' +
        tamanoLegible(r.bytesPdf) + (r.bytesPdf ? '' : '0 MB') + ' de 5 MB en PDF</p>'
    : '<p class="nota" style="margin-top:12px">Todavía no hay material. El tutor solo responde con lo que agregues aquí.</p>';

  const ejemplos = [
    ['¿De qué trata el material?', ''],
    ['Resuélveme este ejercicio, por favor', 'trampa'],
    ['¿Quién ganó el último mundial de fútbol?', 'trampa']
  ];

  return {
    html:
      '<div class="encabezado"><div><div class="miga"><a href="#' + inicioDelRol() + '">Inicio</a> / Tutor con tu material</div>' +
        '<h1>Tutor con tu material</h1><p>El tutor responde solo con el material del docente, dice de dónde sale cada respuesta y guía con pistas.</p></div>' +
        (real ? '<span class="etiqueta e-ok">IA real · ' + esc(IA.modelo || '') + '</span>' : '<span class="etiqueta e-sim">prototipo · sin IA conectada</span>') + '</div>' +
      infoSim('<b>Nada se guarda.</b> El material y la conversación viven solo en esta pestaña y se borran al recargar. Con cada pregunta, el material y la conversación se envían al proveedor de IA (Anthropic) solo para responder; el servidor no los guarda.') +
      '<div class="dos tutor-real">' +
        '<div class="tarjeta"><h2>' + icono('libro') + '1. Material del docente</h2><p class="nota">Pega texto o sube archivos .txt, .md o PDF (hasta 5 MB). Usa material sin datos personales.</p>' +
          '<div class="zona-subida" id="zona"><div class="grande-ico">' + icono('subir') + '</div><b>Arrastra tus archivos aquí</b>o haz clic para elegirlos</div>' +
          '<input type="file" id="archivo" multiple accept=".txt,.md,.pdf" class="oculto">' +
          '<div class="campo" style="margin-top:14px"><label for="m-texto">O pega el texto</label><textarea id="m-texto" rows="5" placeholder="Pega aquí una guía, apuntes o ejercicios"></textarea></div>' +
          '<div class="fila"><input type="text" id="m-nombre" placeholder="Nombre del documento (ej.: Guía unidad 3)" style="flex:1;min-width:180px"><button class="btn sec" id="m-agregar">' + icono('mas') + 'Agregar texto</button></div>' +
          listaMaterial +
        '</div>' +
        '<div class="tarjeta chat-tarjeta"><h2>' + icono('chat') + '2. Chat del estudiante</h2>' +
          (real
            ? '<p class="nota">No escribas tu nombre ni datos personales.</p>'
            : '<p class="nota"><b>Prototipo:</b> el tutor real necesita el servidor con la clave de IA (<code>npm start</code> con <code>.env</code>, o la versión publicada).</p>') +
          '<div class="chat" id="chat" aria-live="polite"></div>' +
          '<form class="entrada" id="form-chat"><input type="text" id="entrada-texto" maxlength="' + LIMITES_TUTOR.pregunta + '" placeholder="Escribe tu pregunta…" autocomplete="off"' + (real ? '' : ' disabled') + '>' +
            '<button class="btn" type="submit"' + (real ? '' : ' disabled') + '>' + icono('enviar') + 'Enviar</button></form>' +
          '<div class="atajos">' + ejemplos.map(([t, c]) => '<button class="' + c + '" data-texto="' + esc(t) + '"' + (real ? '' : ' disabled') + '>' + esc(t) + '</button>').join('') + '</div>' +
          '<div class="fila" style="margin-top:10px"><span class="nota" id="costo-chat" style="margin:0"></span><span class="espacio"></span>' +
            '<button class="btn fantasma chico" id="nueva-conversacion">Nueva conversación</button></div>' +
        '</div>' +
      '</div>',
    enlazar(raiz) {
      const $ = s => raiz.querySelector(s);
      const chat = $('#chat');

      /* --- Material --- */
      const agregar = doc => { const error = agregarMaterial(st, doc); if (error) { toast(error); return false; } return true; };
      enlazarZonaSubida($('#zona'), $('#archivo'), async archivos => {
        let agregados = 0;
        for (const f of archivos) {
          try { if (agregar(Object.assign({ nombre: f.name }, await leerTrabajo(f)))) agregados++; }
          catch (e) { toast(e.message); }
        }
        if (agregados) { toast(agregados === 1 ? 'Material agregado' : agregados + ' documentos agregados'); render(); }
      });
      $('#m-agregar').addEventListener('click', () => {
        const nombre = $('#m-nombre').value.trim() || 'Texto pegado';
        if (agregar({ nombre, texto: $('#m-texto').value })) { toast('Material agregado'); render(); }
      });
      raiz.querySelectorAll('[data-quitar]').forEach(b => b.addEventListener('click', () => { quitarMaterial(st, b.dataset.quitar); render(); }));

      /* --- Chat --- */
      const pintar = m => {
        const d = document.createElement('div');
        d.className = 'msg ' + (m.error ? 'tutor error' : m.rol === 'tutor' ? 'tutor' : 'alumno');
        if (m.rol === 'tutor' && !m.error && ETIQUETA_TIPO[m.tipo]) {
          const e = document.createElement('span');
          e.className = 'etiqueta ' + ETIQUETA_TIPO[m.tipo].clase + ' tipo-respuesta';
          e.textContent = ETIQUETA_TIPO[m.tipo].texto;
          d.appendChild(e);
        }
        d.appendChild(document.createTextNode(m.texto));
        if (m.cita) {
          const c = document.createElement('blockquote');
          c.className = 'cita-tutor';
          c.textContent = '“' + m.cita + '”';
          const est = document.createElement('span');
          est.textContent = TEXTO_CITA[m.citaEstado] || '';
          c.appendChild(est);
          d.appendChild(c);
        } else if (m.citaEstado === 'no_verificada') {
          const c = document.createElement('span');
          c.className = 'fuente aviso-cita';
          c.textContent = 'No se pudo verificar una cita en el material.';
          d.appendChild(c);
        }
        if (m.fuentes && m.fuentes.length) {
          const f = document.createElement('span');
          f.className = 'fuente';
          f.innerHTML = icono('libro');
          f.append('Fuente: ' + m.fuentes.join(', '));
          d.appendChild(f);
        }
        chat.appendChild(d);
        chat.scrollTop = chat.scrollHeight;
      };
      const pintarCosto = () => {
        const n = st.mensajes.filter(m => m.rol === 'tutor' && !m.error).length;
        $('#costo-chat').textContent = n ? 'Costo medido de esta conversación: US$ ' + st.costoUSD.toFixed(4).replace('.', ',') + ' (' + n + (n === 1 ? ' respuesta)' : ' respuestas)') : '';
      };
      if (!st.mensajes.length) {
        const d = document.createElement('div');
        d.className = 'escribiendo';
        d.textContent = st.material.length ? 'Escribe una pregunta sobre el material.' : 'Primero agrega material a la izquierda.';
        chat.appendChild(d);
      }
      st.mensajes.forEach(pintar);
      pintarCosto();

      let ocupado = false;
      const enviar = async texto => {
        texto = String(texto || '').trim();
        if (!texto || ocupado || !real) return;
        if (!st.material.length) { toast('Primero agrega material del docente.'); return; }
        ocupado = true;
        const vacio_ = chat.querySelector('.escribiendo'); if (vacio_) vacio_.remove();
        pintar({ rol: 'alumno', texto });
        const aviso = document.createElement('div'); aviso.className = 'escribiendo'; aviso.textContent = 'El tutor está revisando el material…';
        chat.appendChild(aviso); chat.scrollTop = chat.scrollHeight;
        try {
          const r = await pedirTutor(cuerpoPregunta(st, texto));
          registrarIntercambio(st, texto, r);
          aviso.remove();
          pintar(st.mensajes[st.mensajes.length - 1]);
          pintarCosto();
        } catch (e) {
          aviso.remove();
          // La pregunta fallida no entra al historial: se puede volver a enviar.
          chat.lastElementChild && chat.lastElementChild.remove();
          pintar({ rol: 'tutor', error: true, texto: 'No se pudo responder: ' + e.message });
          $('#entrada-texto').value = texto;
        } finally {
          ocupado = false;
        }
      };
      const input = $('#entrada-texto');
      $('#form-chat').addEventListener('submit', ev => { ev.preventDefault(); const t = input.value; input.value = ''; enviar(t); });
      raiz.querySelectorAll('.atajos button').forEach(b => b.addEventListener('click', () => enviar(b.dataset.texto)));
      $('#nueva-conversacion').addEventListener('click', () => { st.mensajes = []; st.costoUSD = 0; render(); });
    }
  };
}
