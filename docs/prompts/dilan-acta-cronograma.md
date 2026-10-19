# Prompt · acta de Sprint 0 y cronograma (Dilan)

Prompt usado con Claude Code para crear `docs/actas/sprint-0.md` y `docs/cronograma.md`.

```
Estoy en el repo ConectaEDU (ya clonado). Haz esto sin tocar código de la app:

1. Haz git pull y crea la rama docs/acta-cronograma desde main.
2. Crea docs/actas/sprint-0.md con el acta de la reunión de Sprint 0. Datos reales (no inventes nada que no esté aquí; lo que falte, escribe "por confirmar"):
   - Fecha y hora: domingo 18 de octubre de 2026, 14:00
   - Modalidad: virtual, por Zoom
   - Asistentes: Daniel Hernán González Celi, Dilan Nicolás Mena Vera, Juan Francisco Hoyos Renteira, Elizabeth Samantha Nuñez Insuasti (asistieron los cuatro)
   - Acuerdos:
     * Roles del equipo, definidos con anterioridad a la reunión: Juan Francisco Hoyos Renteira, Scrum Master; Daniel Hernán González Celi, desarrollador de backend; Dilan Nicolás Mena Vera, desarrollador de backend; Elizabeth Samantha Nuñez Insuasti, desarrolladora de frontend. Product Owner: por confirmar.
     * El Sprint 1 compromete HU-01, HU-02, HU-03 y HU-12 (19 puntos).
     * Nadie hace push a main; cada persona trabaja en su propia rama, con un solo commit por PR.
     * Revisión cruzada de PR: el PR de Dilan lo revisa Juan, el de Samantha lo revisa Dilan y el de Juan lo revisa Samantha; si falta alguien, Daniel puede aprobar.
     * Herramientas (según el README del repositorio): prototipo actual en HTML, CSS y JavaScript, con Node 18 o superior solo para el servidor local y las pruebas; desde el Sprint 1, aplicación web con https en Cloudflare Pages y Workers, base de datos y acceso con Supabase (Postgres) y un proveedor de IA por API cuya clave vive solo en el servidor (archivo .env, fuera del control de versiones). Reuniones por Zoom. Otras herramientas de gestión o comunicación: por confirmar.
     * Otros acuerdos: por confirmar.
   Estructura: datos de la reunión, orden del día (por confirmar), acuerdos, responsables y fechas, próximos pasos. En español claro, sin anglicismos innecesarios.
3. Crea docs/cronograma.md con estos hitos: Control 1 (18 oct 2026, 23:59), Control 2 (26 oct), Control 3 (5 nov), entrega final (12 nov, 23:59). El Sprint 1 compromete HU-01, HU-02, HU-03 y HU-12 (19 puntos). Remite a docs/historias.md. No agregues fechas intermedias que no te di.
4. Guarda este mismo prompt en docs/prompts/dilan-acta-cronograma.md.
5. Haz un solo commit con el mensaje "docs: acta de Sprint 0 y cronograma" y, al final, la línea: Asistido-por-IA: Claude Code
6. Haz push de la rama docs/acta-cronograma (nunca a main). No abras el PR, lo hago yo por la web.
```
