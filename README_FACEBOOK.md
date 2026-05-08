# 🔐 README — Autenticación con Facebook

## 📋 Objetivo

Implementar autenticación social con Facebook utilizando Firebase Authentication y Meta Developers.

---

# ⚙️ Configuración en Meta Developers

## 1. Crear aplicación

Ingresar:

https://developers.facebook.com/

Crear aplicación.

Seleccionar:

```text
Autenticar y solicitar datos a usuarios con el inicio de sesión con Facebook
```

---

## 2. Agregar Facebook Login

Agregar producto:

```text
Facebook Login
```

Seleccionar:

```text
Web
```

---

## 3. Configurar URL del sitio

```text
http://localhost:5173
```

---

## 4. Configurar OAuth Redirect URI

Agregar:

```text
https://reservalapp.firebaseapp.com/__/auth/handler
```

---

## 5. Agregar dominios

En Configuración → Básica:

```text
localhost
```

```text
reservalapp.firebaseapp.com
```

---

# ⚙️ Configuración en Firebase

Ir a:

```text
Authentication → Sign-in method → Facebook
```

Agregar:

- App ID
- App Secret

Guardar.

---

# 💻 Implementación en React

## 1. Importar provider

```javascript
import {
  FacebookAuthProvider,
  signInWithPopup
} from 'firebase/auth'
```

---

## 2. Crear provider

```javascript
const facebookProvider = new FacebookAuthProvider()
```

---

## 3. Implementar login

```javascript
const result = await signInWithPopup(
  auth,
  facebookProvider
)

const user = result.user
```

---

# 📊 Registro en Firestore

Se almacena:

- usuario
- método facebook
- tiempoInicio
- estado

---

# ✅ Evidencias

Se verifica:

- Login funcional
- Usuario registrado en Firebase
- Método facebook.com habilitado
- Historial guardado en Firestore