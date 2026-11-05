# ConectaEdu v0.3.0 · Sprint 2: listo para la prueba con docentes

Versión preparada para la sesión de prueba del 5 de noviembre de 2026. El objetivo del sprint fue que un docente pueda calificar un lote, decidir cada nota y exportar solo lo aprobado, sin ayuda del equipo, y tener un protocolo para medirlo.

## Qué cambió y por qué

### HU-12 · Aviso de privacidad antes de calificar
- **Qué:** antes del primer envío a la IA aparece un aviso con casilla y enlace a la [política de privacidad](https://danielgonzalezceli.github.io/ConectaEDU/privacidad.html). Dice que los trabajos y la rúbrica se envían al proveedor de IA solo para sugerir la nota y que el servidor no los guarda. Sin marcar la casilla no se continúa. Se registra en memoria qué versión del aviso se aceptó y cuándo.
- **Además:** aunque una pantalla olvide pedir el aviso, el navegador no envía ningún trabajo sin aceptarlo (segundo candado en `pedirCalificacion`).
- **Por qué:** quien prueba la herramienta debe saber, antes de usarla, a dónde van los trabajos. Es una historia Must del backlog.

### HU-08 · La nota aprobada se distingue de la sugerida
- **Qué:** la tabla muestra por separado la nota **sugerida por la IA** y la **nota final**. Cada nota tiene uno de tres estados: *sugerida, sin aprobar* (gris), *editada, falta aprobar* (ámbar) y *aprobada* (verde, con marca y borde en la fila). En la revisión, cada criterio muestra lo que sugirió la IA y se resalta el campo que el docente cambió. Si se edita una nota aprobada, vuelve a quedar sin aprobar.
- **Por qué:** la historia HU-08 (Must) exige que ninguna nota salga sin la decisión del docente, y el docente tiene que ver de un vistazo cuáles ya decidió. Antes, la nota aprobada solo se diferenciaba por una etiqueta pequeña.

### HU-09 · CSV con solo las notas aprobadas, sin romperse
- **Qué:** el CSV sigue exportando solo las notas aprobadas, y ahora:
  - pone entre comillas los valores con comas, comillas o saltos de línea;
  - antepone un apóstrofo a los textos que Excel leería como fórmula;
  - redondea la nota a dos decimales;
  - incluye la marca BOM para que Excel muestre las tildes.
- **Por qué:** el docente puede nombrar un trabajo «Trabajo 1, grupo A», y eso desplazaba las columnas.

### Prueba con usuarios
- **Qué:** `docs/pruebas.md` con la métrica, el criterio de abandono, el protocolo y la tabla de registro para U1 a U5, sin datos personales.
- **Por qué:** para decidir con datos si el calificador se entiende y se usa sin ayuda.

### Landing
- **Qué:** sección de evidencia de las pruebas, con marcadores `[COMPLETAR]` hasta tener los números reales, y sección del equipo con nombres de pila y roles. El pie conserva el enlace a la política de privacidad.
- **Por qué:** mostrar resultados medidos, no promesas, y quién responde por el proyecto.

### Despliegue y versión
- **Qué:** `render.yaml` despliega desde `main` en lugar de `feat/modo-real`. La versión en `package.json` pasa a 0.3.0.
- **Por qué:** `feat/modo-real` ya se fusionó en `main`, así que lo publicado debe salir de la rama principal. Además, `package.json` seguía en 0.1.0 aunque ya existía la etiqueta `v0.2.0`.
- **Pendiente manual:** Render toma `render.yaml` de la rama a la que está vinculado el Blueprint. Hay que cambiar esa rama a `main` en el panel de Render.

## Pruebas automáticas

92 pruebas con `node --test` (eran 70): 9 de privacidad, 7 de HU-08 y 6 de HU-09. No llaman a la IA real ni gastan dinero.

## Lo que todavía no está

- Los resultados de la prueba con docentes: se completan en `docs/pruebas.md` y en la landing.
- La coincidencia de la IA con notas de docentes en tareas reales.
- El tutor real en la interfaz, cuentas de usuario y guardar el historial entre sesiones.
