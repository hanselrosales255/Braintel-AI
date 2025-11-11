# 🧪 Guía de Testing - BrainCore

## 📋 Tabla de Contenidos

1. [Testing Manual](#testing-manual)
2. [Testing de Flujos Completos](#testing-de-flujos-completos)
3. [Testing de Stripe](#testing-de-stripe)
4. [Testing de Supabase](#testing-de-supabase)
5. [Testing de Rendimiento](#testing-de-rendimiento)
6. [Checklist Pre-Producción](#checklist-pre-producción)

---

## 🔍 Testing Manual

### 1. Testing del Landing Page (index.html)

#### ✅ Checklist Visual

- [ ] El logo se muestra correctamente
- [ ] El menú de navegación funciona en desktop
- [ ] El menú móvil abre y cierra correctamente
- [ ] Los enlaces de navegación hacen scroll suave
- [ ] Las animaciones de Lottie se cargan y reproducen
- [ ] Las tarjetas de beneficios se muestran correctamente
- [ ] Los precios de los planes son correctos
- [ ] Los botones "Comenzar Ahora" están visibles

#### ✅ Funcionalidad

```
1. Abrir http://localhost:3000
2. Verificar que todos los elementos cargan
3. Click en cada enlace del menú
4. Probar el menú móvil (reducir ventana <768px)
5. Click en botón "Comenzar Ahora" de cada plan
6. Verificar redirección a checkout (si hay usuario logueado)
   o redirección a auth.html (si no hay sesión)
```

#### 🐛 Errores Comunes

- **Logo no aparece**: Verificar ruta `/assets/BrainCoreLogo_sin_Fondo.png`
- **Botones no responden**: Abrir consola y verificar errores de checkout.js
- **Animaciones no cargan**: Verificar conexión CDN de Lottie

---

### 2. Testing de Autenticación (auth.html)

#### ✅ Registro de Usuario

**Paso a paso:**

```
1. Ir a http://localhost:3000/auth.html
2. Click en "Regístrate" (si está en modo login)
3. Ingresar email válido: test@example.com
4. Ingresar contraseña: Test1234!@
5. Confirmar contraseña: Test1234!@
6. Aceptar términos y condiciones
7. Click en "Crear Cuenta"
8. Verificar mensaje de éxito
9. Revisar email para confirmación
```

**Validaciones a probar:**

| Campo      | Entrada      | Resultado Esperado                                           |
| ---------- | ------------ | ------------------------------------------------------------ |
| Email      | `invalido`   | Error: "Formato de email inválido"                           |
| Email      | ` ` (vacío)  | Error: "El email es requerido"                               |
| Contraseña | `123`        | Error: "Debe tener al menos 8 caracteres"                    |
| Contraseña | `password`   | Error: "Debe contener mayúscula, número y carácter especial" |
| Confirmar  | `diferente`  | Error: "Las contraseñas no coinciden"                        |
| Términos   | (sin marcar) | Error: "Debes aceptar los términos"                          |

#### ✅ Inicio de Sesión

**Paso a paso:**

```
1. Ir a http://localhost:3000/auth.html
2. Ingresar email: test@example.com
3. Ingresar contraseña: Test1234!@
4. Click en "Iniciar Sesión"
5. Verificar redirección a dashboard.html
```

**Escenarios de error:**

```javascript
// Email no existe
Email: noexiste@example.com
Password: cualquiera
Resultado: "Credenciales inválidas"

// Contraseña incorrecta
Email: test@example.com
Password: incorrecta
Resultado: "Credenciales inválidas"

// Demasiados intentos (después de 5 fallos)
Resultado: "Cuenta bloqueada por 15 minutos"
```

#### ✅ Recuperar Contraseña

```
1. Click en "¿Olvidaste tu contraseña?"
2. Ingresar email registrado
3. Verificar mensaje: "Enlace enviado a tu email"
4. Revisar inbox
5. Click en enlace del email
6. Ingresar nueva contraseña
7. Verificar que puede iniciar sesión con nueva contraseña
```

---

### 3. Testing de Checkout (Stripe)

#### ✅ Flujo Completo de Suscripción

**Plan Starter (329€/mes):**

```
1. En index.html, click en "Comenzar Ahora" del plan Starter
2. Iniciar sesión si no lo has hecho
3. Verificar redirección a Stripe Checkout
4. Completar formulario:
   - Email: test@example.com
   - Número de tarjeta: 4242 4242 4242 4242
   - Fecha: 12/25
   - CVC: 123
   - Nombre: Test User
   - País: España
   - Código postal: 28001
5. Click en "Suscribirse"
6. Esperar procesamiento
7. Verificar redirección a dashboard.html?session_id=...
8. Verificar en dashboard que aparece el plan activo
```

#### ✅ Tarjetas de Prueba Stripe

| Escenario                  | Número de Tarjeta   | Resultado                   |
| -------------------------- | ------------------- | --------------------------- |
| **Éxito**                  | 4242 4242 4242 4242 | Pago exitoso                |
| **Requiere autenticación** | 4000 0027 6000 3184 | Popup 3D Secure             |
| **Declinada**              | 4000 0000 0000 0002 | Error: Tarjeta declinada    |
| **Fondos insuficientes**   | 4000 0000 0000 9995 | Error: Fondos insuficientes |
| **Tarjeta expirada**       | 4000 0000 0000 0069 | Error: Tarjeta expirada     |
| **CVC incorrecto**         | 4000 0000 0000 0127 | Error: CVC incorrecto       |

#### ✅ Testing de Errores

**Error: Sin sesión activa**

```
1. Cerrar sesión (o abrir ventana incógnita)
2. Click en "Comenzar Ahora"
3. Verificar redirección a /auth.html
```

**Error: Plan no válido**

```javascript
// En consola del navegador:
const btn = document.querySelector('[data-price-id]');
btn.dataset.priceId = 'precio_invalido';
btn.click();
// Resultado esperado: Error de precio no válido
```

**Error: Timeout de red**

```javascript
// Simular offline
window.navigator.onLine = false;
// Click en botón de checkout
// Resultado: Error de conexión
```

---

### 4. Testing del Dashboard

#### ✅ Acceso y Permisos

```
1. Sin sesión → Redirige a /auth.html
2. Con sesión pero sin suscripción → Redirige a /#precios
3. Con sesión y suscripción activa → Muestra dashboard
```

#### ✅ Métricas y Estadísticas

**Verificar que se muestran:**

- [ ] Total de llamadas
- [ ] Interacciones usadas vs límite del plan
- [ ] Duración promedio de llamadas
- [ ] Nombre del plan activo
- [ ] Gráfico de llamadas en el tiempo
- [ ] Gráfico de duraciones
- [ ] Tabla de llamadas recientes

**Probar filtros de tiempo:**

```
1. Seleccionar "Hoy" → Ver datos de hoy
2. Seleccionar "7 días" → Ver datos última semana
3. Seleccionar "30 días" → Ver datos último mes
4. Verificar que gráficos se actualizan
```

#### ✅ Configuración del Agente

**Campos obligatorios:**

```
Nombre: Mi Asistente
Código de voz: abc123def456
Entrenamiento: [mínimo 50 caracteres]
```

**Paso a paso:**

```
1. Completar todos los campos
2. Configurar idioma: Español
3. Configurar tono: Profesional
4. Duración máxima: 10 minutos
5. Marcar todas las funcionalidades
6. Click en "Guardar Cambios"
7. Verificar mensaje de éxito
8. Recargar página
9. Verificar que configuración se mantiene
```

**Testing de validación:**

| Campo         | Valor         | Resultado                     |
| ------------- | ------------- | ----------------------------- |
| Nombre        | ` ` (vacío)   | Error obligatorio             |
| Nombre        | `A`           | Error: Mínimo 2 caracteres    |
| Voz           | ` ` (vacío)   | Error obligatorio             |
| Entrenamiento | `Texto corto` | Error: Mínimo 50 caracteres   |
| Entrenamiento | [>5000 chars] | Error: Máximo 5000 caracteres |

#### ✅ Búsqueda y Paginación

```
1. En tabla de llamadas, usar buscador
2. Buscar por: nombre de cliente
3. Buscar por: teléfono
4. Buscar por: servicio
5. Verificar que filtra correctamente
6. Probar paginación (si hay >10 registros)
7. Click en "Siguiente" y "Anterior"
```

#### ✅ Real-Time Updates

```
1. Abrir dashboard en 2 pestañas
2. En una pestaña, simular nueva llamada (insertar en DB)
3. Verificar que la otra pestaña se actualiza automáticamente
4. Verificar indicador "En línea" en tiempo real
```

---

## 💳 Testing de Stripe

### Configuración de Testing

```bash
# 1. Verificar modo test activo
# En Stripe Dashboard: Developers > Overview
# Debe mostrar "Modo de prueba"

# 2. Verificar webhook (opcional)
stripe listen --forward-to localhost:3000/webhook

# 3. Trigger eventos de prueba
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

### Escenarios de Prueba

#### ✅ Suscripción Exitosa

```
1. Checkout con tarjeta 4242 4242 4242 4242
2. Verificar en Stripe Dashboard:
   - Cliente creado
   - Suscripción activa
   - Pago registrado
3. Verificar en Supabase:
   - Registro en tabla subscriptions
   - Status = 'active'
   - Price_id correcto
```

#### ✅ 3D Secure

```
1. Usar tarjeta: 4000 0027 6000 3184
2. Completar autenticación 3DS
3. Verificar flujo completo
```

#### ✅ Pago Declinado

```
1. Usar tarjeta: 4000 0000 0000 0002
2. Verificar error en UI
3. Verificar que NO se crea suscripción
4. Verificar que usuario puede reintentar
```

#### ✅ Cancelación de Checkout

```
1. Iniciar checkout
2. Click en "<- Volver" en Stripe
3. Verificar redirección a cancel_url
4. Verificar que NO se crea suscripción
```

---

## 🗄️ Testing de Supabase

### Testing de Autenticación

```javascript
// En consola del navegador (auth.html):

// 1. Test Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'Test1234!@',
});
console.log('Sign Up:', data, error);

// 2. Test Sign In
const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'Test1234!@',
});
console.log('Sign In:', session, loginError);

// 3. Test Get User
const {
  data: { user },
} = await supabase.auth.getUser();
console.log('Current User:', user);

// 4. Test Sign Out
await supabase.auth.signOut();
console.log('Signed out');
```

### Testing de Database

```javascript
// En consola del navegador (dashboard.html):

// 1. Test Read Calls
const { data: calls } = await supabase.from('calls').select('*').limit(10);
console.log('Calls:', calls);

// 2. Test Insert (requiere permisos)
const { data: newCall, error } = await supabase.from('calls').insert([
  {
    client_id: 'user_id_aqui',
    name: 'Test Cliente',
    phone: '+34612345678',
    service: 'Consulta',
    duration_seconds: 120,
    call_timestamp: new Date().toISOString(),
  },
]);
console.log('New Call:', newCall, error);

// 3. Test Agent Config
const { data: config } = await supabase
  .from('agent_configs')
  .select('*')
  .eq('company_id', 'user_id_aqui')
  .single();
console.log('Agent Config:', config);
```

### Testing de Realtime

```javascript
// Suscribirse a cambios en llamadas
const channel = supabase
  .channel('calls_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'calls',
    },
    (payload) => {
      console.log('Realtime update:', payload);
    }
  )
  .subscribe();

// Para probar: insertar una llamada en otra pestaña
// Deberías ver el log en tiempo real
```

---

## ⚡ Testing de Rendimiento

### Lighthouse Audit

```bash
# Chrome DevTools > Lighthouse
1. Abrir index.html
2. Run Lighthouse audit
3. Objetivos:
   - Performance: >90
   - Accessibility: >95
   - Best Practices: >90
   - SEO: >90
```

### Network Throttling

```
1. Chrome DevTools > Network
2. Seleccionar "Slow 3G"
3. Recargar página
4. Verificar que:
   - Skeleton loaders se muestran
   - Contenido carga progresivamente
   - No hay errores de timeout
```

### Memory Leaks

```javascript
// En consola
1. Abrir dashboard
2. Performance.memory (Chrome)
3. Navegar entre secciones
4. Verificar que memoria no crece indefinidamente
```

---

## ✅ Checklist Pre-Producción

### Seguridad

- [ ] Variables de entorno configuradas en producción
- [ ] API keys no expuestas en código frontend
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo
- [ ] Helmet habilitado con headers seguros
- [ ] HTTPS habilitado
- [ ] Supabase RLS (Row Level Security) activo

### Funcionalidad

- [ ] Todos los flujos de usuario funcionan
- [ ] Autenticación funciona correctamente
- [ ] Checkout de Stripe funciona
- [ ] Dashboard muestra datos reales
- [ ] Real-time updates funcionan
- [ ] Configuración de agente se guarda

### Performance

- [ ] Lighthouse score >90
- [ ] Imágenes optimizadas
- [ ] CSS/JS minificados (en producción)
- [ ] Caché configurado
- [ ] Compression (gzip) activo

### UX/UI

- [ ] Responsive en móvil, tablet, desktop
- [ ] Animaciones fluidas
- [ ] Loading states visibles
- [ ] Error messages claros
- [ ] Notificaciones funcionan
- [ ] Sin errores en consola

### Monitoring

- [ ] Error tracking configurado (ej: Sentry)
- [ ] Analytics configurado (ej: Google Analytics)
- [ ] Logs en producción funcionan
- [ ] Alerts configurados

---

## 🐛 Reporte de Errores

### Template de Bug Report

```markdown
## 🐛 Bug Report

**Descripción:**
[Descripción clara del error]

**Pasos para reproducir:**

1. Ir a...
2. Click en...
3. Ver error...

**Resultado esperado:**
[Qué debería pasar]

**Resultado actual:**
[Qué está pasando]

**Capturas de pantalla:**
[Si aplica]

**Entorno:**

- Navegador: Chrome 120
- OS: Windows 11
- URL: http://localhost:3000/dashboard

**Consola del navegador:**
```

[Errores de la consola]

```

**Network tab:**
[Requests fallidos]
```

---

## 📞 Contacto Soporte

Si encuentras bugs críticos:

- Email: support@braincore.ai
- GitHub Issues: [Reportar bug](https://github.com/tu-repo/issues)

---

**¡Happy Testing! 🚀**
