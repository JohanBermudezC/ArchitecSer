import { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../../firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f8faf8'
  },
  left: {
    flex: '0 0 480px', background: '#fff', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '60px 56px',
    boxShadow: '2px 0 24px rgba(0,0,0,0.04)'
  },
  right: {
    flex: 1,
    background: 'linear-gradient(160deg, #166534 0%, #15803d 50%, #22c55e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden'
  },
  logo: {
    fontSize: '22px', fontWeight: 800, color: '#0f0f0f',
    marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px'
  },
  dot: { width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%' },
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#888', textDecoration: 'none',
    marginBottom: '32px', transition: 'color 0.2s'
  },
  title: {
    fontSize: '30px', fontWeight: 800, color: '#0f0f0f',
    marginBottom: '8px', letterSpacing: '-0.5px'
  },
  subtitle: { fontSize: '14px', color: '#888', marginBottom: '36px', lineHeight: '1.6' },
  label: { fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px', display: 'block' },
  input: {
    width: '100%', padding: '12px 14px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: '#e5e5e5',
    borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fff',
    boxSizing: 'border-box', transition: 'border-color 0.2s', marginBottom: '4px'
  },
  inputError: { borderColor: '#ef4444' },
  inputFocus: { borderColor: '#22c55e' },
  error: { fontSize: '12px', color: '#ef4444', marginBottom: '14px', marginTop: '2px' },
  group: { marginBottom: '18px' },
  btn: {
    width: '100%', background: '#1a1a1a', color: '#fff', border: 'none',
    padding: '14px', borderRadius: '10px', fontSize: '15px',
    fontWeight: 600, cursor: 'pointer', marginTop: '8px',
    transition: 'background 0.2s'
  },
  btnLoading: { background: '#555', cursor: 'not-allowed' },
  successBox: {
    background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px',
    padding: '20px 24px', marginTop: '8px'
  },
  successTitle: { fontSize: '16px', fontWeight: 700, color: '#15803d', marginBottom: '8px' },
  successText: { fontSize: '14px', color: '#166534', lineHeight: '1.6' },
  loginRow: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#888' },
  link: { fontSize: '13px', color: '#22c55e', textDecoration: 'none', fontWeight: 500 },
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(false)

  const validate = () => {
    if (!email) return 'El correo es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de correo inválido'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo')
      } else if (e.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera unos minutos')
      } else {
        setError('Ocurrió un error. Intenta de nuevo')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.logo}><span style={styles.dot} />CanchaYa</div>

        <Link to="/login" style={styles.backLink}>
          ← Volver al inicio de sesión
        </Link>

        <h1 style={styles.title}>¿Olvidaste tu contraseña?</h1>
        <p style={styles.subtitle}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {!sent ? (
          <>
            <div style={styles.group}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                style={{
                  ...styles.input,
                  ...(error ? styles.inputError : {}),
                  ...(focused && !error ? styles.inputFocus : {})
                }}
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError('') }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              {error && <div style={styles.error}>⚠ {error}</div>}
            </div>

            <button
              style={{ ...styles.btn, ...(loading ? styles.btnLoading : {}) }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </>
        ) : (
          <div style={styles.successBox}>
            <div style={styles.successTitle}>📬 Correo enviado</div>
            <div style={styles.successText}>
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
              Revisa tu bandeja de entrada y también la carpeta de spam.
            </div>
          </div>
        )}

        <div style={styles.loginRow}>
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" style={styles.link}>Inicia sesión</Link>
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
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔑</div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px' }}>Recupera tu acceso</div>
          <div style={{ fontSize: '15px', opacity: 0.8, maxWidth: '260px' }}>
            Te ayudamos a volver a la cancha en segundos
          </div>
        </div>
      </div>
    </div>
  )
}