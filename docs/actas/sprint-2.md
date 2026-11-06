# Acta del Sprint 2: revisión y retrospectiva

## Datos de la reunión

- Periodo del sprint: 26 de octubre al 5 de noviembre de 2026.
- Fecha: 5 de noviembre de 2026.
- Horario: por confirmar.
- Modalidad: por confirmar.
- Asistentes: Dilan, Juan y Samantha.
- Daniel no estuvo disponible para el cierre.

Las 22:08 corresponden a la fusión del PR #22, no a la hora de la reunión.

## Objetivo y alcance

Poner el calificador frente a docentes reales y terminar HU-08 y HU-12.

Se decidió que HU-01 a HU-05 pasan de Must a Should. Las 12 entrevistas y la
encuesta mostraron que la prioridad era reducir el tiempo de calificación.
El producto funciona con una clave única. Las historias Must del sprint son
HU-06, HU-07, HU-08 y HU-12, con 19 puntos.

## Historias terminadas

| Historia | Evidencia | Fecha de cierre o integración |
| --- | --- | --- |
| HU-06 y HU-07 | Issues #6 y #7, PR #16 | Cerradas el 26 de octubre de 2026 |
| HU-08, HU-12 y HU-09 | PR #22, aprobado por Dilan y fusionado por Juan | 5 de noviembre de 2026 |

Al cierre se reportaron 92 de 92 pruebas automáticas, frente a 70 en el Sprint 1.
Esta cifra corresponde al reporte del cierre del sprint.

## Historias no terminadas y motivos

HU-01 a HU-05 quedan como Should al priorizar la reducción del tiempo de
calificación. Se terminaron las historias Must del sprint.

## Demo realizada

Se probó con cinco docentes universitarios, identificados de forma anónima como
U1 a U5, sin publicar fotos.

- 0 de 5 completaron sin ayuda en menos de 15 minutos.
- Mediana de 10 minutos hasta ver la nota y de 20 minutos hasta aprobar.
- 0 errores observados.
- Cuatro de cinco confiarían en la nota con algunos cambios y uno revisaría cada hoja desde cero.

La métrica no se cumplió y el criterio de abandono no se activó.

## Retrospectiva

### Qué salió bien

- Se terminaron las historias Must.
- Se probó con cinco docentes reales.

### Qué salió mal

- Durante las pruebas, el PR del sprint todavía no se había fusionado y Render seguía desplegando desde `feat/modo-real`.
- No se cumplió la métrica de calificar y aprobar sin ayuda en menos de 15 minutos.
- Algunos docentes percibieron notas altas y la mediana hasta aprobar fue de 20 minutos.

### Mejoras propuestas para el Sprint 3

- Fusionar antes de probar.
- Ajustar el criterio de la IA.
- Agilizar la aprobación de notas.

## Acuerdos y seguimiento

El equipo acordó las tres mejoras anteriores para el Sprint 3. Al cierre todavía
no se habían aplicado cambios tras las pruebas.

## Tablero y evidencia del repositorio

Las issues #6 y #7 y el PR #16 respaldan HU-06 y HU-07, cerradas el 26 de
octubre. El PR #22 respalda HU-08, HU-12 y HU-09; fue aprobado por Dilan y
fusionado por Juan el 5 de noviembre a las 22:08.

## Burndown

Se partió de 19 puntos. Quedaron 6 el 26 de octubre y 0 el 5 de noviembre con
el PR #22. El archivo `docs/burndown-sprint-2.csv` registra una fila por fecha
del 26 de octubre al 5 de noviembre: 6 puntos hasta el 4 de noviembre y 0 al
cierre. Los 19 puntos iniciales preceden al primer saldo diario del CSV.

El gráfico `docs/burndown-sprint-2.png`, generado a partir del CSV, está listo
para insertarse en el Word.
