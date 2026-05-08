# 🔐 README — Autenticación con Google

## 📋 Objetivo

Implementar autenticación social mediante Google utilizando Firebase Authentication en React.

---

# ⚙️ Configuración en Firebase

## 1. Ingresar a Firebase

Abrir:

https://console.firebase.google.com/

Seleccionar el proyecto:

```text
reservalapp
```

---

## 2. Activar Google Authentication

Ir a:

```text
Authentication → Sign-in method
```

Habilitar:

```text
Google
```

Agregar:

- Correo de soporte
- Nombre de la aplicación

Guardar cambios.

---

# 💻 Implementación en React

## 1. Importar provider

```javascript
import {
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
```

---

## 2. Crear provider

```javascript
const googleProvider = new GoogleAuthProvider()
```

---

## 3. Implementar login

```javascript
const result = await signInWithPopup(
  auth,
  googleProvider
)

const user = result.user
```

---

# 🗂️ Registro en Firestore

Se almacena:

- nombre
- correo
- foto
- uid

Colección:

```text
usuarios
```

---

# 📊 Historial de sesiones

Se registra:

- método
- usuario
- tiempoInicio
- estado

Colección:

```text
historial
```

---

# ✅ Evidencias

Se verifica en Firebase Authentication:

- Usuario registrado
- Método google.com habilitado

Además:

- Inicio de sesión funcional
- Historial almacenado en Firestore