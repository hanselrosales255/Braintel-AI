# 🚀 Guía de Deployment - BrainCore

## 📋 Tabla de Contenidos

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment en Railway](#deployment-en-railway)
3. [Deployment en Vercel](#deployment-en-vercel)
4. [Deployment en Heroku](#deployment-en-heroku)
5. [Deployment en Render](#deployment-en-render)
6. [Configuración de Dominio Personalizado](#configuración-de-dominio-personalizado)
7. [Configuración de Stripe Webhook](#configuración-de-stripe-webhook)
8. [Monitoreo Post-Deployment](#monitoreo-post-deployment)

---

## ✅ Pre-Deployment Checklist

### 1. Verificar Código

```bash
# Lint y format
npm run check

# Testing local
npm run dev
# Probar todos los flujos principales

# Build (si aplica)
npm run build
```

### 2. Variables de Entorno

Asegúrate de tener preparadas TODAS estas variables:

```env
# SUPABASE
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anon
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role

# STRIPE (PRODUCCIÓN)
STRIPE_PUBLIC_KEY=pk_live_XXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXX

# Stripe Price IDs (PRODUCCIÓN)
STRIPE_PRICE_STARTER=price_live_XXXXXXXX
STRIPE_PRICE_BUSINESS=price_live_XXXXXXXX
STRIPE_PRICE_ULTRA=price_live_XXXXXXXX

# APPLICATION
NODE_ENV=production
PORT=3000
APP_URL=https://tu-dominio.com

# SECURITY
SESSION_SECRET=genera_un_secret_fuerte_aleatorio
CORS_ORIGIN=https://tu-dominio.com

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Cambiar a Modo Producción en Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle de "Test mode" a "Live mode" (esquina superior derecha)
3. Obtén las nuevas claves de producción
4. Crea productos de producción (o activa los existentes)
5. Anota los nuevos Price IDs

### 4. Actualizar Constants.js

En `public/js/utils/constants.js`, actualiza con valores de producción:

```javascript
export const STRIPE_CONFIG = {
  PUBLIC_KEY: 'pk_live_XXXXXXXX', // Clave de producción
  PRICES: {
    STARTER: 'price_live_XXXXXXXX',
    BUSINESS: 'price_live_XXXXXXXX',
    ULTRA: 'price_live_XXXXXXXX',
  },
};
```

---

## 🚂 Deployment en Railway

### Ventajas

- ✅ Fácil y rápido
- ✅ Auto-deployment desde GitHub
- ✅ Escalado automático
- ✅ $5 gratis al mes

### Pasos

1. **Crear cuenta en Railway**

   ```
   https://railway.app
   Sign Up with GitHub
   ```

2. **Nuevo Proyecto**

   ```
   New Project > Deploy from GitHub repo
   Seleccionar tu repositorio braincore-ai
   ```

3. **Configurar Variables de Entorno**

   ```
   Settings > Variables
   Agregar todas las variables del .env
   ```

4. **Configurar Build**

   ```
   Settings > Build
   Build Command: npm install
   Start Command: npm start
   ```

5. **Generar Dominio**

   ```
   Settings > Domains
   Generate Domain
   Copiar URL: tu-app.up.railway.app
   ```

6. **Actualizar APP_URL**

   ```
   Volver a Variables
   APP_URL=https://tu-app.up.railway.app
   ```

7. **Deploy**
   ```
   Railway detecta cambios y hace deploy automático
   Ver logs en tiempo real
   ```

### Comandos útiles Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Link proyecto
railway link

# Ver logs
railway logs

# Variables
railway variables

# Deploy manual
railway up
```

---

## ⚡ Deployment en Vercel

### Ventajas

- ✅ Extremadamente rápido
- ✅ CDN global
- ✅ Dominio SSL gratis
- ✅ Ideal para frontend

### ⚠️ Limitación

Vercel es principalmente para sitios estáticos. Para el backend:

- Opción A: Usar Vercel Serverless Functions
- Opción B: Backend en Railway/Render + Frontend en Vercel

### Pasos (Frontend + Serverless Backend)

1. **Instalar Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login**

   ```bash
   vercel login
   ```

3. **Configurar proyecto**

   ```bash
   vercel
   # Responder preguntas:
   # - Link to existing project? No
   # - Project name: braincore
   # - Directory: ./
   # - Override settings? No
   ```

4. **Configurar Variables**

   ```bash
   # En dashboard de Vercel o por CLI
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   # ... etc
   ```

5. **Deploy**
   ```bash
   vercel --prod
   ```

### Configuración vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/create-checkout-session.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/create-checkout-session.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🟣 Deployment en Heroku

### Ventajas

- ✅ Muy popular
- ✅ Fácil escalado
- ✅ Muchos add-ons

### ⚠️ Limitación

Ya no hay plan gratuito (desde 2022)

### Pasos

1. **Crear cuenta**

   ```
   https://heroku.com
   Sign Up
   ```

2. **Instalar CLI**

   ```bash
   # Windows (con Chocolatey)
   choco install heroku-cli

   # O descargar installer:
   https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Login**

   ```bash
   heroku login
   ```

4. **Crear app**

   ```bash
   heroku create braincore-app
   ```

5. **Configurar Variables**

   ```bash
   heroku config:set SUPABASE_URL=https://...
   heroku config:set STRIPE_SECRET_KEY=sk_live_...
   # etc...
   ```

6. **Deploy**

   ```bash
   git push heroku main
   ```

7. **Abrir app**
   ```bash
   heroku open
   ```

### Procfile

Crear archivo `Procfile` en la raíz:

```
web: node server/create-checkout-session.js
```

---

## 🎨 Deployment en Render

### Ventajas

- ✅ Plan gratuito disponible
- ✅ Auto-deployment
- ✅ PostgreSQL gratuito
- ✅ Fácil configuración

### Pasos

1. **Crear cuenta**

   ```
   https://render.com
   Sign Up with GitHub
   ```

2. **New Web Service**

   ```
   Dashboard > New > Web Service
   Connect Repository: braincore-ai
   ```

3. **Configurar**

   ```
   Name: braincore
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free (o Starter $7/mes)
   ```

4. **Variables de Entorno**

   ```
   Environment > Add Environment Variable
   Agregar todas las variables
   ```

5. **Deploy**

   ```
   Render detecta y despliega automáticamente
   ```

6. **Custom Domain (opcional)**
   ```
   Settings > Custom Domains
   Add Custom Domain
   ```

---

## 🌐 Configuración de Dominio Personalizado

### 1. Comprar Dominio

Proveedores recomendados:

- [Namecheap](https://namecheap.com)
- [GoDaddy](https://godaddy.com)
- [Google Domains](https://domains.google)

### 2. Configurar DNS

#### Para Railway

```
Type: A
Host: @
Value: [IP de Railway]

Type: CNAME
Host: www
Value: tu-app.up.railway.app
```

#### Para Vercel

```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

#### Para Render

```
Type: A
Host: @
Value: [IP de Render]

Type: CNAME
Host: www
Value: tu-app.onrender.com
```

### 3. Verificar Dominio

En tu plataforma de hosting:

```
Settings > Domains > Add Custom Domain
Ingresar: tudominio.com
Verificar DNS
```

### 4. Configurar SSL

La mayoría de plataformas proveen SSL automático:

```
Settings > SSL/TLS
Enable Auto-SSL
```

Espera 24-48 horas para propagación completa.

---

## 🔔 Configuración de Stripe Webhook

### ¿Por qué es necesario?

Los webhooks permiten que Stripe notifique a tu servidor sobre eventos importantes:

- Pago exitoso
- Suscripción cancelada
- Pago fallido
- etc.

### Pasos

1. **Ir a Stripe Dashboard**

   ```
   Developers > Webhooks > Add endpoint
   ```

2. **Configurar Endpoint**

   ```
   URL: https://tu-dominio.com/stripe-webhook
   Description: BrainCore Production Webhook
   ```

3. **Seleccionar Eventos**

   ```
   checkout.session.completed
   customer.subscription.created
   customer.subscription.updated
   customer.subscription.deleted
   payment_intent.succeeded
   payment_intent.payment_failed
   ```

4. **Obtener Signing Secret**

   ```
   Copiar el whsec_XXXXXXXX
   Agregar a variables de entorno:
   STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXX
   ```

5. **Implementar Handler**

En `server/stripe-webhook.js`:

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Activar suscripción en DB
      break;
    case 'customer.subscription.deleted':
      // Desactivar suscripción en DB
      break;
  }

  res.json({ received: true });
});

module.exports = router;
```

6. **Testing**

   ```bash
   # Instalar Stripe CLI
   stripe listen --forward-to localhost:3000/stripe-webhook

   # Trigger test event
   stripe trigger checkout.session.completed
   ```

---

## 📊 Monitoreo Post-Deployment

### 1. Error Tracking con Sentry

```bash
npm install @sentry/node @sentry/integrations
```

```javascript
// server/create-checkout-session.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 2. Analytics con Google Analytics

En `public/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. Uptime Monitoring

Servicios recomendados:

- [UptimeRobot](https://uptimerobot.com) - Gratis
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

Configuración:

```
Monitor Type: HTTP(s)
URL: https://tudominio.com/health
Interval: 5 minutos
Alert: Email/SMS cuando down
```

### 4. Logs Centralizados

#### Opción A: Logtail

```bash
npm install winston-logtail
```

```javascript
const winston = require('winston');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

const logger = winston.createLogger({
  transports: [new LogtailTransport(logtail)],
});
```

#### Opción B: Railway Logs

```bash
railway logs --tail
```

---

## 🔄 CI/CD con GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

### Funcionalidad

- [ ] Todas las páginas cargan correctamente
- [ ] Autenticación funciona
- [ ] Checkout de Stripe funciona
- [ ] Dashboard muestra datos
- [ ] Webhook de Stripe configurado y funcionando

### Seguridad

- [ ] HTTPS habilitado
- [ ] Variables de entorno en producción
- [ ] API keys no expuestas
- [ ] CORS configurado
- [ ] Rate limiting activo

### Performance

- [ ] Lighthouse score >90
- [ ] Tiempo de carga <3s
- [ ] Compresión activa

### Monitoreo

- [ ] Error tracking configurado
- [ ] Analytics configurado
- [ ] Uptime monitoring activo
- [ ] Logs accesibles

### Backups

- [ ] Backup de Supabase configurado
- [ ] Código en GitHub
- [ ] Documentación actualizada

---

## 🆘 Troubleshooting

### Problema: 502 Bad Gateway

**Causas comunes:**

- Puerto incorrecto
- Variable PORT no configurada
- Servidor no arranca

**Solución:**

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server on port ${PORT}`);
});
```

### Problema: CORS errors

**Solución:**

```javascript
app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  })
);
```

### Problema: Variables de entorno no se leen

**Solución:**

```bash
# Verificar que están configuradas
railway variables
# o
heroku config
# o
vercel env ls
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisar logs: `railway logs --tail`
2. Verificar [TESTING.md](./TESTING.md)
3. GitHub Issues: [Reportar problema](https://github.com/tu-repo/issues)
4. Email: support@braincore.ai

---

**¡Deployment exitoso! 🎉**
