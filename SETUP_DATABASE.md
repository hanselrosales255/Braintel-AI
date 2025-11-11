# 🗄️ SETUP DE BASE DE DATOS SUPABASE

## ⚠️ IMPORTANTE: Debes ejecutar estos pasos

### 📋 Paso 1: Acceder a Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Abre tu proyecto `ofqcvgwpokcwuclcqwcs`
3. Ve a la sección **SQL Editor** en el menú lateral

### 📝 Paso 2: Ejecutar el Schema

1. Haz clic en **"New Query"**
2. Copia TODO el contenido del archivo `supabase/sql/schema.sql`
3. Pégalo en el editor SQL
4. Haz clic en **"Run"** (botón verde en la esquina inferior derecha)

### ✅ Paso 3: Verificar Tablas Creadas

Después de ejecutar el schema, verifica que se crearon las siguientes tablas en la sección **Table Editor**:

- ✅ `profiles` - Perfiles de usuario
- ✅ `subscriptions` - Suscripciones de Stripe
- ✅ `companies` - Empresas (opcional)
- ✅ `ai_agents` - Configuración de agentes IA
- ✅ `interactions` - Registro de interacciones

### 🔧 Paso 4: Verificar RLS (Row Level Security)

En la sección **Authentication** → **Policies**, verifica que existan las políticas de seguridad:

- `Users can view own profile`
- `Users can update own profile`
- `Users can view own subscriptions`
- `Users can view own companies`
- Etc.

### 🎯 ¿Qué hace este schema?

1. **Crea las tablas necesarias** para usuarios, suscripciones, empresas, agentes IA e interacciones
2. **Configura triggers automáticos** para:
   - Crear un perfil cuando un usuario se registra
   - Actualizar timestamps automáticamente
3. **Habilita Row Level Security (RLS)** para que cada usuario solo vea sus propios datos
4. **Crea índices** para mejorar el rendimiento de las consultas

### ⚡ Después de ejecutar el schema

Una vez que el schema esté creado, podrás:

- ✅ **Registrarte** en `/auth.html`
- ✅ **Hacer login** en `/auth.html`
- ✅ **Comprar un plan** en `/#precios`
- ✅ **Acceder al dashboard** en `/dashboard.html`

### 🆘 ¿Problemas?

Si ves errores al ejecutar el schema:

1. **"relation already exists"**: Algunas tablas ya existen, está bien
2. **"permission denied"**: Asegúrate de estar usando el proyecto correcto
3. **"syntax error"**: Copia de nuevo el schema completo desde `supabase/sql/schema.sql`

### 🔥 IMPORTANTE: Configuración de Email

Para que el registro funcione, debes configurar el email en Supabase:

1. Ve a **Authentication** → **Email Templates**
2. Activa **"Confirm signup"**
3. O deshabilita la confirmación de email en **Settings** → **Authentication** → **Email Auth** → Desmarca "Enable email confirmations"

---

**💡 Tip**: Después de ejecutar el schema, reinicia el servidor Node.js con `npm run dev` para asegurarte de que todo esté sincronizado.
