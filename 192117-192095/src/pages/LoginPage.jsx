import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const styles = {
  page: { minHeight: '100vh', display: 'flex', fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f8faf8' },
  left: {
    flex: '0 0 480px', background: '#fff', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '60px 56px', boxShadow: '2px 0 24px rgba(0,0,0,0.04)'
  },
  right: {
    flex: 1, background: 'linear-gradient(160deg, #166534 0%, #15803d 50%, #22c55e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
  },
  logo: { fontSize: '22px', fontWeight: 800, color: '#0f0f0f', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' },
  dot: { width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%' },
  title: { fontSize: '30px', fontWeight: 800, color: '#0f0f0f', marginBottom: '8px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#888', marginBottom: '36px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px', display: 'block' },
  input: {
    width: '100%', padding: '12px 14px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#e5e5e5',
    borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box',
    transition: 'border-color 0.2s', marginBottom: '4px'
  },
  inputError: { borderColor: '#ef4444' },
  error: { fontSize: '12px', color: '#ef4444', marginBottom: '14px', marginTop: '2px' },
  group: { marginBottom: '18px' },
  btn: {
    width: '100%', background: '#1a1a1a', color: '#fff', border: 'none', padding: '14px',
    borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '8px'
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  link: { fontSize: '13px', color: '#22c55e', textDecoration: 'none', fontWeight: 500 },
  registerRow: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#888' }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [firebaseError, setFirebaseError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'El correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de correo inválido'
    if (!form.password) e.password = 'La contraseña es obligatoria'
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    return e
  }

  const change = (field, val) => {
    setForm(p => ({ ...p, [field]: val }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
    if (firebaseError) setFirebaseError('')
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    setErrors({})
    setLoading(true)
    setFirebaseError('')
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      // Login exitoso
      navigate('/') // o a la página principal
    } catch (error) {
      console.error('Error login:', error.code, error.message)
      if (error.code === 'auth/user-not-found') {
        setFirebaseError('No existe una cuenta con este correo.')
      } else if (error.code === 'auth/wrong-password') {
        setFirebaseError('Contraseña incorrecta.')
      } else if (error.code === 'auth/too-many-requests') {
        setFirebaseError('Demasiados intentos. Espera unos minutos.')
      } else {
        setFirebaseError('Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.logo}><span style={styles.dot} />CanchaYa</div>
        <h1 style={styles.title}>Bienvenido de nuevo</h1>
        <p style={styles.subtitle}>Inicia sesión para reservar tu cancha favorita</p>

        <div style={styles.group}>
          <label style={styles.label}>Correo electrónico</label>
          <input
            style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
            type="email" placeholder="tu@correo.com"
            value={form.email} onChange={e => change('email', e.target.value)}
          />
          {errors.email && <div style={styles.error}>⚠ {errors.email}</div>}
        </div>

        <div style={styles.group}>
          <div style={styles.row}>
            <label style={styles.label}>Contraseña</label>
            <Link to="/forgot" style={styles.link}>¿Olvidaste tu contraseña?</Link>
          </div>
          <input
            style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
            type="password" placeholder="••••••••"
            value={form.password} onChange={e => change('password', e.target.value)}
          />
          {errors.password && <div style={styles.error}>⚠ {errors.password}</div>}
        </div>

        {firebaseError && <div style={{ ...styles.error, textAlign: 'center', background: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>{firebaseError}</div>}

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>

        <div style={styles.registerRow}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={styles.link}>Regístrate gratis</Link>
        </div>
      </div>

      <div style={styles.right}>
        <svg style={{ opacity: 0.15, position: 'absolute' }} width="400" height="400" viewBox="0 0 400 400">
          <rect x="20" y="20" width="360" height="360" fill="none" stroke="white" strokeWidth="3" rx="4" />
          <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="2" />
          <circle cx="200" cy="200" r="55" fill="none" stroke="white" strokeWidth="2" />
          <rect x="20" y="128" width="70" height="144" fill="none" stroke="white" strokeWidth="2" />
          <rect x="310" y="128" width="70" height="144" fill="none" stroke="white" strokeWidth="2" />
        </svg>
        <div style={{ textAlign: 'center', color: '#fff', zIndex: 1 }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>⚽</div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px' }}>Tu cancha te espera</div>
          <div style={{ fontSize: '15px', opacity: 0.8, maxWidth: '260px' }}>Reserva en segundos, juega sin complicaciones</div>
        </div>
      </div>
    </div>
  )
}