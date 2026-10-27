# Prompt: alinear privacidad.md con la política publicada

Autora: Samantha · Herramienta: Claude Code

```text
Estoy en el repo ConectaEDU, rama nueva docs/privacidad-alinear desde main. Reescribe docs/privacidad.md para que diga SOLO lo mismo que docs/privacidad.html, en Markdown. No agregues nada que no esté en el HTML. Quita lo que el código no respalda: la mención a la LOPDP, el registro para reclamos, el tutor funcionando, el aviso del estudiante, la afirmación sobre entrenamiento de modelos y que la clave vive en .env. Incluye lo que sí hace el código: los datos se envían a Anthropic para sugerir la nota, el servidor no guarda trabajos ni rúbricas, solo datos de uso, la clave de acceso, la cookie, el conteo por IP, y que el servicio corre en Render. Lo que no se pueda comprobar déjalo como "por confirmar". Guarda este prompt en docs/prompts/samantha-privacidad-alinear.md. Un solo commit con el mensaje "docs: alinear privacidad.md con la política publicada" y la línea Asistido-por-IA: Claude Code. Haz push a esa rama y no abras el PR.
```
