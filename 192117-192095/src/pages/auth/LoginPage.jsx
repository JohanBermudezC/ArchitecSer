import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth'

import { auth, db } from '../../firebase'

import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: '#f8faf8'
  },

  left: {
    flex: '0 0 480px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 56px',
    boxShadow: '2px 0 24px rgba(0,0,0,0.04)'
  },

  right: {
    flex: 1,
    background: 'linear-gradient(160deg, #166534 0%, #15803d 50%, #22c55e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },

  logo: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f0f0f',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  dot: {
    width: '10px',
    height: '10px',
    background: '#22c55e',
    borderRadius: '50%'
  },

  title: {
    fontSize: '30px',
    fontWeight: 800,
    color: '#0f0f0f',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },

  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '36px'
  },

  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '6px',
    display: 'block'
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: '#e5e5e5',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    marginBottom: '4px'
  },

  inputError: {
    borderColor: '#ef4444'
  },

  error: {
    fontSize: '12px',
    color: '#ef4444',
    marginBottom: '14px',
    marginTop: '2px'
  },

  group: {
    marginBottom: '18px'
  },

  btn: {
    width: '100%',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px'
  },

  socialContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px'
  },

  socialBtn: {
    flex: 1,
    background: '#fff',
    color: '#333',
    border: '1.5px solid #e5e5e5',
    padding: '13px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0'
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e5e5'
  },

  dividerText: {
    fontSize: '12px',
    color: '#aaa',
    fontWeight: 500
  },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },

  link: {
    fontSize: '13px',
    color: '#22c55e',
    textDecoration: 'none',
    fontWeight: 500
  },

  registerRow: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#888'
  }
}

const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()
const facebookProvider = new FacebookAuthProvider()

export default function LoginPage() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingGithub, setLoadingGithub] = useState(false)
  const [loadingFacebook, setLoadingFacebook] = useState(false)

  const [firebaseError, setFirebaseError] = useState('')

  const validate = () => {

    const e = {}

    if (!form.email) {
      e.email = 'El correo es obligatorio'
    }

    if (!form.password) {
      e.password = 'La contraseña es obligatoria'
    }

    return e
  }

  const change = (field, value) => {

    setForm(prev => ({
      ...prev,
      [field]: value
    }))

    if (firebaseError) {
      setFirebaseError('')
    }
  }

  const guardarHistorial = async (metodo, email) => {

    await addDoc(collection(db, 'historial'), {
      metodo,
      usuario: email,
      tiempoInicio: serverTimestamp(),
      tiempoSalida: null,
      estado: 'activo'
    })
  }

  const guardarUsuario = async (user) => {

    const userRef = doc(db, 'usuarios', user.uid)

    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {

      await setDoc(userRef, {
        nombre: user.displayName || '',
        email: user.email,
        foto: user.photoURL || '',
        creadoEn: serverTimestamp()
      })
    }
  }

  const handleSubmit = async () => {

    const e = validate()

    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }

    setLoading(true)
    setFirebaseError('')

    try {

      const cred = await signInWithEmailAndPassword(
  auth,
  form.email,
  form.password
)

await guardarHistorial('email', form.email)

const userRef = doc(db, 'usuarios', cred.user.uid)
const userSnap = await getDoc(userRef)

if (userSnap.exists()) {
  const userData = userSnap.data()

    if (userData.rol === 'admin') {
           navigate('/canchas')
        } else {
           navigate('/dashboard')
           }
      } else {
          navigate('/dashboard')
        }

    } catch (error) {

      console.error(error)

      setFirebaseError('Credenciales incorrectas')

    } finally {

      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {

    setLoadingGoogle(true)

    try {

      const result = await signInWithPopup(
        auth,
        googleProvider
      )

      const user = result.user

      await guardarUsuario(user)

      await guardarHistorial(
        'google',
        user.email
      )

      const userRef = doc(db, 'usuarios', user.uid)
        const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
  const userData = userSnap.data()

  if (userData.rol === 'admin') {
    navigate('/canchas')
  } else {
    navigate('/dashboard')
  }
} else {
  navigate('/dashboard')
}

    } catch (error) {

      console.error(error)

      setFirebaseError('Error con Google')

    } finally {

      setLoadingGoogle(false)
    }
  }

  const handleGithubLogin = async () => {

    setLoadingGithub(true)

    try {

      const result = await signInWithPopup(
        auth,
        githubProvider
      )

      const user = result.user

      await guardarUsuario(user)

      await guardarHistorial(
        'github',
        user.email
      )

      const userRef = doc(db, 'usuarios', user.uid)
const userSnap = await getDoc(userRef)

if (userSnap.exists()) {
  const userData = userSnap.data()

  if (userData.rol === 'admin') {
    navigate('/canchas')
  } else {
    navigate('/dashboard')
  }
} else {
  navigate('/dashboard')
}

    } catch (error) {

      console.error(error)

      setFirebaseError('Error con GitHub')

    } finally {

      setLoadingGithub(false)
    }
  }

  const handleFacebookLogin = async () => {

    setLoadingFacebook(true)

    try {

      const result = await signInWithPopup(
        auth,
        facebookProvider
      )

      const user = result.user

      await guardarUsuario(user)

      await guardarHistorial(
        'facebook',
        user.email
      )

      const userRef = doc(db, 'usuarios', user.uid)
    const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
    const userData = userSnap.data()

        if (userData.rol === 'admin') {
    navigate('/canchas')
      } else {
    navigate('/dashboard')
          }
        } else {
          navigate('/dashboard')
      }

    } catch (error) {

      console.error(error)

      setFirebaseError('Error con Facebook')

    } finally {

      setLoadingFacebook(false)
    }
  }

  return (

    <div style={styles.page}>

      <div style={styles.left}>

        <div style={styles.logo}>
          <span style={styles.dot} />
          CanchaYa
        </div>

        <h1 style={styles.title}>
          Bienvenido de nuevo
        </h1>

        <p style={styles.subtitle}>
          Inicia sesión para reservar tu cancha favorita
        </p>

        <div style={styles.group}>

          <label style={styles.label}>
            Correo electrónico
          </label>

          <input
            style={{
              ...styles.input,
              ...(errors.email ? styles.inputError : {})
            }}
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={(e) => change('email', e.target.value)}
          />

        </div>

        <div style={styles.group}>

          <div style={styles.row}>

            <label style={styles.label}>
              Contraseña
            </label>

            <Link to="/forgot" style={styles.link}>
              ¿Olvidaste tu contraseña?
            </Link>

          </div>

          <input
            style={{
              ...styles.input,
              ...(errors.password ? styles.inputError : {})
            }}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => change('password', e.target.value)}
          />

        </div>

        {firebaseError && (

          <div style={{
            ...styles.error,
            textAlign: 'center',
            background: '#fee2e2',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {firebaseError}
          </div>
        )}

        <button
          style={styles.btn}
          onClick={handleSubmit}
          disabled={
            loading ||
            loadingGoogle ||
            loadingGithub ||
            loadingFacebook
          }
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>
            o continúa con
          </span>
          <div style={styles.dividerLine} />
        </div>

        {/* BOTONES HORIZONTALES */}

        <div style={styles.socialContainer}>

          <button
            style={styles.socialBtn}
            onClick={handleGoogleLogin}
          >
            {loadingGoogle ? '...' : 'Google'}
          </button>

          <button
            style={styles.socialBtn}
            onClick={handleGithubLogin}
          >
            {loadingGithub ? '...' : 'GitHub'}
          </button>

          <button
            style={styles.socialBtn}
            onClick={handleFacebookLogin}
          >
            {loadingFacebook ? '...' : 'Facebook'}
          </button>

        </div>

        <div style={styles.registerRow}>

          ¿No tienes cuenta?{' '}

          <Link to="/register" style={styles.link}>
            Regístrate gratis
          </Link>

        </div>

      </div>

      <div style={styles.right}>

        <svg
          style={{ opacity: 0.15, position: 'absolute' }}
          width="400"
          height="400"
          viewBox="0 0 400 400"
        >
          <rect
            x="20"
            y="20"
            width="360"
            height="360"
            fill="none"
            stroke="white"
            strokeWidth="3"
            rx="4"
          />

          <line
            x1="200"
            y1="20"
            x2="200"
            y2="380"
            stroke="white"
            strokeWidth="2"
          />

          <circle
            cx="200"
            cy="200"
            r="55"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          <rect
            x="20"
            y="128"
            width="70"
            height="144"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          <rect
            x="310"
            y="128"
            width="70"
            height="144"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

        </svg>

        <div style={{
          textAlign: 'center',
          color: '#fff',
          zIndex: 1
        }}>

          <div style={{
            fontSize: '52px',
            marginBottom: '16px'
          }}>
            ⚽
          </div>

          <div style={{
            fontSize: '26px',
            fontWeight: 800,
            marginBottom: '10px'
          }}>
            Tu cancha te espera
          </div>

          <div style={{
            fontSize: '15px',
            opacity: 0.8,
            maxWidth: '260px'
          }}>
            Reserva en segundos, juega sin complicaciones
          </div>

        </div>

      </div>

    </div>
  )
}