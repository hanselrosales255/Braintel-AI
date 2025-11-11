# 🎯 GUÍA RÁPIDA - EMPEZAR EN 30 SEGUNDOS

---

## ⚡ INICIO RÁPIDO

### 1️⃣ Ejecutar Schema SQL (2 min)
```
https://supabase.com/dashboard → Proyecto ofqcvgwpokcwuclcqwcs
→ SQL Editor → New query → Copiar supabase/sql/schema.sql → Run
```

### 2️⃣ Iniciar Servidor (10 seg)
```powershell
cd c:\Users\Hansel\Desktop\braintel-ai
node server/create-checkout-session.js
```

### 3️⃣ Abrir App (10 seg)
```
http://localhost:3000/auth.html
F12 (abrir consola)
```

### 4️⃣ Login (30 seg)
```
Email: adolfohernandezpnl5@gmail.com
Contraseña: Ian1028#
```

---

## 📚 DOCUMENTACIÓN DISPONIBLE

| Archivo | Propósito | Tiempo |
|---------|-----------|--------|
| **CHECKLIST_LOGIN.md** | Lista de verificación visual paso a paso | 5 min |
| **PASOS_CRITICOS_PARA_LOGIN.md** | Guía detallada con solución de problemas | 10 min |
| **MEJORAS_COMPLETADAS.md** | Resumen ejecutivo de todas las mejoras | 15 min |
| **BACKEND_FIX.md** | Explicación de correcciones de backend | 10 min |
| **SETUP_DATABASE.md** | Configuración de base de datos Supabase | 5 min |

---

## ✅ LO QUE FUNCIONA AHORA

### Backend Robusto
- ✅ Middleware de autenticación (requireAuth, optionalAuth)
- ✅ Validadores de entrada (email, password, checkout)
- ✅ Endpoints de API (/api/auth/session, /api/subscription/active)
- ✅ Manejo de errores personalizado

### Frontend Optimizado
- ✅ Logging detallado con emojis (🔐✅❌📡🛒)
- ✅ Mensajes de error personalizados
- ✅ Validación de contraseña en tiempo real
- ✅ Barra de fuerza de contraseña visual
- ✅ UX mejorada con setTimeout antes de redirigir

### Base de Datos
- ✅ Schema SQL completo (393 líneas)
- ✅ 5 tablas: profiles, subscriptions, companies, ai_agents, interactions
- ✅ RLS habilitado con políticas específicas
- ✅ Triggers automáticos (handle_new_user, update_updated_at)
- ✅ Índices optimizados

---

## 🚨 IMPORTANTE

**Sin ejecutar el schema SQL, NADA funcionará.**

El archivo `supabase/sql/schema.sql` DEBE ejecutarse en Supabase SQL Editor antes de usar la aplicación.

---

## 🐛 PROBLEMAS COMUNES

| Error | Solución Rápida |
|-------|-----------------|
| "Email o contraseña incorrectos" | Registrarse primero o verificar contraseña exacta |
| "Debes confirmar tu email" | Desactivar email confirmations en Supabase |
| "fetch failed" | Verificar que servidor esté corriendo |
| No ves logs | Abrir DevTools (F12) → Console |
| Tabla no existe | Ejecutar schema SQL en Supabase |

---

## 📞 SIGUIENTE PASO

**Empieza con:** `CHECKLIST_LOGIN.md`

Es una lista de verificación visual de 5 minutos que te llevará paso a paso.

---

## 🎉 ¡LISTO PARA USAR!

Todo está configurado y documentado. Solo necesitas ejecutar el schema SQL y podrás hacer login inmediatamente.

**¡Tu aplicación tiene un backend robusto y un frontend optimizado!** 🚀
