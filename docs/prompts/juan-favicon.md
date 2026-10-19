# Prompt utilizado para el favicon

Herramienta utilizada: OpenAI Codex.
Adaptado de la guía Juan_favicon.md para registrar la herramienta realmente utilizada.

```text
Estoy en el repo ConectaEDU (ya clonado). Haz esto:

1. Haz git pull y crea la rama feat/favicon desde main.
2. Crea favicon.svg en la raíz: un icono simple y original para ConectaEdu (por ejemplo, dos nodos conectados sobre un fondo de color liso). No uses logos ni personajes existentes.
3. En index.html, dentro del <head>, agrega solo la línea: <link rel="icon" href="favicon.svg" type="image/svg+xml">. No cambies nada más.
4. Corre node --test: las 26 pruebas deben seguir pasando. Si alguna falla, no hagas commit y dime cuál.
5. Guarda este prompt en docs/prompts/juan-favicon.md.
6. Haz un solo commit con el mensaje "feat: favicon de la aplicación" y, al final, la línea: Asistido-por-IA: OpenAI Codex
7. Haz push de la rama feat/favicon (nunca a main). No abras el PR.
```

Ajuste necesario durante la implementación: permitir `.svg` con el tipo
`image/svg+xml` en `servidor.js`, porque el servidor original devolvía 404 para
el favicon. Mantener el cambio de `index.html` en una sola línea.
