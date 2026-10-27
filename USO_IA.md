# Uso de inteligencia artificial

Este registro declara cómo se usó IA en ConectaEdu. La IA no es autora del proyecto: el equipo es responsable de todo el código y debe poder explicarlo.

| Fecha | Herramienta | Para qué se usó | Quién revisó |
| --- | --- | --- | --- |
| Octubre 2026 | Claude (Anthropic), con Claude Code | Escribir el prototipo inicial en HTML, separarlo en carpetas, corregir errores y escribir las 26 pruebas automáticas (`npm test`) | Daniel Hernán González Celi |
| Octubre 2026 | Claude (Anthropic) | Revisar el canvas y redactar la ficha del Control 1 | Daniel Hernán González Celi |
| 18 de octubre de 2026 | Claude Code (Anthropic) | Modo real del calificador: servidor con la API de Claude y sus validaciones, interfaz de calificación y comparación con el docente, despliegue en Render y sus pruebas automáticas (prompt en `docs/prompts/daniel-modo-real.md`) | Dilan Nicolás Mena Vera |
| 18 de octubre de 2026 | Claude Sonnet 5.5 (Anthropic), dentro del producto | Sugerir notas con la rúbrica del docente en el modo real; el docente revisa y aprueba cada nota | El docente que usa la herramienta |
| Octubre 2026 | Claude Code | Landing page y política de privacidad (`docs/index.html`, `docs/privacidad.html`) | Juan Francisco Hoyos Renteira (por confirmar) |
| Octubre 2026 | Claude (Anthropic) | Ordenar las notas de las encuestas y redactar los formatos 3, 5, 6 y 12 y el documento técnico v0.2 | Daniel Hernán González Celi |

## Reglas del equipo

- Los prompts que definieron el diseño se guardan en `docs/prompts/` (el archivo `CLAUDE.md` es el primero).
- Los commits asistidos por IA llevan la línea `Asistido-por-IA: [herramienta]`.
- Nunca se suben claves de API ni datos personales de estudiantes al repositorio.
