# Despliegue en Render

Pasos para publicar el PMV con IA real y para preparar el QR de la demostración.

## Qué protege al despliegue

- **No hay cuentas de usuario ni clave de acceso.** Cualquiera con la dirección puede usar la página, el calificador y el tutor; el servidor no distingue quién es quién. El «Iniciar sesión» de docente o estudiante dentro de la página es parte de la demostración simulada.
- **Límites de gasto (la única protección del presupuesto).** `LIMITE_LLAMADAS_POR_HORA` (60 por defecto) para todo el servidor y `LIMITE_POR_IP_POR_HORA` (40 por defecto) por conexión. Quienes comparten la misma red wifi comparten IP pública.
- **`/salud`.** Responde `{"estado":"ok"}`; Render la usa para saber si el servicio está vivo.
- La clave de la IA se escribe solo en el panel de Render. No está en `render.yaml` ni en el repositorio.

## Pasos

1. Entra a <https://dashboard.render.com> con tu cuenta de GitHub.
2. **New → Blueprint** y elige el repositorio `DanielGonzalezCeli/ConectaEDU`. Render lee `render.yaml` de la rama `main`. Si el Blueprint ya existía con otra rama, cámbiala a `main` en la configuración del Blueprint, en el panel de Render.
3. Te pedirá el valor secreto `PROVEEDOR_IA_CLAVE`: tu clave del proveedor de IA. Si en el panel quedó una variable `CLAVE_ACCESO` de antes, puedes borrarla: el servidor ya no la usa.
4. **Apply.** Cuando termine, Render muestra la dirección, por ejemplo `https://conectaedu.onrender.com` (si el nombre está ocupado, agrega un sufijo).
5. Comprueba:
   - `https://<tu-direccion>/salud` → `{"estado":"ok"}`.
   - `https://<tu-direccion>/` → abre la página directamente, sin pedir clave.
   - El banner superior dice **IA REAL · modelo claude-sonnet-5-5**.

## El QR

El QR apunta a la dirección simple (`https://<tu-direccion>/`) y entra directo. Como no hay clave, cualquiera que tenga la dirección puede usar la IA hasta los límites por hora; si les preocupa el gasto, bajen `LIMITE_LLAMADAS_POR_HORA` en el panel de Render después del pitch.

## Antes del pitch

- El plan gratuito de Render **apaga el servicio tras unos 15 minutos sin visitas** y tarda alrededor de un minuto en despertar. Abran la dirección 3 a 5 minutos antes de presentar y recarguen hasta que cargue.
- El registro `resultados/uso.csv` se pierde en cada reinicio de Render (su disco es temporal). Para medir el costo, usen la cifra de tokens y costo del banner o de `/api/estado` antes de que el servicio se apague.
- Si algo falla, la versión local (`npm start`) y el modo simulado siguen funcionando sin internet.
