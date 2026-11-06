# Prompt de Juan: landing y evidencia del Sprint 2

Trabaja en el repositorio ConectaEDU. Revisa git status y ejecuta git fetch origin. Crea la rama feat/landing-evidencia desde origin/main. Si hay cambios locales o la rama ya existe, conserva el trabajo y avísame antes de sobrescribir archivos. Limita los cambios a lo indicado abajo.

1. Landing

En docs/index.html, dentro de la sección de evidencia, reemplaza los cinco marcadores <mark class="completar">[COMPLETAR]</mark> por texto normal, según la frase que los acompaña:

- Docentes que completaron la calificación sin ayuda en menos de 15 minutos: 0 de 5.
- Mediana para calificar y aprobar los 3 trabajos: 20 minutos.
- Docentes que dijeron que tendrían que revisar cada hoja desde cero: 1 de 5.
- Docentes que participaron en la sesión: 5.
- Cambios tras las pruebas: todavía no se aplicaron cambios. Algunos docentes percibieron notas altas y la mediana para aprobar fue de 20 minutos. Se prevé ajustar el criterio de la IA y agilizar la aprobación en el Sprint 3.

Elimina el comentario HTML «Reemplazar cada [COMPLETAR]...» y agrega debajo de las cifras esta cita anónima: «Es muy eficiente debido al tiempo que se ahorra, ayuda muy bien para reconocer lo que falta de revisar.» (U5).

Conserva la sección del equipo, el enlace al repositorio y el pie con la política de privacidad. Mantén anónimos a los docentes y evita publicar fotos. Si .completar quedó sin uso, elimina esa regla de docs/landing.css.

2. Burndown

Crea docs/burndown-sprint-2.csv con este contenido exacto, una fila por fecha:

fecha,puntos_pendientes
2026-10-26,6
2026-10-27,6
2026-10-28,6
2026-10-29,6
2026-10-30,6
2026-10-31,6
2026-11-01,6
2026-11-02,6
2026-11-03,6
2026-11-04,6
2026-11-05,0

Genera también docs/burndown-sprint-2.png a partir del CSV para insertarlo en el Word. Si no puedes generar la imagen con las herramientas disponibles, conserva el CSV y avísame.

3. Acta

Crea docs/actas/sprint-2.md con el formato de docs/actas/sprint-1.md y estos datos:

- Fecha: 5 de noviembre de 2026. Asistentes: Dilan, Juan y Samantha. Daniel no estuvo disponible para el cierre. Si el formato pide hora o medio de reunión, déjalos por confirmar. Las 22:08 corresponden a la fusión del PR #22.
- Objetivo: poner el calificador frente a docentes reales y terminar HU-08 y HU-12.
- Decisión: HU-01 a HU-05 pasan de Must a Should. Las 12 entrevistas y la encuesta mostraron que la prioridad era reducir el tiempo de calificación. El producto funciona con una clave única. Las historias Must del sprint son HU-06, HU-07, HU-08 y HU-12, con 19 puntos.
- Trabajo hecho: HU-06 y HU-07 (issues #6 y #7, PR #16, cerradas el 26 de octubre). HU-08, HU-12 y HU-09 (PR #22, aprobado por Dilan y fusionado por Juan el 5 de noviembre). Al cierre se reportaron 92 de 92 pruebas automáticas, frente a 70 en el Sprint 1.
- Burndown: se partió de 19 puntos. Quedaron 6 el 26 de octubre y 0 el 5 de noviembre con el PR #22. Referencia: docs/burndown-sprint-2.csv.
- Pruebas con 5 docentes universitarios (U1 a U5): 0 de 5 completaron sin ayuda en menos de 15 minutos; mediana de 10 minutos hasta ver la nota y de 20 hasta aprobar; 0 errores observados. Cuatro de cinco confiarían en la nota con algunos cambios y uno revisaría cada hoja desde cero. La métrica no se cumplió y el criterio de abandono no se activó.
- Retrospectiva: se terminaron las historias Must y se probó con cinco docentes reales. Durante las pruebas, el PR del sprint todavía no se había fusionado y Render seguía desplegando desde feat/modo-real. Para el Sprint 3, el equipo acordó fusionar antes de probar, ajustar el criterio de la IA y agilizar la aprobación de notas.

Cierre

Guarda este prompt en docs/prompts/juan-landing-evidencia.md. Corre node --test y reporta cuántas pruebas pasan realmente. Si alguna falla, detente y muéstrame el error antes de publicar. Revisa el diff y comprueba que no queden marcadores [COMPLETAR] en docs/index.html.

Haz el commit con el trailer exacto «Asistido-por-IA: Codex», sube la rama feat/landing-evidencia y abre el PR hacia main. Solicita revisión a Dilan (Dilanm2002). Déjame el enlace del PR para que yo haga la fusión después de su aprobación.
