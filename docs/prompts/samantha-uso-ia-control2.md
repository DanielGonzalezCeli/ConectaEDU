# Prompt: actualizar USO_IA.md para el Control 2

Autora: Samantha · Herramienta: Claude Code

```text
Estoy en el repo ConectaEDU (ya clonado y actualizado). Haz esto:

1. Confirma que estás en la rama docs/uso-ia-control2 (créala desde main si no existe).
2. Abre USO_IA.md. Conserva su estructura y sus reglas. Si algún renglón de la tabla tiene la palabra COMPLETAR en la columna "Quién revisó", reemplázala por el nombre de la persona que revisó ese trabajo según el historial de pull requests (git log y los PR mergeados). Si no puedes comprobarlo, déjalo como "por confirmar" y avísame.
3. Agrega estos renglones al final de la tabla (fecha: octubre 2026). En "Quién revisó" pon "por confirmar" donde no tengas el dato:
   - Claude Code | Servidor con IA real: calificación con rúbrica, panel de comparación con el docente y despliegue | Dilan Nicolás Mena Vera (por confirmar)
   - Claude Code | Landing page y política de privacidad (docs/index.html, docs/privacidad.html) | Juan Francisco Hoyos Renteira (por confirmar)
   - Claude (Anthropic) | Ordenar las notas de las encuestas y redactar los formatos 3, 5, 6 y 12 y el documento técnico v0.2 | Daniel Hernán González Celi
4. No cambies nada más del archivo. No agregues datos personales ni claves.
5. Guarda este prompt en docs/prompts/samantha-uso-ia-control2.md.
6. Haz un solo commit con el mensaje "docs: actualizar USO_IA.md para el Control 2" y, al final, la línea: Asistido-por-IA: Claude Code
7. Haz push de la rama docs/uso-ia-control2 (nunca a main). No abras el PR.
8. Muéstrame el cambio exacto (git diff contra origin/main) y lo que dejaste como "por confirmar".
```
