# Política de privacidad

Prototipo académico · PUCE

Última actualización: 26 de octubre de 2026.

Esta página explica cómo trata los datos el prototipo de ConectaEDU publicado en [conectaedu-l2j8.onrender.com](https://conectaedu-l2j8.onrender.com/). Describe solo lo que hace hoy el código del [repositorio](https://github.com/DanielGonzalezCeli/ConectaEDU). Es un prototipo de un proyecto universitario, no un servicio comercial.

## En pocas palabras

- Para sugerir una nota, la rúbrica y el trabajo se envían a Anthropic, el proveedor de IA.
- El servidor de ConectaEDU no guarda trabajos ni rúbricas. Solo anota datos de uso: fecha, modelo, cantidad de texto procesado, tiempo y costo.
- Las notas sugeridas y aprobadas viven solo en tu navegador y se pierden al recargar la página.
- No hay cuentas de usuario: se entra con una clave de acceso compartida.

## Qué datos entran

Cuando el docente califica con IA, se envía:

- **La rúbrica:** el nombre de cada criterio, su descripción y su puntaje máximo.
- **Las instrucciones de la tarea**, si el docente las escribió.
- **El trabajo:** el texto pegado o el contenido del archivo (.txt, .md o PDF de hasta 5 MB).

**No se envía el nombre del archivo.** Cada trabajo se identifica en la página como «Trabajo 1», «Trabajo 2», y ese nombre tampoco sale del navegador.

Para entrar, se escribe la clave de acceso. El servidor no guarda esa clave escrita: entrega al navegador una cookie con una firma, que el navegador conserva 12 horas.

Para limitar el gasto y los intentos de adivinar la clave, el servidor cuenta las solicitudes por **dirección IP**.

## A quién se envían

- **Anthropic**, mediante su API, recibe la rúbrica, las instrucciones y el trabajo para generar la nota sugerida. El modelo configurado por defecto es Claude Sonnet 5.5.
- **Render** aloja el servidor del prototipo, en su plan gratuito. Los datos pasan por ese servidor para llegar a Anthropic.

Qué hacen Anthropic y Render con los datos que reciben, cuánto tiempo los conservan y si los usan para entrenar modelos depende de sus propias condiciones: **por confirmar**. Todavía no hemos revisado ni documentado esas condiciones, así que no prometemos nada sobre ellas.

## Qué se guarda y por cuánto tiempo

| Dato | Dónde | Por cuánto tiempo |
| --- | --- | --- |
| Trabajos, rúbricas e instrucciones | En la memoria del servidor, solo mientras se procesa la solicitud. | No se escriben en ningún archivo ni base de datos. |
| Notas sugeridas, ediciones y aprobaciones del docente | En la memoria de la pestaña del navegador. No se usa el almacenamiento local del navegador. | Hasta recargar o cerrar la pestaña. El docente puede descargarlas en CSV o JSON. |
| Registro de uso: fecha, ruta, modelo, tokens (cantidad de texto procesado), tiempo, resultado de la llamada y costo | En un archivo del servidor (`resultados/uso.csv`). | En Render, el disco es temporal: el archivo se borra cada vez que el servicio se reinicia o se apaga por inactividad (**por confirmar**: depende de Render, no del código). |
| Dirección IP | En la memoria del servidor, para los límites de uso. | Cuenta las solicitudes de la última hora y los intentos fallidos de los últimos 15 minutos. No se escribe en ningún archivo y se pierde al reiniciar el servidor. |
| Cookie de acceso | En tu navegador. | 12 horas. Contiene una firma de la clave de acceso, no datos personales. |

Si ocurre un error interno, el servidor anota solo el tipo de error, sin el contenido del trabajo.

## Qué no se guarda

- El contenido de los trabajos, las rúbricas y las instrucciones.
- Los nombres de los archivos.
- Cuentas, nombres o correos de usuarios: no existen. El «Iniciar sesión» como docente o estudiante dentro de la página es parte de la demostración y no verifica a nadie.
- Las conversaciones con el tutor: en esta versión el tutor es una demostración simulada y sus mensajes no salen del navegador.
- El material que se arrastra en «Material del tutor»: no se lee ni se envía; solo se muestra su nombre en la pantalla.

## Quién tiene acceso

- **Quien tiene la clave de acceso** puede usar la demostración. Cada persona ve solo los resultados de su propia pestaña: las notas no se comparten entre navegadores.
- **El equipo de ConectaEDU** administra el servidor y puede ver el registro de uso, que no incluye el contenido de los trabajos.
- **Anthropic** recibe el contenido enviado para calificarlo, según lo explicado arriba.

## Trabajos de estudiantes en las pruebas

En nuestras pruebas usamos trabajos ficticios o anonimizados. No usamos trabajos de estudiantes reales sin su consentimiento (**por confirmar**: es una práctica del equipo y el código no lo puede comprobar).

Antes del primer uso con IA, la página pide aceptar un aviso que recuerda usar trabajos anonimizados, sin nombres, cédulas, correos ni otros datos que identifiquen al estudiante. Si pruebas el prototipo, sigue esa misma regla.

## Lo que todavía no está decidido

Todo lo siguiente está **por confirmar**:

- Dónde y por cuánto tiempo se guardarían los datos en un producto real.
- Cómo pediría una persona ver, corregir o borrar sus datos.
- Las condiciones del proveedor de IA sobre conservación de datos y entrenamiento de modelos.
- Quién es, dentro del equipo, el responsable del tratamiento de los datos.

## Contacto

Para preguntas o pedidos sobre esta política, abre un *issue* en los [Issues del repositorio](https://github.com/DanielGonzalezCeli/ConectaEDU/issues). Los issues son públicos: no escribas en ellos datos personales ni contenido de trabajos.
