# Despliegue en Render

Pasos para publicar el PMV con IA real detrás de una clave de acceso, y para preparar el QR de la demostración.

## Qué protege al despliegue

- **Clave de acceso (`CLAVE_ACCESO`).** Sin ella no se ve la página ni se puede llamar a la IA. Al entrar, el navegador recibe una cookie firmada que dura 12 horas; la clave no viaja de vuelta. Diez intentos fallidos desde la misma IP bloquean el acceso durante 15 minutos.
- **Límites de gasto.** `LIMITE_LLAMADAS_POR_HORA` (60 por defecto) para todo el servidor y `LIMITE_POR_IP_POR_HORA` (40 por defecto) por conexión. Quienes comparten la misma red wifi comparten IP pública.
- **`/salud`.** Responde `{"estado":"ok"}` sin pedir acceso; Render la usa para saber si el servicio está vivo.
- **Arranque seguro.** Si el servidor escucha fuera de localhost con IA real y sin `CLAVE_ACCESO`, se niega a arrancar.
- La clave de la IA se escribe solo en el panel de Render. No está en `render.yaml` ni en el repositorio.

## Pasos

1. Entra a <https://dashboard.render.com> con tu cuenta de GitHub.
2. **New → Blueprint** y elige el repositorio `DanielGonzalezCeli/ConectaEDU`. Render lee `render.yaml` (rama `feat/modo-real`).
3. Te pedirá los valores secretos:
   - `PROVEEDOR_IA_CLAVE`: tu clave del proveedor de IA.
   - `CLAVE_ACCESO`: una frase larga para la demostración (por ejemplo, tres palabras y un número). Cámbiala después del pitch.
4. **Apply.** Cuando termine, Render muestra la dirección, por ejemplo `https://conectaedu.onrender.com` (si el nombre está ocupado, agrega un sufijo).
5. Comprueba:
   - `https://<tu-direccion>/salud` → `{"estado":"ok"}`.
   - `https://<tu-direccion>/` → pide la clave de acceso.
   - Después de entrar, el banner superior dice **IA REAL · modelo claude-sonnet-5-5**.

## El QR

Hay dos formas:

- **QR a la dirección simple** (`https://<tu-direccion>/`): quien lo escanea escribe la clave de acceso, que muestran en la diapositiva. Es la opción más segura.
- **QR con la clave incluida** (`https://<tu-direccion>/?acceso=<CLAVE_ACCESO>`): entra directo y la clave desaparece de la barra de direcciones. Cualquiera que fotografíe el QR puede entrar, así que cambien la clave al terminar.

## Antes del pitch

- El plan gratuito de Render **apaga el servicio tras unos 15 minutos sin visitas** y tarda alrededor de un minuto en despertar. Abran la dirección 3 a 5 minutos antes de presentar y recarguen hasta que cargue.
- El registro `resultados/uso.csv` se pierde en cada reinicio de Render (su disco es temporal). Para medir el costo, usen la cifra de tokens y costo del banner o de `/api/estado` antes de que el servicio se apague.
- Si algo falla, la versión local (`npm start`) y el modo simulado siguen funcionando sin internet.
