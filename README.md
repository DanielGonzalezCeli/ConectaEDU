# ConectaEdu · Prototipo (Fase 0)

Asistente para docentes universitarios que califican solos: **califica con la rúbrica del docente** y **convierte su material en un tutor** que guía con pistas sin dar la respuesta.

> **Esto es un prototipo navegable con datos de ejemplo.** No hay ninguna IA conectada. Las cuentas, clases, notas, justificaciones, conversaciones del tutor y estudiantes son ficticios y fueron escritos a mano por el equipo. La página lo indica en un aviso visible.

Proyecto de la materia Emprendimiento Tecnológico, Ingeniería de Sistemas, PUCE.

## El problema

Los docentes universitarios de Ecuador que califican solos, sin ayudantes de cátedra, tareas o exámenes de grupos grandes, pierden horas semanales calificando uno por uno y no alcanzan a resolver las dudas de sus estudiantes fuera de clase. ConectaEdu propone dos funciones: un calificador que aplica la rúbrica del docente (el docente aprueba cada nota) y un tutor que guía con el material de la materia sin dar la respuesta final.

Lo que aprendimos en 12 entrevistas a docentes sigue siendo una hipótesis hasta validarla con encuestas: que paguen una suscripción y que quieran la función de tutor **no está validado todavía**.

## Equipo

Estudiantes de Ingeniería de Sistemas, PUCE (Emprendimiento Tecnológico, NRC 2667):

- Dilan Nicolás Mena Vera
- Elizabeth Samantha Nuñez Insuasti
- Juan Francisco Hoyos Renteira
- Daniel Hernán González Celi

## Tecnología

- **Prototipo actual:** HTML, CSS y JavaScript sin dependencias. Node 18 o superior solo para el servidor local y las pruebas.
- **Hacia el producto (Sprint 1 en adelante):** aplicación web con https en Cloudflare Pages y Workers, base de datos y acceso con Supabase (Postgres), y un proveedor de IA por API cuya clave vive solo en el servidor.

## Licencia y uso de inteligencia artificial

Código bajo licencia MIT (ver `LICENSE`). El uso de IA en el desarrollo está declarado en `USO_IA.md`.

## Cómo verlo

Funciona **sin internet y sin claves**. Elija una opción:

1. **Doble clic** en `index.html`. Se abre en el navegador sin instalar nada.
2. **Con Node** (recomendado para la demostración):
   ```bash
   npm start
   ```
   y abra http://localhost:8000
3. **Con Python**, si no hay Node:
   ```bash
   python -m http.server 8000
   ```

## Recorrido de la demostración

La página simula el producto completo con dos roles. Todo vive en memoria: al recargar, la demostración vuelve a empezar. También se puede reiniciar desde el menú del usuario.

**Docente**
1. **Iniciar sesión** como docente (la cuenta de ejemplo ya está escrita).
2. **Mis clases**: pendientes calculados a partir de las clases y una tarjeta por clase.
3. **Crear clase** en 3 pasos: datos, reglas del tutor y código de invitación.
4. **Dentro de la clase** (menú lateral):
   - *Resumen*: métricas y primeros pasos.
   - *Material del tutor*: arrastrar documentos (no se leen ni se envían; solo se muestra el nombre) y reglas del tutor.
   - *Tareas y calificación*: crear una tarea con su rúbrica, subir trabajos, calificar (simulado), revisar, aprobar y exportar CSV solo con notas aprobadas.
   - *Actividad del tutor*: la conversación en vivo del estudiante de la demo y un curso ficticio.
   - *Estudiantes*: lista y código de la clase.

**Estudiante**
5. Iniciar sesión como estudiante, **unirse con el código** `ESTAD-7K2` y usar el **tutor** de Fundamentos de Estadística.

Desde el menú del usuario (círculo con iniciales) se cambia entre la vista de docente y la de estudiante sin perder lo hecho. Así se muestra el ciclo completo en la defensa.

**Límites del prototipo:** el tutor simulado solo existe en «Fundamentos de Estadística» (un problema de 5 pasos), y la calificación simulada solo existe para la rúbrica de ejemplo (ensayo sobre 10). La página lo indica donde corresponde.

## Pruebas

```bash
npm test
```

Usa el ejecutor de pruebas incluido en Node 18 o superior; no hay dependencias que instalar. Prueban la lógica del tutor simulado (avance por pasos, escalera de pistas, cuatro formas de intentar sacar la respuesta y la regla del docente sobre ejemplos resueltos) y el cálculo de notas (límites por criterio, aprobación del docente, CSV solo con notas aprobadas).

## Estructura

```
index.html                Marco mínimo: aviso de prototipo y contenedor de la aplicación
css/estilos.css           Estilos (azul PUCE con acentos de color; sin fuentes externas)
js/datos.js               TODOS los datos de ejemplo
js/logica-calificador.js  Cálculo de notas y aprobación (sin interfaz, se prueba con Node)
js/logica-tutor.js        Reglas del tutor simulado (sin interfaz, se prueba con Node)
js/iconos.js              Íconos SVG
js/base.js                Estado de la demostración y utilidades
js/vistas/acceso.js       Inicio de sesión
js/vistas/docente.js      Mis clases y crear clase
js/vistas/clase.js        Resumen, material, actividad y estudiantes de una clase
js/vistas/tareas.js       Tareas, rúbrica, calificación y aprobación
js/vistas/estudiante.js   Unirse a una clase y chat del tutor
js/app.js                 Enrutador (direcciones #/...) y marco de la página
tests/                    Pruebas automáticas
servidor.js               Servidor local mínimo (solo Node, sin dependencias)
```

Los scripts son clásicos (no módulos) a propósito: así la página también funciona abriéndola con doble clic.

## Qué falta (fases siguientes)

- **Fase 1 · Tutor real:** modelo de lenguaje con recuperación sobre el material del docente, un revisor que bloquee filtraciones y pruebas de los cinco ataques, incluido dividir el problema en pedazos.
- **Fase 2 · Calificador real:** salidas estructuradas y comparación medida contra notas del docente.
- **Fase 3 · Producto:** cuentas reales, carga de material, historial persistente y costo por estudiante.

## Reglas del proyecto

- Lo simulado se ve como simulado. No se presentan métricas ni precisión que no se hayan medido.
- Ninguna clave de API va en el código: se usará `.env`, que ya está en `.gitignore`.
- Ley Orgánica de Protección de Datos Personales (Ecuador): datos de ejemplo ficticios; no se guardan datos de estudiantes sin necesidad ni se usan para entrenar modelos.
- Ninguna nota sale del sistema sin aprobación del docente.
