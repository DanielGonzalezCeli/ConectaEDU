# Prompt: conectar la pantalla del tutor al tutor real (video de demostración)

Autor: Daniel · Herramienta: Claude Code

```text
Contexto: este repositorio es ConectaEDU. El calificador con IA ya funciona (no lo toques ni rompas sus 92 pruebas). El servidor ya tiene /api/tutor con un revisor que bloquea filtraciones y hay límites de gasto por hora y por IP, pero la pantalla del tutor usa un tutor simulado de un solo problema de estadística.

Objetivo urgente (hoy mismo, para grabar un video de demostración): conectar la pantalla del tutor al tutor real con material que pegue o suba el docente. Solo esto:
1. Una pantalla o sección donde el docente pega texto o sube un archivo de texto o PDF (hasta 5 MB, como en el calificador) con el material de su materia.
2. El estudiante hace preguntas y el tutor responde usando solo ese material, indicando de qué parte sale (cita corta). Si la respuesta no está en el material, dice claramente que no está y no inventa. Si la pregunta parece una tarea, da una pista y no la respuesta final.
3. Sin cuentas, sin clases, sin panel y sin guardar en el servidor. El material puede vivir en el navegador durante la sesión y enviarse al servidor con cada pregunta. Que recargar la página lo borre es aceptable por ahora.

Reglas:
- Rama nueva, nada en main.
- Reutiliza el revisor de /api/tutor y los límites de gasto que ya existen.
- Las pruebas nuevas no deben gastar dinero (respuestas de la IA simuladas) y las 92 existentes deben seguir pasando.
- No supongas la estructura del proyecto: léela primero.
- Todo lo que siga simulado debe decir "prototipo" en pantalla.
- No pidas ni guardes nombres de estudiantes (pueden ser menores).
```
