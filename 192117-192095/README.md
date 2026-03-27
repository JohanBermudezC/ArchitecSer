# ⚽ CanchaYa

> Plataforma web para la reserva de canchas deportivas de forma rápida y sencilla.

---

## 📋 Descripción

**CanchaYa** es una aplicación web desarrollada en React que permite a los usuarios registrarse, iniciar sesión y gestionar reservas de canchas deportivas. Incluye un sistema completo de autenticación con Firebase, incluyendo recuperación de contraseña por correo electrónico.

---

## 👥 Integrantes

| Nombre | Código |
|---|---|
| Johan Bermudez | 192117 |
| Andres Franco | 192095 |

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [React](https://react.dev/) | Librería principal de UI |
| [Vite](https://vitejs.dev/) | Bundler y entorno de desarrollo |
| [React Router DOM](https://reactrouter.com/) | Navegación entre páginas |
| [Firebase Authentication](https://firebase.google.com/docs/auth) | Autenticación de usuarios y recuperación de contraseña |

---

## 📁 Estructura del proyecto

```
CanchaYa/
├── public/
│   └── vite.svg
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx            # Página de inicio de sesión
│   │   ├── RegisterPage.jsx         # Página de registro
│   │   ├── ForgotPasswordPage.jsx   # Solicitud de recuperación de contraseña
│   │   └── ResetPasswordPage.jsx    # Restablecimiento de contraseña
│   ├── firebase.js                  # Configuración e inicialización de Firebase
│   ├── App.jsx                      # Componente raíz y definición de rutas
│   └── main.jsx                     # Punto de entrada de la aplicación
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔐 Flujo de autenticación

```
/login  ──►  /forgot  ──►  (correo enviado por Firebase)  ──►  /reset-password?oobCode=...
```

1. El usuario ingresa su correo en `/forgot`
2. Firebase envía un enlace al correo registrado
3. Al hacer clic en el enlace, llega a `/reset-password` con un código único
4. El usuario ingresa y confirma su nueva contraseña

---

## 🚀 Instrucciones para ejecutar en local

### 1. Clonar el repositorio

```bash
git clone https://github.com/JohanBermudezC/ArchitecSer.git
cd ArchitecSer
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

Crea el archivo `src/firebase.js` con tu configuración de Firebase:

```js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app
```

> ⚠️ **Importante:** Nunca subas tu `firebase.js` real con las credenciales al repositorio. Agrégalo al `.gitignore`.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📄 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción |
| `npm run preview` | Previsualiza el build de producción |

---

## ⚙️ Requisitos previos

- Node.js >= 18
- Cuenta en [Firebase](https://firebase.google.com/) con Authentication habilitado (Email/Password)
