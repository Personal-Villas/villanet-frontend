# Auditoría de migración de dominio (frontend)

**Contexto:** cambio de `thevillanet.com` → `agents.personalvillas.com`  
**Alcance:** solo lectura del repo `villanet-frontend`  
**Fecha del audit:** 2026-09-18

---

## 1. Búsqueda de `thevillanet.com` hardcodeado

Grep de `thevillanet.com` en todo el repo. Resultados:

### Fuente (hay que actualizar en el cambio de dominio)

| Archivo | Línea(s) | Contenido |
|---------|----------|-----------|
| `vite.config.ts` | 13–14 | `allowedHosts`: `'thevillanet.com'`, `'www.thevillanet.com'` |
| `public/robots.txt` | 4 | `Sitemap: https://www.thevillanet.com/sitemap.xml` |
| `public/sitemap.xml` | 5, 10, 16, 21, 26, 32, 37, 42, 48, 53 | Todas las `<loc>` usan `https://www.thevillanet.com/...` |

Detalle `vite.config.ts` (sección `preview.allowedHosts`):

```12:17:vite.config.ts
    allowedHosts: [
      'thevillanet.com',
      'www.thevillanet.com',
      'villanet-frontend.onrender.com',
      'villanet-frontend-dev.onrender.com'
    ]
```

Detalle `public/robots.txt`:

```
Sitemap: https://www.thevillanet.com/sitemap.xml
```

Detalle `public/sitemap.xml` (todas las URLs):

- `https://www.thevillanet.com/`
- `https://www.thevillanet.com/properties`
- `https://www.thevillanet.com/for-travel-advisors`
- `https://www.thevillanet.com/for-property-managers`
- `https://www.thevillanet.com/trust-framework`
- `https://www.thevillanet.com/about`
- `https://www.thevillanet.com/advisor-signup`
- `https://www.thevillanet.com/property-manager-signup`
- `https://www.thevillanet.com/terms-of-service`
- `https://www.thevillanet.com/privacy-policy`

### Artefacto de build (espejo de `public/` — se regenera al buildear)

| Archivo | Líneas | Nota |
|---------|--------|------|
| `dist/robots.txt` | 4 | Copia de `public/robots.txt` |
| `dist/sitemap.xml` | 5, 10, 16, 21, 26, 32, 37, 42, 48, 53 | Copia de `public/sitemap.xml` |

No hace falta editar `dist/` a mano: se corrige actualizando `public/` y regenerando el build.

### SEO / canonical — **no hardcodea** `thevillanet.com`

`src/components/SEO.tsx` construye canonical y `og:url` así:

1. `VITE_SITE_URL` (si está definida), o
2. `window.location.origin` como fallback

```68:68:src/components/SEO.tsx
    const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/+$/, "") || window.location.origin;
```

```94:95:src/components/SEO.tsx
    const canonicalUrl = resolveUrl(canonical) || window.location.href;
    upsertLink("canonical", canonicalUrl);
```

Usos típicos:

- `Properties.tsx`: `canonical="/properties"` (ruta relativa → se resuelve con `siteUrl`)
- `PropertyDetail.tsx`: `canonical={window.location.href}`

**Conclusión sección 1:** el dominio viejo está hardcodeado solo en `vite.config.ts`, `public/robots.txt` y `public/sitemap.xml` (+ espejo en `dist/`). El componente SEO no fija `thevillanet.com` en código; depende de env / origen del browser.

---

## 2. Cómo se guarda el access token (impacto en sesión al cambiar de dominio)

### Confirmación: es `localStorage`, clave `'access'`

**Lectura** en el cliente HTTP:

```20:20:src/api/api.ts
  const token = localStorage.getItem('access') || undefined;
```

Se adjunta como `Authorization: Bearer ${token}`.

**Escritura** (login / register / verify):

```41:41:src/auth/useAuth.ts
    localStorage.setItem('access', data.accessToken);
```

(igual en `login`, `register`, `verifyCode`)

También en signup de advisor:

```33:33:src/pages/AdvisorSignup.tsx
      localStorage.setItem('access', result.accessToken);
```

**Borrado** (logout / 401 / fallo de `/auth/me`):

- `useAuth.logout` → `localStorage.removeItem('access')`
- `api.ts` en 401 (rutas no-auth) → `localStorage.removeItem('access')`
- `AuthContext.fetchUser` si falla → `localStorage.removeItem('access')`

### ¿Hay `sessionStorage` para sesión?

**No.** Grep de `sessionStorage` en `src/` → 0 matches.

### ¿Hay algo más relacionado a sesión?

| Mecanismo | Presente | Detalle |
|-----------|----------|---------|
| `localStorage['access']` | Sí | Access token JWT (o similar) |
| Cookies vía `credentials: 'include'` | Sí (lado cliente) | Comentario en `api.ts`: *“necesario para el refresh_token (SameSite=None; Secure)”* — el frontend **no** lee/escribe la cookie; solo envía cookies del browser en cada `fetch` |
| `sessionStorage` | No | — |
| Sync entre pestañas | Sí | `AuthContext` escucha `storage` cuando `e.key === 'access'` |

Otros `localStorage` **no son auth** (no afectan “estar logueado”, pero tampoco migran de dominio a dominio):

- `villa-cart`, `quoteCheckIn`, `quoteCheckOut`
- `villanet_preferred_currency`
- `searchFilters`, `propertiesScrollPosition`, etc.
- drafts de signup (`useAdvisorSignup` / `usePropertyManagerSignup`)

### Respuesta operativa: ¿los usuarios se desloguean al cambiar de dominio?

**Sí.** `localStorage` está scoped por origen (`scheme + host + port`). Al pasar de `thevillanet.com` (o `www.thevillanet.com`) a `agents.personalvillas.com`:

1. La clave `access` del dominio viejo **no** está disponible en el nuevo.
2. Cualquier cookie de `refresh_token` ligada al dominio viejo (si el backend la setea con `Domain=thevillanet.com` o host-only) **tampoco** viaja al nuevo host, salvo que el backend la reconfigure para el nuevo dominio (y políticas SameSite/Secure).

Los usuarios tendrán que **volver a iniciar sesión** en el nuevo dominio. No hay migración automática posible solo desde el frontend.

---

## 3. Variables de entorno relacionadas al dominio

### `VITE_API_URL`

Usos (todas con fallback `http://localhost:4000`, **nunca** `thevillanet.com` en código):

| Archivo | Uso |
|---------|-----|
| `src/api/api.ts` | `export const API_URL = import.meta.env.VITE_API_URL \|\| 'http://localhost:4000'` |
| `src/api/availability.ts` | misma patrón |
| `src/api/early-access.ts` | misma patrón |
| `src/services/advisorService.ts` | misma patrón |
| `src/services/propertyManagerService.ts` | misma patrón |
| `src/pages/AdvisorProfile.tsx` | misma patrón |

### `VITE_SITE_URL`

Único uso en código:

| Archivo | Uso |
|---------|-----|
| `src/components/SEO.tsx` | Base para canonical / OG; fallback `window.location.origin` |

**No** hay valor hardcodeado de `thevillanet.com` asociado a esta variable en el repo.

### Archivos `.env` en el repo

- `.gitignore` ignora: `.env`, `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local`
- Glob de `.env*` en el workspace: **0 archivos** (no hay `.env` / `.env.production` versionados ni presentes localmente en este checkout)

Por tanto: el valor real de `VITE_SITE_URL` / `VITE_API_URL` en prod/staging vive en el **panel de Render (o CI)**, no en el código. Para la migración hay que actualizar esas env vars en el hosting:

- `VITE_SITE_URL` → p. ej. `https://agents.personalvillas.com`
- `VITE_API_URL` → URL del backend correspondiente al nuevo dominio (si también cambia)

---

## 4. reCAPTCHA

| Ítem | Valor |
|------|-------|
| Variable | `VITE_RECAPTCHA_SITE_KEY` |
| Archivo | `src/pages/Properties.tsx` (único uso funcional) |
| Fallback hardcodeado en código | `6LdrJh0sAAAAAPy3DKaQXrWS_YLJeEtRCN4E4wNj` |

```105:105:src/pages/Properties.tsx
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LdrJh0sAAAAAPy3DKaQXrWS_YLJeEtRCN4E4wNj';
```

Uso:

- Carga script: `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
- Ejecución: `grecaptcha.execute(RECAPTCHA_SITE_KEY, …)` al buscar listados (envía `recaptchaToken` al backend)

**Acción para Google reCAPTCHA:** agregar el dominio `agents.personalvillas.com` (y quitar/mantener el viejo según política) a la site key correspondiente, o emitir una site key nueva y setear `VITE_RECAPTCHA_SITE_KEY` en Render. El fallback hardcodeado también quedará atado a dominios permitidos en Google; conviene no depender del fallback en prod.

---

## Checklist resumido para el cambio de dominio (frontend)

| Acción | Dónde |
|--------|--------|
| Agregar `agents.personalvillas.com` a `allowedHosts` (y decidir si se retiran los viejos) | `vite.config.ts` |
| Actualizar Sitemap URL | `public/robots.txt` |
| Actualizar todas las `<loc>` | `public/sitemap.xml` |
| Setear `VITE_SITE_URL=https://agents.personalvillas.com` | Env de Render / CI |
| Verificar / actualizar `VITE_API_URL` | Env de Render / CI |
| Actualizar dominios permitidos de la site key (o nueva key + `VITE_RECAPTCHA_SITE_KEY`) | Google reCAPTCHA + env |
| Rebuild/redeploy | para regenerar `dist/` |
| Comunicar a usuarios: re-login obligatorio | `localStorage` no migra entre dominios |
| Coordinar cookies de refresh en backend | `Domain` / SameSite del `refresh_token` |

**Fuera de alcance de este audit (pero relevante):** CORS y cookie `Domain` en el backend; DNS/CDN; redirects 301 desde `thevillanet.com`.
