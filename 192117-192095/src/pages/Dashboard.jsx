import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from "react-router-dom"

const styles = {
  page: { minHeight: '100vh', background: '#f8faf8', fontFamily: 'Segoe UI, system-ui, sans-serif' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  welcome: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '48px', fontWeight: 800, color: '#0f0f0f', marginBottom: '10px' },
  subtitle: { fontSize: '20px', color: '#666' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' },
  card: { background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 40px rgba(0,0,0,0.07)', textAlign: 'center' },
  cardIcon: { fontSize: '48px', marginBottom: '20px' },
  cardTitle: { fontSize: '24px', fontWeight: 700, marginBottom: '10px' },
  cardText: { fontSize: '16px', color: '#666' },
  btn: { background: '#22c55e', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '20px' }
}

function Dashboard() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Cargando...</div>
  }

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>No has iniciado sesión.</div>
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.welcome}>
          <h1 style={styles.title}>¡Bienvenido, {userData?.name || user.email}!</h1>
          <p style={styles.subtitle}>Gestiona tus reservas y revisa tu actividad</p>
        </div>

        <div style={styles.cards}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>📅</div>
            <h3 style={styles.cardTitle}>Mis Reservas</h3>
            <p style={styles.cardText}>Ve y administra tus reservas activas</p>
            <button style={styles.btn}>Ver Reservas</button>
          </div>

          <div style={styles.card}>
  <div style={styles.cardIcon}>⚽</div>

  <h3 style={styles.cardTitle}>
    Buscar Canchas
  </h3>

  <p style={styles.cardText}>
    Encuentra canchas disponibles cerca de ti
  </p>

  <button
    style={styles.btn}
    onClick={() => navigate("/buscar-canchas")}
  >
    Buscar
  </button>
</div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>📊</div>
            <h3 style={styles.cardTitle}>Historial de Sesiones</h3>
            <p style={styles.cardText}>Revisa tu actividad y sesiones anteriores</p>
            <Link to="/history"><button style={styles.btn}>Ver Historial</button></Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard