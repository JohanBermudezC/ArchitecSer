import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '../../firebase'

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
  subtitle: { fontSize: '14px', color: '#888', marginBottom: '36px', lineHeight: '1.6' },
  label: { fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px', display: 'block' },
  input: {
    width: '100%', padding: '12px 14px', borderWidth: '1.5px', borderStyle: 'solid', borderColor: '#e5e5e5',
    borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box',
    transition: 'border-color 0.2s', marginBottom: '4px'
  },
  inputError: { borderColor: '#ef4444' },
  inputFocus: { borderColor: '#22c55e' },
  error: { fontSize: '12px', color: '#ef4444', marginBottom: '14px', marginTop: '2px' },
  group: { marginBottom: '18px' },
  hint: { fontSize: '12px', color: '#aaa', marginTop: '4px' },
  btn: {
    width: '100%', background: '#1a1a1a', color: '#fff', border: 'none',
    padding: '14px', borderRadius: '10px', fontSize: '15px',
    fontWeight: 600, cursor: 'pointer', marginTop: '8px'
  },
  btnLoading: { background: '#555', cursor: 'not-allowed' },
  successBox: {
    background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '20px 24px', marginTop: '8px'
  },
  successTitle: { fontSize: '16px', fontWeight: 700, color: '#15803d', marginBottom: '8px' },
  successText: { fontSize: '14px', color: '#166534', lineHeight: '1.6', marginBottom: '16px' },
  successBtn: {
    display: 'inline-block', background: '#22c55e', color: '#fff',
    padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
    fontWeight: 600, textDecoration: 'none'
  },
  invalidBox: {
    background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '20px 24px'
  },
  invalidTitle: { fontSize: '16px', fontWeight: 700, color: '#dc2626', marginBottom: '8px' },
  invalidText: { fontSize: '14px', color: '#991b1b', lineHeight: '1.6', marginBottom: '16px' },
  link: { fontSize: '13px', color: '#22c55e', textDecoration: 'none', fontWeight: 500 },
  strengthBar: { display: 'flex', gap: '4px', marginTop: '8px' },
  strengthSegment: { height: '4px', flex: 1, borderRadius: '2px', background: '#e5e5e5', transition: 'background 0.3s' },
}

const strengthLevels = [
  { label: 'Muy débil', color: '#ef4444' },
  { label: 'Débil', color: '#f97316' },
  { label: 'Regular', color: '#eab308' },
  { label: 'Fuerte', color: '#22c55e' },
]

function getStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode')

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [validCode, setValidCode] = useState(false)
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [focused, setFocused] = useState('')

  useEffect(() => {
    if (!oobCode) { setVerifying(false); setValidCode(false); return }
    verifyPasswordResetCode(auth, oobCode)
      .then(emailFromCode => { setEmail(emailFromCode); setValidCode(true) })
      .catch(() => setValidCode(false))
      .finally(() => setVerifying(false))
  }, [oobCode])

  const strength = getStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.password) e.password = 'La contraseña es obligatoria'
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (!form.confirm) e.confirm = 'Confirma tu contraseña'
    else if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, form.password)
      setDone(true)
    } catch (err) {
      if (err.code === 'auth/expired-action-code') {
        setErrors({ general: 'El enlace ha expirado. Solicita uno nuevo.' })
      } else {
        setErrors({ general: 'Error al restablecer. Intenta de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const change = (field, val) => {
    setForm(p => ({ ...p, [field]: val }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.logo}><span style={styles.dot} />CanchaYa</div>
        <h1 style={styles.title}>Nueva contraseña</h1>
        <p style={styles.subtitle}>
          {email ? `Restableciendo contraseña para ${email}` : 'Elige una contraseña segura para tu cuenta'}
        </p>

        {verifying && <p style={{ color: '#888', fontSize: '14px' }}>Verificando enlace...</p>}

        {!verifying && !validCode && (
          <div style={styles.invalidBox}>
            <div style={styles.invalidTitle}>⚠ Enlace inválido o expirado</div>
            <div style={styles.invalidText}>
              Este enlace ya fue usado o ha expirado. Solicita uno nuevo desde la página de recuperación.
            </div>
            <Link to="/forgot" style={{ ...styles.link, fontSize: '14px' }}>
              Solicitar nuevo enlace →
            </Link>
          </div>
        )}

        {!verifying && validCode && !done && (
          <>
            {errors.general && (
              <div style={{ ...styles.error, marginBottom: '16px', fontSize: '13px' }}>
                ⚠ {errors.general}
              </div>
            )}

            <div style={styles.group}>
              <label style={styles.label}>Nueva contraseña</label>
              <input
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {}),
                  ...(focused === 'password' && !errors.password ? styles.inputFocus : {})
                }}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => change('password', e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                disabled={loading}
              />
              {form.password && (
                <>
                  <div style={styles.strengthBar}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        ...styles.strengthSegment,
                        background: i < strength ? strengthLevels[strength - 1]?.color : '#e5e5e5'
                      }} />
                    ))}
                  </div>
                  <div style={{ ...styles.hint, color: strengthLevels[strength - 1]?.color || '#aaa' }}>
                    {strengthLevels[strength - 1]?.label || 'Ingresa una contraseña'}
                  </div>
                </>
              )}
              {errors.password && <div style={styles.error}>⚠ {errors.password}</div>}
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Confirmar contraseña</label>
              <input
                style={{
                  ...styles.input,
                  ...(errors.confirm ? styles.inputError : {}),
                  ...(focused === 'confirm' && !errors.confirm ? styles.inputFocus : {})
                }}
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => change('confirm', e.target.value)}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused('')}
                disabled={loading}
              />
              {errors.confirm && <div style={styles.error}>⚠ {errors.confirm}</div>}
            </div>

            <button
              style={{ ...styles.btn, ...(loading ? styles.btnLoading : {}) }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </>
        )}

        {done && (
          <div style={styles.successBox}>
            <div style={styles.successTitle}>✅ ¡Contraseña actualizada!</div>
            <div style={styles.successText}>
              Tu contraseña fue restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </div>
            <Link to="/login" style={styles.successBtn}>Ir al inicio de sesión →</Link>
          </div>
        )}
      </div>

      {/* Panel derecho */}
      <div style={styles.right}>
        <svg style={{ opacity: 0.15, position: 'absolute' }} width="400" height="400" viewBox="0 0 400 400">
          <rect x="20" y="20" width="360" height="360" fill="none" stroke="white" strokeWidth="3" rx="4" />
          <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="2" />
          <circle cx="200" cy="200" r="55" fill="none" stroke="white" strokeWidth="2" />
          <rect x="20" y="128" width="70" height="144" fill="none" stroke="white" strokeWidth="2" />
          <rect x="310" y="128" width="70" height="144" fill="none" stroke="white" strokeWidth="2" />
        </svg>
        <div style={{ textAlign: 'center', color: '#fff', zIndex: 1 }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔒</div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px' }}>Acceso seguro</div>
          <div style={{ fontSize: '15px', opacity: 0.8, maxWidth: '260px' }}>
            Una contraseña fuerte protege tu cuenta y tus reservas
          </div>
        </div>
      </div>
    </div>
  )
}