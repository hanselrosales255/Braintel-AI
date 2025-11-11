# 🚨 PASOS CRÍTICOS PARA HACER LOGIN

**Usuario:** adolfohernandezpnl5@gmail.com  
**Contraseña:** Ian1028#

---

## ⚠️ PASO 1: EJECUTAR SCHEMA SQL (OBLIGATORIO)

**Sin este paso, NADA funcionará** - la base de datos está vacía.

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: `ofqcvgwpokcwuclcqwcs`
3. Ve a **SQL Editor** (ícono de base de datos en el menú izquierdo)
4. Clic en **"+ New query"**
5. Copia TODO el contenido de `supabase/sql/schema.sql`
6. Pégalo en el editor SQL
7. Clic en **"Run"** (botón verde)
8. Espera a que se complete (toma ~10 segundos)
9. Verifica que aparezca: **"Success. No rows returned"**

### Verificar que las tablas se crearon:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Deberías ver:
- profiles
- subscriptions
- companies
- ai_agents
- interactions

---

## 📧 PASO 2: CONFIGURAR EMAIL (IMPORTANTE)

1. En Supabase Dashboard → **Authentication** → **Email Templates**
2. Verifica que esté habilitado: **Confirm signup**
3. Ve a **Settings** → **Auth** → **Email Auth**
4. Verifica:
   - ✅ Enable email confirmations: **DESACTIVADO** (para desarrollo)
   - ✅ Enable email sign-up: **ACTIVADO**

**NOTA:** Con confirmación de email desactivada, podrás hacer login inmediatamente después del registro.

---

## 🔑 PASO 3: CREAR USUARIO (SI NO EXISTE)

### Opción A: Registrarse desde el frontend

1. Abre: http://localhost:3000/auth.html
2. Clic en **"Crear cuenta"**
3. Ingresa:
   - **Email:** adolfohernandezpnl5@gmail.com
   - **Contraseña:** Ian1028#
4. Clic en **"Registrarse"**
5. Verás mensajes en la consola del navegador:
   - 📝 Intentando registrar nuevo usuario...
   - 📡 Enviando solicitud de registro a Supabase...
   - ✅ Registro exitoso

### Opción B: Crear usuario desde Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Clic en **"Add user"** → **"Create new user"**
3. Ingresa:
   - **Email:** adolfohernandezpnl5@gmail.com
   - **Password:** Ian1028#
   - **Auto confirm user:** ✅ ACTIVADO
4. Clic en **"Create user"**

---

## 🚀 PASO 4: HACER LOGIN

1. Asegúrate de que el servidor esté corriendo:
   ```powershell
   cd c:\Users\Hansel\Desktop\braintel-ai
   node server/create-checkout-session.js
   ```

2. Abre: http://localhost:3000/auth.html

3. Ingresa credenciales:
   - **Email:** adolfohernandezpnl5@gmail.com
   - **Contraseña:** Ian1028#

4. Clic en **"Iniciar Sesión"**

5. **Abre la consola del navegador** (F12) para ver el logging detallado:
   ```
   🔐 Intentando iniciar sesión... { email: "adolfohernandezpnl5@gmail.com" }
   📡 Enviando solicitud de login a Supabase...
   ✅ Login exitoso: { userId: "...", email: "..." }
   🔍 Verificando suscripción...
   ```

6. Si el login es exitoso:
   - Verás: **"¡Bienvenido de vuelta!"**
   - Serás redirigido automáticamente en 1 segundo

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Email o contraseña incorrectos"
- ✅ Verifica que el usuario existe en **Authentication** → **Users**
- ✅ Verifica que la contraseña sea exactamente: `Ian1028#`
- ✅ Intenta hacer reset de contraseña

### Error: "Debes confirmar tu email"
- ✅ Ve a **Settings** → **Auth** → **Email Auth**
- ✅ Desactiva: **Enable email confirmations**
- ✅ O confirma el email desde **Authentication** → **Users** → Clic en el usuario → **Confirm email**

### Error: "Error de red" o "fetch failed"
- ✅ Verifica que el servidor esté corriendo en puerto 3000
- ✅ Revisa la consola del servidor para errores
- ✅ Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` estén correctos

### No aparecen mensajes en la consola
- ✅ Abre DevTools (F12)
- ✅ Ve a la pestaña **Console**
- ✅ Refresca la página y vuelve a intentar

### Usuario no se crea con trigger
- ✅ Verifica que el trigger `handle_new_user()` existe:
   ```sql
   SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
- ✅ Si no existe, ejecuta nuevamente el schema SQL completo

---

## ✅ VERIFICACIÓN COMPLETA

Después de completar los pasos, verifica:

1. **Base de datos:**
   ```sql
   SELECT * FROM profiles WHERE email = 'adolfohernandezpnl5@gmail.com';
   ```
   Deberías ver un registro con tu email

2. **Autenticación:**
   ```sql
   SELECT email, created_at, confirmed_at FROM auth.users WHERE email = 'adolfohernandezpnl5@gmail.com';
   ```
   Deberías ver tu usuario

3. **Login funcionando:**
   - Abre http://localhost:3000/auth.html
   - Ingresa credenciales
   - Verifica logging detallado en consola
   - Login exitoso → Redirección automática

---

## 📞 SI SIGUE SIN FUNCIONAR

Comparte:
1. Captura de pantalla de la consola del navegador (F12)
2. Logs del servidor Node.js
3. Resultado de:
   ```sql
   SELECT * FROM profiles WHERE email = 'adolfohernandezpnl5@gmail.com';
   SELECT email FROM auth.users WHERE email = 'adolfohernandezpnl5@gmail.com';
   ```

---

## 🎯 RESUMEN RÁPIDO

```
1. Ejecutar schema SQL en Supabase SQL Editor ✅
2. Desactivar email confirmation en Auth settings ✅
3. Registrar usuario adolfohernandezpnl5@gmail.com ✅
4. Iniciar servidor: node server/create-checkout-session.js ✅
5. Login en http://localhost:3000/auth.html ✅
6. Ver consola para logging detallado (F12) ✅
```

**¡Con estos pasos deberías poder hacer login exitosamente!** 🚀
