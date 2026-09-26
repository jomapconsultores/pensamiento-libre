# Por qué `/admin` da 503, y cómo se arregla

Diagnosticado el 25-sep-2026 contra producción. **Nada de esto está aplicado
todavía.**

## El síntoma

`https://www.pensamiento-libre.org/admin` devuelve **503** desde antes del 4 de
septiembre. La portada funciona (200); solo el panel cae.

## Lo que NO es

No es el proxy ni Cloudflare: pedido directamente al contenedor,
`http://127.0.0.1:3000/admin` devuelve el mismo 503, y el router de Traefik es un
`PathPrefix(/)` que no distingue `/admin` de nada. No es el contenedor, que lleva
13 días arriba y sirve el resto del sitio.

## Lo que es

El 503 lo devuelve `src/middleware.ts`, y dice exactamente por qué:

```
Panel no configurado: define SESSION_SECRET en el entorno (una cadena larga y aleatoria).
```

Son **dos** cosas a medio camino, no una. El panel se cambió de una clave
compartida a cuentas nominales (`admin_users`), y de ese cambio quedó solo el
código:

1. **Falta `SESSION_SECRET`** en el entorno del despliegue. Comparadas las
   variables de producción con `.env.example`, faltan dos: `SESSION_SECRET` y
   `MARKETING_CAPTURE_URL`. La segunda era para entregar contactos al CRM de
   marketing, que se retiró el 24-sep, así que probablemente ya no hace falta.
2. **La tabla `admin_users` no existe.** La migración
   `supabase/20260801_cuentas_admin.sql` nunca se aplicó. Su base es
   `pensamiento_libre`, dentro de `contable-supabase-db-1` (no en una instancia
   propia: su PostgREST apunta ahí). Solo tiene cinco tablas:
   `contact_messages`, `donations`, `memberships`, `newsletter_subscribers` y
   `service_payments`.

Con poner solo la variable, el 503 se convertiría en un login contra el que nadie
puede autenticarse. Hacen falta las dos cosas, en este orden.

## El arreglo, paso a paso

**1. Aplicar la migración** (es idempotente, y se puede repetir sin daño):

```sh
# respaldo previo de esa base, que es la de contabilidad compartida
ssh coolify 'docker exec contable-supabase-db-1 pg_dump -U postgres -d pensamiento_libre \
  | gzip > /opt/respaldos/pensamiento_libre-antes-admin_users-$(date +%Y%m%d).sql.gz'

# la migración
scp supabase/20260801_cuentas_admin.sql coolify:/tmp/
ssh coolify 'docker exec -i contable-supabase-db-1 psql -U postgres -d pensamiento_libre \
  -v ON_ERROR_STOP=1 < /tmp/20260801_cuentas_admin.sql'
```

**2. Poner `SESSION_SECRET`** en Coolify (aplicación `pensamiento-libre`), con un
valor largo y aleatorio. Se genera sin dejarlo escrito en ningún fichero:

```sh
ssh coolify 'openssl rand -hex 32'
```

Al guardar la variable hay que **redesplegar**, porque Next.js la lee en el
arranque del servidor.

**3. Crear la primera cuenta.** Aquí hacen falta datos tuyos: el correo y la
clave con que vas a entrar. La migración deja dicho que `ADMIN_USERNAME` /
`ADMIN_PASSWORD` —que siguen en el entorno— sirven de arranque para crear esa
primera cuenta desde el propio panel; una vez creada, esas dos se pueden borrar.

**4. Comprobar** que `/admin` deja de dar 503 y lleva a `/admin/login`.

## Lo otro que decía el informe de septiembre: «no cobra»

Eso hay que volver a verificarlo, porque **las claves de Stripe sí están
completas** en producción: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, la
publicable y los cinco identificadores de precio (socio básico, socio premium,
donación, taller, consulta). No lo probé desde aquí a propósito: lanzar un
checkout crea una sesión de pago de verdad en Stripe. Se comprueba desde el
navegador, pulsando el botón de socio, y si falla, el motivo estará en el log del
contenedor.
