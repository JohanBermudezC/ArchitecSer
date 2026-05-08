import { useEffect, useState } from 'react'
import { auth, db } from '../firebase'

import {
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  deleteUser
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore'

import { useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const styles = {

  page: {
    minHeight: '100vh',
    background: '#f8faf8',
    fontFamily: 'Segoe UI, sans-serif'
  },

  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '40px 20px'
  },

  title: {
    fontSize: '42px',
    fontWeight: 800,
    marginBottom: '30px',
    textAlign: 'center'
  },

  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.08)'
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: '#333'
  },

  input: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    marginBottom: '20px',
    fontSize: '15px',
    boxSizing: 'border-box'
  },

  btn: {
    width: '100%',
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '10px'
  },

  passwordBtn: {
    width: '100%',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '10px'
  },

  deleteBtn: {
    width: '100%',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '20px'
  },

  success: {
    background: '#dcfce7',
    color: '#166534',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px'
  },

  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px'
  }

}

function ProfilePage() {

  const navigate = useNavigate()

  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)

  const [success, setSuccess] = useState('')

  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    email: ''
  })

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async(currentUser) => {

        if (!currentUser) {

          navigate('/login')

          return
        }

        setUser(currentUser)

        try {

          const userRef = doc(
            db,
            'usuarios',
            currentUser.uid
          )

          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {

            const data = userSnap.data()

            setForm({
              nombre: data.nombre || '',
              email: currentUser.email || ''
            })

          } else {

            setForm({
              nombre: currentUser.displayName || '',
              email: currentUser.email || ''
            })
          }

        } catch(err) {

          console.error(err)
        }

        setLoading(false)
      }
    )

    return () => unsubscribe()

  }, [])

  const handleChange = (field, value) => {

    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdate = async() => {

    setError('')
    setSuccess('')

    try {

      if (!user) return

      await updateProfile(user, {
        displayName: form.nombre
      })

      if (form.email !== user.email) {

        await updateEmail(
          user,
          form.email
        )
      }

      await setDoc(
        doc(db, 'usuarios', user.uid),
        {
          nombre: form.nombre,
          email: form.email,
          actualizado: new Date()
        },
        { merge: true }
      )

      setSuccess(
        'Perfil actualizado correctamente'
      )

    } catch(err) {

      console.error(err)

      setError(
        'Error actualizando perfil'
      )
    }
  }

  const handleDelete = async() => {

    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar tu cuenta?'
    )

    if (!confirmDelete) return

    try {

      await deleteDoc(
        doc(db, 'usuarios', user.uid)
      )

      await deleteUser(user)

      navigate('/')

    } catch(err) {

      console.error(err)

      setError(
        'Debes volver a iniciar sesión antes de eliminar la cuenta'
      )
    }
  }

  if (loading) {

    return <div>Cargando...</div>
  }

  return (

    <div style={styles.page}>

      <Navbar />

      <div style={styles.container}>

        <h1 style={styles.title}>
          Mi Perfil
        </h1>

        <div style={styles.card}>

          {success && (
            <div style={styles.success}>
              {success}
            </div>
          )}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <label style={styles.label}>
            Nombre
          </label>

          <input
            type="text"
            value={form.nombre}
            onChange={(e) =>
              handleChange(
                'nombre',
                e.target.value
              )
            }
            style={styles.input}
          />

          <label style={styles.label}>
            Correo
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              handleChange(
                'email',
                e.target.value
              )
            }
            style={styles.input}
          />

          <button
            onClick={() => navigate('/reset-password')}
            style={styles.passwordBtn}
          >
            Cambiar contraseña
          </button>

          <button
            onClick={handleUpdate}
            style={styles.btn}
          >
            Guardar cambios
          </button>

          <button
            onClick={handleDelete}
            style={styles.deleteBtn}
          >
            Eliminar cuenta
          </button>

        </div>

      </div>

      <Footer />

    </div>
  )
}

export default ProfilePage