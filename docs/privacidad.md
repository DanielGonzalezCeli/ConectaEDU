# Política de privacidad y manejo de datos

Este documento explica qué datos trata ConectaEdu, cómo los protegemos y qué no guardamos. Se basa en la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP).

> Estado: borrador del equipo. Lo marcado como **por confirmar** todavía no está decidido y no debe presentarse como un hecho.

## 1. Qué datos se tratan

| Dato | Quién lo aporta | Para qué se usa |
| --- | --- | --- |
| Tareas y exámenes de los estudiantes | El docente los carga en el calificador | Sugerir una nota por criterio con su justificación |
| Rúbricas | El docente | Aplicar sus criterios y puntajes al calificar |
| Notas sugeridas y notas aprobadas | El sistema sugiere; el docente edita y aprueba | Registro para reclamos y exportación a CSV |
| Preguntas al tutor | El estudiante | Responder con el material del docente y mostrar al docente dónde se atascan sus estudiantes |
| Material de la materia | El docente | Que el tutor responda solo con ese contenido |

Los usuarios previstos son universitarios mayores de edad.

## 2. Aviso de privacidad (HU-12)

Antes de usar el tutor o de que se procese un trabajo suyo, el estudiante debe leer y aceptar un aviso de privacidad:

- El aviso está en español claro y sigue la LOPDP.
- Explica qué datos se tratan, para qué y quién los ve (el docente de su clase).
- Indica que sus datos **no se usan para entrenar modelos de IA**.
- Sin aceptar el aviso no se puede continuar.
- Texto final del aviso: **por confirmar**.
- Cómo se registra la aceptación (fecha, versión del aviso): **por confirmar**.
- Cómo se gestionan los trabajos que el docente carga en el calificador de estudiantes que aún no aceptaron el aviso: **por confirmar**.

## 3. Datos para pruebas

- En desarrollo y en pruebas se usan **trabajos anonimizados o ficticios**: sin nombres, cédulas, correos ni otros datos que identifiquen a una persona.
- Los datos de ejemplo del prototipo son ficticios.
- Las salidas de pruebas y mediciones se guardan en la carpeta `resultados/`, que está en `.gitignore` y no se sube al repositorio.
- Procedimiento exacto de anonimización (quién lo hace y cómo se revisa): **por confirmar**.

## 4. La clave de la IA

- La clave del proveedor de IA (`PROVEEDOR_IA_CLAVE`) vive solo en el archivo `.env` del servidor.
- **Nunca** va en el navegador: el navegador le pide al servidor y el servidor llama al modelo.
- **Nunca** va en el repositorio: `.env` está en `.gitignore` y `.env.example` solo trae los nombres de las variables, vacíos.
- Si una clave se filtra, se revoca de inmediato y se genera una nueva.

## 5. Qué NO se guarda

- No se guardan datos de estudiantes que no sean necesarios para calificar o para el tutor.
- No se usan los datos para entrenar modelos de IA, ni propios ni del proveedor.
- No se guardan claves de API en el código, en el repositorio ni en el navegador.
- No se guardan datos reales de estudiantes en el repositorio ni en los datos de prueba.
- El material que se arrastra en el prototipo actual no se lee ni se envía; solo se muestra su nombre.

## 6. Decisiones pendientes

Todo lo siguiente está **por confirmar**:

- Dónde se almacenan los datos en producción (proveedor y país del servidor).
- Cuánto tiempo se conservan los trabajos, las conversaciones con el tutor y el registro de notas, y cuándo se borran.
- Cómo pide un estudiante o un docente ver, corregir o borrar sus datos (derechos de la LOPDP).
- Condiciones del proveedor de IA sobre retención de datos y su uso para entrenamiento.
- Quién es el responsable del tratamiento de datos dentro del equipo.
