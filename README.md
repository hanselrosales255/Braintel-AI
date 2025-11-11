# 🧠 BrainCore - Teleoperadora Virtual con IA

<div align="center">

![BrainCore Logo](./public/assets/BrainCoreLogo_sin_Fondo.png)

**Revoluciona tu atención al cliente con Inteligencia Artificial**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [Arquitectura](#-arquitectura) • [Deployment](#-deployment)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🚀 Acerca del Proyecto

**BrainCore** es una plataforma SaaS de teleoperadora virtual impulsada por Inteligencia Artificial que automatiza la atención al cliente 24/7. Integra tecnologías de última generación como Gemini (IA conversacional), ElevenLabs (síntesis de voz natural) y Twilio (comunicaciones) para ofrecer interacciones realistas y personalizadas.

### ¿Por qué BrainCore?

- ✅ **Atención 24/7** sin interrupciones ni costos de personal
- ✅ **Escalabilidad** para manejar miles de llamadas simultáneas
- ✅ **Personalización total** del comportamiento del agente
- ✅ **Analytics en tiempo real** con métricas detalladas
- ✅ **Integración sencilla** con tus sistemas existentes

---

## ✨ Características

### 🎯 Core Features

- **Teleoperadora con IA**: Conversaciones naturales con voz sintetizada
- **Multi-canal**: Teléfono + WhatsApp + Web
- **Dashboard en tiempo real**: Monitoreo de llamadas y estadísticas
- **Configuración personalizada**: Ajusta el tono, idioma y comportamiento del agente
- **Sistema de suscripciones**: 3 planes con Stripe Checkout integrado
- **Analytics avanzado**: Gráficos, métricas y reportes exportables

### 🔐 Seguridad

- Autenticación segura con Supabase
- Rate limiting y protección DDoS
- Headers de seguridad con Helmet
- Sanitización de entradas
- Encriptación SSL/TLS

### 🎨 UI/UX

- Diseño moderno con Tailwind CSS
- Tema oscuro optimizado
- Animaciones suaves y micro-interacciones
- Totalmente responsive (móvil, tablet, desktop)
- Skeleton loaders y estados de carga
- Notificaciones toast personalizadas

---

## 🛠️ Tecnologías

### Frontend

- **HTML5, CSS3, JavaScript** (ES6+)
- **Tailwind CSS** - Framework de utilidades CSS
- **Chart.js** - Gráficos interactivos
- **Animate.css** - Animaciones CSS
- **Lottie** - Animaciones vectoriales
- **Remix Icons** - Iconografía

### Backend

- **Node.js** v18+
- **Express.js** - Framework web
- **Stripe** - Procesamiento de pagos
- **Supabase** - Base de datos y autenticación
- **Helmet** - Seguridad HTTP headers
- **Morgan** - Logging HTTP
- **Compression** - Compresión gzip

### Servicios Externos

- **Supabase**: Base de datos PostgreSQL + Auth + Realtime
- **Stripe**: Pagos y suscripciones
- **ElevenLabs** (opcional): Síntesis de voz
- **Twilio** (opcional): Telefonía cloud

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

```bash
node >= 18.0.0
npm >= 9.0.0
git
```

Verifica las versiones:

```bash
node --version
npm --version
git --version
```

### Cuentas Necesarias

1. **Supabase** - [Crear cuenta gratuita](https://supabase.com)
2. **Stripe** - [Crear cuenta](https://stripe.com)
3. **ElevenLabs** (opcional) - [Crear cuenta](https://elevenlabs.io)
4. **Twilio** (opcional) - [Crear cuenta](https://twilio.com)

---

## 🔧 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/braincore-ai.git
cd braincore-ai
```

### 2. Instalar Dependencias

```bash
npm install
```

Si encuentras errores, intenta:

```bash
npm run clean
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos reales (ver sección [Configuración](#️-configuración))

### 4. Configurar Supabase

#### Crear Proyecto en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Anota la URL y las API Keys

#### Crear Tablas

Ejecuta este SQL en el editor SQL de Supabase:

```sql
-- Tabla de perfiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID DEFAULT uuid_generate_v4(),
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID,
  stripe_customer_id TEXT,
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  price_id TEXT,
  status TEXT DEFAULT 'pending',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de llamadas
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID,
  name TEXT,
  phone TEXT,
  dni TEXT,
  service TEXT,
  call_timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  recording_url TEXT,
  notes TEXT,
  sentiment_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuración de agentes
CREATE TABLE agent_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID UNIQUE,
  name TEXT,
  voice TEXT,
  language TEXT DEFAULT 'es',
  tone TEXT DEFAULT 'professional',
  training_text TEXT,
  max_call_duration INTEGER DEFAULT 10,
  enable_transfer BOOLEAN DEFAULT true,
  enable_recording BOOLEAN DEFAULT true,
  enable_analytics BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_calls_client_id ON calls(client_id);
CREATE INDEX idx_calls_timestamp ON calls(call_timestamp DESC);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (los usuarios solo ven sus propios datos)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own calls" ON calls FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Users can view own agent config" ON agent_configs FOR SELECT USING (company_id = auth.uid());
CREATE POLICY "Users can update own agent config" ON agent_configs FOR ALL USING (company_id = auth.uid());
```

### 5. Configurar Stripe

#### Obtener API Keys

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. En **Developers > API Keys**, copia:
   - Publishable key (pk*test*...)
   - Secret key (sk*test*...)

#### Crear Productos y Precios

1. Ve a **Productos** en Stripe Dashboard
2. Crea 3 productos con suscripción mensual:
   - **Starter**: 329€/mes
   - **Business**: 719€/mes
   - **Ultra**: 1399€/mes
3. Anota los Price IDs (price\_...)

---

## ⚙️ Configuración

### Archivo .env Completo

```env
# SUPABASE
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anon
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role

# STRIPE
STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_webhook

STRIPE_PRICE_STARTER=price_tu_precio_starter
STRIPE_PRICE_BUSINESS=price_tu_precio_business
STRIPE_PRICE_ULTRA=price_tu_precio_ultra

# APPLICATION
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# SECURITY
SESSION_SECRET=genera-un-secret-aleatorio-seguro-aqui
CORS_ORIGIN=http://localhost:3000

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OPCIONAL: ELEVENLABS
ELEVENLABS_API_KEY=tu_api_key

# OPCIONAL: TWILIO
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Actualizar constantes en el código

Edita `public/js/utils/constants.js` y actualiza:

```javascript
export const SUPABASE_CONFIG = {
  URL: 'tu_url_de_supabase',
  ANON_KEY: 'tu_anon_key',
};

export const STRIPE_CONFIG = {
  PUBLIC_KEY: 'tu_stripe_public_key',
  PRICES: {
    STARTER: 'tu_price_id_starter',
    BUSINESS: 'tu_price_id_business',
    ULTRA: 'tu_price_id_ultra',
  },
};
```

---

## 🎯 Uso

### Modo Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

### Modo Producción

```bash
npm start
```

### Scripts Disponibles

```bash
npm run dev          # Desarrollo con nodemon (auto-reload)
npm start            # Producción
npm run lint         # Revisar código con ESLint
npm run lint:fix     # Corregir errores de ESLint automáticamente
npm run format       # Formatear código con Prettier
npm run check        # Lint + Format
npm run clean        # Eliminar node_modules
npm run reinstall    # Reinstalar dependencias
```

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
braincore-ai/
├── public/                      # Frontend (archivos estáticos)
│   ├── assets/                  # Imágenes, logos, favicons
│   ├── js/
│   │   ├── utils/               # Utilidades compartidas
│   │   │   ├── constants.js     # Constantes globales
│   │   │   ├── helpers.js       # Funciones auxiliares
│   │   │   └── supabaseClient.js # Cliente Supabase centralizado
│   │   ├── auth.js              # Lógica de autenticación
│   │   └── checkout.js          # Lógica de checkout Stripe
│   ├── index.html               # Página principal (landing)
│   ├── auth.html                # Página de autenticación
│   └── dashboard.html           # Dashboard principal
├── server/                      # Backend (Node.js)
│   ├── create-checkout-session.js # Servidor principal
│   ├── stripe-webhook.js        # Webhook de Stripe (futuro)
│   └── n8n-webhook.js           # Integración n8n (futuro)
├── supabase/                    # Configuración Supabase
│   └── sql/
│       └── schema.sql           # Esquema de base de datos
├── config/                      # Archivos de configuración
├── .env.example                 # Ejemplo de variables de entorno
├── .gitignore                   # Archivos ignorados por Git
├── jsconfig.json                # Configuración JavaScript
├── package.json                 # Dependencias y scripts
├── tailwind.config.js           # Configuración Tailwind CSS
└── README.md                    # Este archivo
```

### Flujo de Datos

```
Usuario → Frontend (HTML/JS) → Supabase Auth
                              ↓
                        Supabase Database
                              ↓
                    Backend (Express.js)
                              ↓
                        Stripe API
                              ↓
                        Webhook → Database Update
```

---

## 🧪 Testing

### Testing Manual

1. **Registro de usuario**:
   - Ve a `/auth.html`
   - Crea una cuenta con email y contraseña
   - Verifica el email

2. **Checkout**:
   - Selecciona un plan en `/#precios`
   - Usa la tarjeta de prueba de Stripe: `4242 4242 4242 4242`
   - Fecha: cualquier fecha futura
   - CVC: cualquier 3 dígitos

3. **Dashboard**:
   - Accede después del pago exitoso
   - Verifica que se muestren las métricas
   - Prueba la configuración del agente

### Tarjetas de Prueba Stripe

```
Éxito:          4242 4242 4242 4242
Requiere 3DS:   4000 0027 6000 3184
Declinada:      4000 0000 0000 0002
Fondos insuf:   4000 0000 0000 9995
```

---

## 🚀 Deployment

### Railway

1. Crea cuenta en [Railway](https://railway.app)
2. Conecta tu repositorio GitHub
3. Configura variables de entorno
4. Deploy automático

### Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### Heroku

```bash
heroku login
heroku create tu-app-braincore
git push heroku main
```

### Configuración de Producción

1. **Variables de entorno**: Configura todas las variables en tu plataforma
2. **SSL/TLS**: Asegúrate de tener HTTPS habilitado
3. **Stripe Webhook**: Configura el endpoint en Stripe Dashboard
4. **Dominio personalizado**: Configura tu dominio
5. **Monitoring**: Configura herramientas de monitoreo (Sentry, LogRocket)

---

## 📚 Documentación Adicional

- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Express.js Docs](https://expressjs.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Chart.js Docs](https://www.chartjs.org/docs)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Contacto

**BrainCore Team**

- Website: [https://braincore.ai](https://braincore.ai)
- Email: [contact@braincore.ai](mailto:contact@braincore.ai)
- GitHub: [@braincore-ai](https://github.com/braincore-ai)

---

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por el backend increíble
- [Stripe](https://stripe.com) por facilitar los pagos
- [Tailwind CSS](https://tailwindcss.com) por el diseño moderno
- [Chart.js](https://www.chartjs.org) por los gráficos interactivos

---

<div align="center">

**⭐ Si este proyecto te ha sido útil, por favor dale una estrella ⭐**

Made with ❤️ by the BrainCore Team

</div>
