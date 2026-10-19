# Acta de la reunión de Sprint 0 · ConectaEdu

## 1. Datos de la reunión

| Campo | Detalle |
| --- | --- |
| Fecha y hora | Domingo 18 de octubre de 2026, 14:00 |
| Modalidad | Virtual, por Zoom |
| Materia | Emprendimiento Tecnológico, Ingeniería de Sistemas, PUCE (NRC 2667) |

**Asistentes** (asistieron los cuatro integrantes):

- Daniel Hernán González Celi
- Dilan Nicolás Mena Vera
- Juan Francisco Hoyos Renteira
- Elizabeth Samantha Nuñez Insuasti

## 2. Orden del día

Por confirmar.

## 3. Acuerdos

1. **Roles del equipo**, definidos con anterioridad a la reunión:
   - Juan Francisco Hoyos Renteira: Scrum Master.
   - Daniel Hernán González Celi: desarrollador de backend.
   - Dilan Nicolás Mena Vera: desarrollador de backend.
   - Elizabeth Samantha Nuñez Insuasti: desarrolladora de frontend.
   - Product Owner: por confirmar.
2. **Alcance del Sprint 1:** se compromete HU-01, HU-02, HU-03 y HU-12, que suman 19 puntos. El detalle de cada historia está en `docs/historias.md`.
3. **Trabajo en ramas:** nadie hace push a `main`; cada persona trabaja en su propia rama y entrega un solo commit por Pull Request.
4. **Revisión cruzada de Pull Requests:** el de Dilan lo revisa Juan, el de Samantha lo revisa Dilan y el de Juan lo revisa Samantha. Si falta alguien, Daniel puede aprobar. Nadie aprueba su propio Pull Request.
5. **Herramientas** (según el `README.md` del repositorio):
   - Prototipo actual: HTML, CSS y JavaScript sin dependencias, con Node 18 o superior solo para el servidor local y las pruebas.
   - Desde el Sprint 1: aplicación web con https en Cloudflare Pages y Workers, base de datos y acceso con Supabase (Postgres), y un proveedor de IA por API cuya clave vive solo en el servidor (archivo `.env`, fuera del control de versiones).
   - Reuniones: Zoom.
   - Otras herramientas de gestión o comunicación (tablero, chat del equipo): por confirmar.
6. **Otros acuerdos:** por confirmar.

## 4. Responsables y fechas

| Tarea | Responsable | Rama | Revisor | Fecha |
| --- | --- | --- | --- | --- |
| Acta de Sprint 0 y cronograma | Dilan Nicolás Mena Vera | `docs/acta-cronograma` | Juan Francisco Hoyos Renteira | Pull Request mergeado a las 22:30 del 18 de octubre de 2026 |
| Variables de entorno y privacidad | Elizabeth Samantha Nuñez Insuasti | `docs/env-privacidad` | Dilan Nicolás Mena Vera | Pull Request mergeado a las 22:30 del 18 de octubre de 2026 |
| Favicon | Juan Francisco Hoyos Renteira | `feat/favicon` | Elizabeth Samantha Nuñez Insuasti | Pull Request mergeado a las 22:30 del 18 de octubre de 2026 |

Responsables de las historias del Sprint 1 (HU-01, HU-02, HU-03 y HU-12): por confirmar.

## 5. Próximos pasos

- Mergear los tres Pull Requests anteriores a más tardar a las 22:30 del 18 de octubre de 2026.
- Entregar el Control 1 el 18 de octubre de 2026 a las 23:59.
- Asignar responsables a las historias del Sprint 1: por confirmar.
- Fechas intermedias del Sprint 1: por confirmar.
- Calendario completo de hitos en `docs/cronograma.md`.
