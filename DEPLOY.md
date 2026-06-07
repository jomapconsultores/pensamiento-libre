# Deploy de agente_map en Render

Esta guía despliega la API HTTP (`api/main.py`) como Web Service en Render
usando el blueprint `render.yaml`.

## 0. Pre-requisitos

- Cuenta en https://github.com (la repo origen)
- Cuenta en https://dashboard.render.com (puede ser plan Free)
- Las claves de Anthropic y Supabase ya en tu `.env` local
- `git` instalado en tu máquina

## 1. Subir el código a GitHub

Desde la raíz del proyecto:

```powershell
cd C:\Users\mapos\Dropbox\Programas\agente_map
git init
git add .
git status                                  # revisa que .env NO aparezca
git commit -m "Initial commit: agente_map API + CLI"
```

Crea el repo en GitHub (vacío, sin README inicial). Luego:

```powershell
git branch -M agente-map
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin agente-map
```

> Nota: este proyecto convive como rama `agente-map` dentro del repo
> `pensamiento-libre`. La rama `main` está reservada para el Next.js.
> Render despliega desde la rama `agente-map` (ya configurado en
> `render.yaml`).

⚠️ **Antes de push verifica** con `git status` que `.env` no aparece staged.
El `.gitignore` lo excluye, pero confirma con tus ojos.

## 2. Crear el servicio en Render

1. Entra a https://dashboard.render.com → **New → Blueprint**.
2. Conecta tu cuenta de GitHub (autoriza acceso al repo).
3. Selecciona el repo `agente-map`.
4. Render detecta `render.yaml` automáticamente y propone un Web Service llamado `agente-map-api`.
5. **Antes de "Apply"** ve a la pantalla de Environment Variables: las marcadas como `sync: false` están vacías. Pégalas a mano (toma los valores de tu `.env`):
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_SERVICE_ROLE_JWT`
   - `AGENTE_MAP_API_KEY` — Render la genera automáticamente (`generateValue: true`). **Cópiala** desde el dashboard tras el primer deploy.
6. Clic en **Apply**. Render empezará el primer build (~3–5 min).

## 3. Verificar el deploy

Cuando el deploy diga "Live", tu URL será algo como `https://agente-map-api.onrender.com`.

```powershell
# Liveness (sin auth)
curl https://agente-map-api.onrender.com/healthz

# Listar tipos de documento (requiere API key)
curl -H "X-API-Key: TU_API_KEY_DE_RENDER" `
     https://agente-map-api.onrender.com/doc_types

# Lanzar una propuesta de prueba
curl -X POST https://agente-map-api.onrender.com/propuestas `
     -H "X-API-Key: TU_API_KEY_DE_RENDER" `
     -H "Content-Type: application/json" `
     -d '{"user_input":"educación rural en la Amazonía ecuatoriana","mode":"text"}'
# → { "session_id": "abc12345", "status": "pending" }

# Polear estado (cada ~30s)
curl -H "X-API-Key: TU_API_KEY_DE_RENDER" `
     https://agente-map-api.onrender.com/propuestas/abc12345

# Descargar el Word cuando status="approved"
curl -H "X-API-Key: TU_API_KEY_DE_RENDER" `
     -o propuesta.docx `
     https://agente-map-api.onrender.com/propuestas/abc12345/word
```

También hay docs auto-generadas en `https://.../docs` (Swagger UI).

## Limitaciones del plan Free

- 512 MB RAM y 0.1 CPU. Suficiente para 1 pipeline a la vez.
- Spin-down tras 15 min sin tráfico → el primer request tras inactividad
  tarda ~30 s (cold start).
- Sin disco persistente — por eso los .docx/.xlsx se regeneran on-demand
  desde Supabase.
- 750 horas/mes incluidas.
- **Tareas largas**: si Render reinicia el dyno mientras corre un pipeline,
  ese trabajo queda en `running` y nunca termina. Si te pasa, considera el
  plan Starter ($7/mo) o mueve a Background Worker.

## Cómo actualizar el deploy

Cada push a `main` en GitHub dispara un redeploy automático en Render.

## Cómo rotar la API key

En Render → tu servicio → Environment → editar `AGENTE_MAP_API_KEY` → save
(redeploya solo). Quienes la tengan vieja dejan de funcionar.

## Si algo falla

- Logs en vivo: Render → tu servicio → **Logs**.
- Variables: Render → tu servicio → **Environment**.
- Reiniciar: **Manual Deploy → Clear build cache & deploy**.
