# Acta del Sprint 1: revisión y retrospectiva

## Datos de la reunión

- Periodo del sprint: 19 al 25 de octubre de 2026.
- Fecha: 25 de octubre de 2026.
- Horario: 20:00 a 22:00, hora de Ecuador.
- Modalidad: virtual, por Microsoft Teams.
- Asistentes: Dilan Mena, Samantha Nuñez, Daniel Gonzalez y Juan Hoyos.

## Objetivo y alcance

Al inicio del sprint nos comprometimos con HU-01, HU-02, HU-03 y HU-12,
que sumaban 19 puntos: ingreso con correo, creación de clases con invitación,
carga del material de la materia y aceptación del aviso de privacidad.

Durante el sprint cambiamos la prioridad para entregar el calificador con IA
e incorporamos HU-06, HU-07 y HU-11 desde el Backlog, por 18 puntos adicionales.
El alcance total fue de 37 puntos: terminamos 18 y quedaron pendientes 19.
No completamos el compromiso inicial; lo entregado corresponde al alcance añadido.

## Historias terminadas

| Historia | Resultado | Puntos | Fecha de terminado reportada |
| --- | --- | --- | --- |
| HU-06 | Cargar rúbrica y lote de trabajos | 5 | 19/10/2026 |
| HU-07 | Nota sugerida con justificación y confianza | 8 | 19/10/2026 |
| HU-11 | Comparar nota sugerida con la del docente | 5 | 19/10/2026 |
| Total | | 18 | |

Las tres historias figuran en Hecho en el tablero actualizado el 26/10/2026.
Las fechas de terminado corresponden al reporte del equipo, no a la fecha de
integración de los cambios en GitHub.

## Historias no terminadas y motivos

El cambio de prioridad hacia el calificador con IA desplazó las cuatro historias
planeadas al inicio. El tablero las mantiene en la columna Sprint:

| Historia | Puntos | Situación al cierre |
| --- | --- | --- |
| HU-01: iniciar sesión con correo | 5 | Se priorizó el calificador. La aplicación usa una clave de acceso única y no el ingreso con correo previsto. |
| HU-02: crear clase con código de invitación | 3 | Quedó pendiente al priorizar las historias del calificador; no figura en Hecho. |
| HU-03: subir material de la materia | 8 | Quedó pendiente al priorizar las historias del calificador; no figura en Hecho. |
| HU-12: aceptar el aviso de privacidad | 3 | Se priorizó el calificador. La aplicación todavía no exige aceptar el aviso antes de continuar. |
| Total | 19 | |

## Demo realizada

En el pitch del 19 de octubre mostramos una demo en vivo del calificador con IA:
una tarea real calificada con la rúbrica y comparada con la nota del docente.
Esta demostración corresponde al trabajo entregado del calificador.

## Retrospectiva

### Qué salió bien

- Mostramos el calificador con IA funcionando sobre una tarea real.
- La comparación con la nota del docente permitió presentar el resultado de la herramienta con una referencia concreta.
- El tablero registra tres historias terminadas, equivalentes a 18 puntos.

### Qué salió mal

- Las cuatro historias del compromiso inicial quedaron pendientes.
- El cambio de prioridad elevó el alcance de 19 a 37 puntos, sin completar los 19 puntos originales.
- La actualización del tablero se realizó el 26 de octubre, después del cierre del sprint; la captura no conserva el avance diario.

### Mejoras propuestas para el Sprint 2

- Priorizar las cuatro historias pendientes antes de asumir nuevo alcance.
- Registrar los cambios de prioridad y su efecto en los puntos durante el sprint.
- Actualizar el tablero al completar cada historia.
- Revisar los criterios de aceptación y conservar evidencia antes de pasar una historia a Hecho.

## Acuerdos y seguimiento

Las mejoras anteriores quedan como propuestas para la planificación del Sprint 2.
No se cuenta con un registro confirmado de su aprobación, responsables o fechas;
por tanto, esta acta no les atribuye acuerdos adicionales a los participantes.

## Tablero y evidencia del repositorio

La captura del tablero muestra Backlog: 5; Sprint: 4; En curso: 0;
Revisión: 0; Hecho: 3. En Sprint están HU-01, HU-02, HU-03 y HU-12;
en Hecho están HU-06, HU-07 y HU-11. El nombre visible del proyecto conserva
«ConectaEdu - Sprint 0», aunque este documento registra el Sprint 1.
La imagen no muestra las fechas de cierre.

En main no se encontraron commits fechados del 19 al 25 de octubre.
Los PR #16 (modo real, ccaaf98), #17 (landing y privacidad, 28aeaf8) y
#18 (uso de IA, b7ab387) se integraron el 26 de octubre.
Se distingue así la demo y fecha de terminado reportada del 19 de la
integración posterior del código.

## Burndown

El archivo `docs/burndown-sprint-1.csv` contiene los puntos restantes al cierre
de cada día, del 19 al 25. El alcance inicial fue de 19 puntos y se incorporaron
18 más. Las tres historias incorporadas se reportaron terminadas el 19:
37 - 18 = 19 pendientes. No se reportaron otros cierres durante el periodo,
por lo que el saldo diario es 19.

La serie es una reconstrucción basada en el reporte del equipo y el tablero
actualizado el 26 de octubre. No representa una captura histórica diaria ni
muestra el momento exacto del aumento de alcance.
