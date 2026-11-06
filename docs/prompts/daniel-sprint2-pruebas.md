# Prompt: Sprint 2, pruebas con usuarios y v0.3.0 (Control 3)

Autor: Daniel · Herramienta: Claude Code

```text
Trabajamos el Control 3 (vence hoy 23:59). Antes de empezar: git fetch origin y parte de origin/main (NUNCA subas mi main local ni feat/landing). Crea la rama feat/sprint2-pruebas. Cada commit lleva el trailer "Asistido-por-IA: Claude Code". Guarda los prompts usados en docs/prompts/ y actualiza USO_IA.md. Un commit por punto, en este orden:

1. HU-12: la pantalla pide aceptar el aviso de privacidad (casilla + enlace a https://danielgonzalezceli.github.io/ConectaEDU/privacidad.html) antes de calificar. El aviso dice que los trabajos y la rúbrica se envían al proveedor de IA solo para sugerir la nota y que el servidor no los guarda. Añade pruebas.
2. HU-08: el docente puede editar la nota sugerida por criterio y aprobar la nota final. La nota aprobada se distingue visualmente de la sugerida. Añade pruebas.
3. HU-09 solo si queda tiempo: exportar a CSV únicamente las notas aprobadas.
4. Crea docs/pruebas.md con el protocolo de la prueba y una tabla vacía para U1..U5 (tarea, ¿completó sin ayuda?, minutos, errores, comentarios, versión probada, cambio que provocó). La métrica es: "Sabremos que vamos bien si 4 de 5 docentes universitarios del segmento completan la calificación de un lote de 3 trabajos con rúbrica, sin ayuda del equipo, en menos de 15 minutos, en la sesión de prueba del 5 de noviembre." Criterio de abandono: menos de 3 de 5 completan sin ayuda, o la mayoría dice que tendría que revisar cada hoja desde cero. Anota que la métrica se definió el 5 de noviembre. Sin nombres ni datos personales.
5. Landing (docs/): agrega la sección de evidencia de las pruebas con marcadores claros [COMPLETAR] donde irán los números reales, y la sección del equipo con nombres de pila, rol y enlace al repositorio. Sin fotos de personas. Mantén el pie con la política de privacidad.
6. render.yaml: cambia la rama a main. Sube la versión a 0.3.0 en package.json. Crea docs/notas-v0.3.0.md con qué cambió y por qué.
7. Corre node --test y dime cuántas pasan. Busca secretos en el historial (sin imprimir valores).

No hagas push. Al terminar muéstrame git log --oneline de la rama y espera mi orden.
```
