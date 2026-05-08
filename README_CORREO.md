# 🔐 README — Autenticación Email y Password

## 📋 Objetivo

Implementar autenticación tradicional mediante correo electrónico y contraseña utilizando Firebase Authentication en una aplicación React.

---

# ⚙️ Configuración en Firebase

## 1. Crear proyecto Firebase

Ingresar a:

https://console.firebase.google.com/

Crear el proyecto:

```text
reservalapp
```

---

## 2. Crear aplicación web

Dentro del proyecto:

```text
Agregar aplicación → Web
```

Registrar la aplicación y copiar las credenciales.

---

## 3. Crear archivo firebase.js

Ruta:

```text
src/firebase.js
```

Código:

```javascript
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "reservalapp.firebaseapp.com",
  projectId: "reservalapp",
  storageBucket: "reservalapp.firebasestorage.app",
  messagingSenderId: "XXXXXXXX",
  appId: "XXXXXXXX"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
```

---

## 4. Activar Email y Password

Ir a:

```text
Authentication → Sign-in method
```

Habilitar:

```text
Email/Password
```

Guardar cambios.

---

# 💻 Implementación en React

## 1. Registro de usuarios

Importar:

```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth'
```

Implementación:

```javascript
await createUserWithEmailAndPassword(
  auth,
  email,
  password
)
```

---

## 2. Inicio de sesión

Importar:

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth'
```

Implementación:

```javascript
await signInWithEmailAndPassword(
  auth,
  email,
  password
)
```

---

## 3. Recuperación de contraseña

Importar:

```javascript
import { sendPasswordResetEmail } from 'firebase/auth'
```

Implementación:

```javascript
await sendPasswordResetEmail(
  auth,
  email
)
```

Firebase envía automáticamente un enlace al correo del usuario.

---

# 📊 Registro en Firestore

Se almacena:

- nombre
- correo
- fecha de creación
- uid

Colección:

```text
usuarios
```

---

# 🕒 Historial de sesiones

Se registra:

- método email
- usuario
- tiempoInicio
- tiempoSalida
- duración
- estado

Colección:

```text
historial
```

---

# ✅ Evidencias

Se verifica:

- Registro de usuarios
- Inicio de sesión funcional
- Recuperación de contraseña
- Usuario registrado en Firebase Authentication
- Método password habilitado
- Historial almacenado en Firestore
```