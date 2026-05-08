# 🔐 README — Autenticación con GitHub

## 📋 Objetivo

Implementar autenticación social con GitHub utilizando Firebase Authentication.

---

# ⚙️ Configuración en GitHub

## 1. Crear OAuth App

Ingresar:

https://github.com/settings/developers

Seleccionar:

```text
New OAuth App
```

---

## 2. Configurar aplicación

## Application Name

```text
CanchaYa
```

## Homepage URL

```text
http://localhost:5173
```

## Authorization Callback URL

```text
https://reservalapp.firebaseapp.com/__/auth/handler
```

---

## 3. Obtener credenciales

GitHub genera:

- Client ID
- Client Secret

---

# ⚙️ Configuración en Firebase

Ir a:

```text
Authentication → Sign-in method → GitHub
```

Agregar:

- Client ID
- Client Secret

Guardar.

---

# 💻 Implementación en React

## 1. Importar provider

```javascript
import {
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth'
```

---

## 2. Crear provider

```javascript
const githubProvider = new GithubAuthProvider()
```

---

## 3. Implementar login

```javascript
const result = await signInWithPopup(
  auth,
  githubProvider
)

const user = result.user
```

---

# 📊 Registro en Firestore

Se registra:

- usuario
- método github
- tiempoInicio
- estado

---

# ✅ Evidencias

Se verifica:

- Login GitHub funcional
- Usuario registrado en Firebase
- Método github.com habilitado
- Historial almacenado en Firestore