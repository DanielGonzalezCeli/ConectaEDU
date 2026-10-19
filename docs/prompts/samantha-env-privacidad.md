# Prompt: variables de entorno y privacidad

Autora: Samantha · Herramienta: Claude Code

```text
Estoy en el repo ConectaEDU (ya clonado). Haz esto:

1. Haz git pull y crea la rama docs/env-privacidad desde main.
2. Crea .env.example en la raíz con estas variables VACÍAS (nunca pongas una clave real):
   PROVEEDOR_IA_CLAVE=
   PROVEEDOR_IA_MODELO=claude-sonnet-5-5
   con comentarios en español que expliquen cada una y que la clave solo se usa en el servidor.
3. Verifica que .gitignore ignore .env y resultados/. Si no, agrégalos.
4. Crea docs/privacidad.md en español claro: qué datos se tratan (tareas, rúbricas, notas, preguntas al tutor), que el estudiante debe aceptar un aviso de privacidad (HU-12), que para pruebas se usan trabajos anonimizados, que la clave de la IA nunca va en el navegador ni en el repositorio, y qué NO se guarda. Marca como "por confirmar" cualquier decisión que no esté tomada.
5. Guarda este prompt en docs/prompts/samantha-env-privacidad.md.
6. Haz un solo commit con el mensaje "docs: variables de entorno de ejemplo y política de privacidad" y, al final, la línea: Asistido-por-IA: Claude Code
7. Haz push de la rama docs/env-privacidad (nunca a main). No abras el PR.
```
