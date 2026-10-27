# Acta del Sprint 1: revisión y retrospectiva

Estado: borrador; completar y validar con el equipo antes de integrar a main.

## Datos de la reunión

- Periodo del sprint: 19 al 25 de octubre de 2026.
- Fecha y hora de la revisión y retrospectiva: [COMPLETAR]. Referencia tentativa indicada por Juan: noche del 25/10/2026, aproximadamente dos horas; fecha exacta y horas de inicio y fin por confirmar.
- Modalidad: [COMPLETAR].
- Asistentes indicados por Juan: Dilan Mena, Samantha Nuñez, Daniel Gonzalez y Juan Hoyos.
- Confirmación de que la reunión se realizó: [COMPLETAR].

## Fuentes y límites de la evidencia

- Estado del tablero comunicado por el equipo y proporcionado por Juan: actualizado el 26/10/2026, con fecha de terminado del 19/10/2026 para HU-06, HU-07 y HU-11.
- Captura del tablero proporcionada por Juan, titulada en la interfaz «ConectaEdu - Sprint 0»: Backlog (5), Sprint (4), En curso (0), Revisión (0) y Hecho (3). En Sprint figuran HU-01, HU-02, HU-03 y HU-12; en Hecho figuran HU-06, HU-07 y HU-11. Coincide con el estado comunicado para el Sprint 1, aunque el nombre del proyecto conserva «Sprint 0». La imagen no muestra fechas de cierre ni fecha de captura; no permite acreditar esos datos.
- Puntos y criterios de las historias: `docs/historias.md`.
- Historial de `main` consultado al preparar esta acta: no muestra commits fechados del 19 al 25 de octubre. No permite verificar por sí solo la fecha de cierre declarada en el tablero.
- El 26/10/2026 se integraron el PR #16 (modo real, `ccaaf98`), el PR #17 (landing y privacidad, `28aeaf8`) y el PR #18 (uso de IA para Control 2, `b7ab387`). Son integraciones posteriores al periodo del sprint; no se presentan como integraciones realizadas del 19 al 25.
- Las conclusiones de la retrospectiva requieren confirmación del equipo; no se deducen automáticamente de los commits.

## Objetivo y cambio de alcance

Al inicio se comprometieron HU-01, HU-02, HU-03 y HU-12: 19 puntos.
Durante el sprint el equipo cambió de prioridad e incorporó desde el Backlog
HU-06, HU-07 y HU-11: 18 puntos, para entregar el calificador con IA.
La fecha exacta de incorporación y el acuerdo que autorizó el cambio: [COMPLETAR].
Síntesis del alcance original, no cita de un acuerdo: habilitar el ingreso del
docente, crear clases con invitación, cargar material y aceptar el aviso de
privacidad. La formulación acordada del objetivo original: [COMPLETAR].

Alcance total: 19 + 18 = 37 puntos. Terminados según el tablero: 18 puntos.
Pendientes al cierre: 19 puntos. Las historias terminadas corresponden al alcance
incorporado; no se declara completado el compromiso original.

## Historias terminadas

Estado y fechas según el tablero comunicado por el equipo:

| Historia | Entrega | Puntos | Fecha de terminado |
| --- | --- | --- | --- |
| HU-06 | Carga de rúbrica y trabajos para calificación | 5 | 19/10/2026 |
| HU-07 | Nota sugerida por criterio, justificación y confianza | 8 | 19/10/2026 |
| HU-11 | Comparación de la nota sugerida con la del docente | 5 | 19/10/2026 |
| Total | | 18 | |

La demostración de una tarea no demuestra por sí sola todos los criterios de
aceptación, como la carga de un lote. Evidencia de validación de todos los
criterios de estas historias: [COMPLETAR].

## Historias no terminadas y motivos

| Historia | Puntos | Situación y motivo conocido |
| --- | --- | --- |
| HU-01 | 5 | La aplicación usa una clave de acceso única; no implementa el inicio de sesión con correo solicitado. Motivo de no completar: [COMPLETAR]. |
| HU-02 | 3 | No terminada según el tablero. Motivo: [COMPLETAR]. |
| HU-03 | 8 | No terminada según el tablero. Motivo: [COMPLETAR]. |
| HU-12 | 3 | La aplicación todavía no exige aceptar el aviso de privacidad. Motivo de no completar: [COMPLETAR]. |
| Total | 19 | |

## Demo realizada

Según la información proporcionada por el equipo, en el pitch del 19 de octubre
se mostró en vivo el calificador con IA: una tarea real calificada con la rúbrica
y comparada con la nota del docente. No se atribuyen asistentes a la revisión
ni resultados de precisión que no hayan sido proporcionados.

## Retrospectiva

Observaciones basadas en los datos disponibles, pendientes de validación como
conclusiones de la reunión:

- Resultado positivo: se reportó una demo en vivo del calificador con IA, aplicando una rúbrica y comparando con la nota del docente; el tablero muestra tres historias en Hecho, equivalentes a 18 puntos.
- Desviación del plan: las cuatro historias comprometidas inicialmente siguen sin terminar; el alcance aumentó de 19 a 37 puntos por el cambio de prioridad informado.
- Límite del seguimiento: el tablero se actualizó el 26/10 y las integraciones identificadas son posteriores al cierre del sprint. La captura no conserva el avance diario.

Propuestas para el Sprint 2, todavía no acuerdos del equipo:

- Revisar y priorizar las cuatro historias pendientes antes de comprometer un nuevo alcance.
- Registrar cada cambio de alcance con su fecha, motivo y efecto en los puntos.
- Actualizar el tablero durante el sprint y conservar evidencias de cierre.
- Verificar los criterios de aceptación antes de mover una historia a Hecho.
- Asignar responsables y fechas a las acciones aprobadas.

Valoración de los participantes y aprobación de estas propuestas: [COMPLETAR].

## Acuerdos

Acuerdos de la revisión y retrospectiva, con responsables y fechas: [COMPLETAR].
No se considera acordado automáticamente trasladar las historias pendientes al Sprint 2.

## Interpretación del burndown

`docs/burndown-sprint-1.csv` registra puntos restantes al cierre de cada día,
del 19 al 25. La base inicial planeada fue 19; el alcance total tras las
incorporaciones fue 37. Las tres historias incorporadas suman 18 y tienen
fecha de terminado del 19/10 según el tablero: 37 - 18 = 19 pendientes.
No se comunicaron otros cierres: el valor al cierre de los siete días es 19.

La fecha y hora de incorporación no están confirmadas, por lo que el CSV no
reconstruye el aumento de alcance dentro del día ni inventa una caída del
compromiso original de 19 a 1. La serie es una reconstrucción retrospectiva
basada en el tablero actualizado el 26/10, no una captura diaria histórica.

## Pendientes antes de integrar

- [COMPLETAR] Confirmar que se realizó la reunión, validar la referencia tentativa al 25/10 por la noche, registrar horas y modalidad, y ratificar los asistentes indicados por Juan.
- [COMPLETAR] Confirmar el objetivo original y la fecha y acuerdo del cambio de alcance.
- [COMPLETAR] Adjuntar evidencia de aceptación de HU-06, HU-07 y HU-11.
- [COMPLETAR] Registrar los motivos de no completar HU-01, HU-02, HU-03 y HU-12.
- [COMPLETAR] Validar las observaciones y propuestas de retrospectiva con los participantes.
- [COMPLETAR] Registrar acuerdos, responsables y fechas.
- [COMPLETAR] Incorporar al PDF de evidencias la captura proporcionada por Juan, con título «Estado del tablero informado para el Sprint 1; actualizado el 26/10/2026» y fecha real de captura por confirmar. Explicar que el nombre visible del proyecto conserva «Sprint 0»; no presentarla como captura tomada al cierre del 25/10.

