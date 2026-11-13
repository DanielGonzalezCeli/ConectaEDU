# ConectaEdu

ConectaEdu es una aplicación web para docentes universitarios que califican trabajos escritos sin ayudante. El calificador sugiere puntajes con la rúbrica del docente y el tutor guía al usuario con el material de la asignatura.

Proyecto de Emprendimiento Tecnológico · Ingeniería de Sistemas · PUCE · NRC 2667.

## Enlaces del proyecto

- [Aplicación web en Render](https://conectaedu-l2j8.onrender.com/)
- [Landing de ConectaEdu](https://danielgonzalezceli.github.io/ConectaEDU/)
- [Política de privacidad](https://danielgonzalezceli.github.io/ConectaEDU/privacidad.html)
- [Tablero de GitHub Projects](https://github.com/users/DanielGonzalezCeli/projects/1)

La aplicación publicada usa una clave de acceso compartida que el equipo facilita para la demostración. Las cuentas, las clases y el tutor de Fundamentos de Estadística usan datos de ejemplo.

## Funcionalidades

### Calificador con rúbrica

1. En la vista de docente, abre **Tareas y calificación** y crea una tarea.
2. Carga o escribe la rúbrica y agrega los trabajos. Puedes usar archivos `.txt`, `.md` o `.pdf`, o pegar el texto.
3. Acepta el aviso de privacidad antes de procesar los trabajos.
4. Revisa la nota sugerida, la justificación y la evidencia de cada criterio.
5. Ajusta los puntajes cuando corresponda, aprueba la nota y exporta las calificaciones aprobadas a CSV.

### Tutor con tu material

En la vista de docente, abre **Tutor con tu material**, carga un archivo `.txt`, `.md` o `.pdf` y escribe una pregunta sobre su contenido. El tutor guía con pistas, muestra la fuente cuando está disponible e indica si pudo verificar la cita.

## Ejecutar en local

Necesitas **Node.js 18 o superior**. El proyecto usa HTML, CSS y JavaScript y funciona sin instalar dependencias de npm.

```bash
git clone https://github.com/DanielGonzalezCeli/ConectaEDU.git
cd ConectaEDU
npm start
```

Abre [http://localhost:8000](http://localhost:8000).

Para usar el calificador y el tutor con IA, crea un archivo `.env` a partir de `.env.example` y configura `PROVEEDOR_IA_CLAVE`. Para proteger el acceso al servicio con una clave compartida, configura `CLAVE_ACCESO`. Mantén las claves en el servidor y fuera del repositorio.

Para comprobar la conexión con el proveedor de IA, ejecuta:

```bash
npm run probar-ia
```

Consulta también la [guía de despliegue en Render](docs/despliegue-render.md).

## Pruebas automatizadas

```bash
npm test
```

La suite cubre la calificación, la aprobación de notas, el tutor y los controles de acceso y límites del servidor. Las pruebas automatizadas usan respuestas simuladas del proveedor de IA.

## Resultados de validación

- El equipo realizó 12 entrevistas y encuestó a 14 docentes y 6 estudiantes.
- Cinco docentes universitarios probaron el flujo de calificación con tres trabajos. Tres completaron el recorrido sin ayuda dentro de 25 minutos. Ninguno lo completó sin ayuda en menos de 15 minutos. La mediana para aprobar las tres notas fue de 20 minutos.
- En una tarea real del equipo, la IA sugirió 8/10 y el docente asignó 9,5/10.
- Los comentarios de los docentes motivaron ajustes en el rigor de la calificación y en el tono de las observaciones. Queda pendiente comparar los tiempos con la calificación manual y evaluar el tutor con usuarios.

## Estructura del repositorio

| Ruta | Contenido |
| --- | --- |
| `index.html`, `css/` y `js/` | Interfaz web y recorrido de demostración |
| `servidor.js` y `servidor/` | Servidor Node.js y API del calificador y el tutor |
| `tests/` | Pruebas automatizadas |
| `docs/` | Landing, política de privacidad, actas y documentación |
| `render.yaml` | Configuración de despliegue en Render |
| `.env.example` | Variables de entorno de ejemplo, sin claves |

## Equipo

- Daniel Hernán González Celi
- Dilan Nicolás Mena Vera
- Elizabeth Samantha Nuñez Insuasti
- Juan Francisco Hoyos Renteria

## Licencia y uso de IA

El código se distribuye bajo la [licencia MIT](LICENSE). El uso de IA en el desarrollo se documenta en [USO_IA.md](USO_IA.md) y los prompts se conservan en [docs/prompts/](docs/prompts/).
