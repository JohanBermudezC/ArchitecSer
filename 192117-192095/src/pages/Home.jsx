import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import CanchaCard from '../components/CanchaCard'

function Home() {
  const navigate = useNavigate()
  const [canchas, setCanchas] = useState([])
  const [loading, setLoading] = useState(true)

  const obtenerCanchas = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "canchas"))
      const datos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      const canchasDisponibles = datos.filter(cancha => cancha.estado === "Disponible")
      setCanchas(canchasDisponibles)
    } catch (error) {
      console.error("Error al obtener canchas:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    obtenerCanchas()
  }, [obtenerCanchas])

  const handleReservar = (canchaId) => {
    const userToken = localStorage.getItem('userToken')
    if (!userToken) {
      navigate('/login')
    } else {
      navigate(`/crear-reserva?canchaId=${canchaId}`)
    }
  }

  return (
    <>
      <Navbar />
      <Hero />
      
      {/* Sección de Canchas Disponibles */}
      <section id="canchas-disponibles" style={{ padding: '80px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              ⚽ Canchas Disponibles
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Explora nuestras canchas disponibles y reserva la que más te guste
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ fontSize: '18px', color: '#64748b' }}>Cargando canchas...</p>
            </div>
          ) : canchas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', boxShadow: '0 8px 35px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '18px', color: '#64748b' }}>No hay canchas disponibles en este momento</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '25px' }}>
              {canchas.map((cancha) => (
                <CanchaCard
                  key={cancha.id}
                  cancha={cancha}
                  onReserve={handleReservar}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección de Cómo Funciona */}
      <section id="como-funciona" style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              ¿Cómo funciona nuestra página?
            </h2>
            <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              Somos una plataforma dedicada a digitalizar el proceso de reservas de canchas deportivas, 
              permitiéndote encontrar, seleccionar y reservar tu cancha favorita de manera rápida, sencilla y 
              sin complicaciones. Olvídate de las llamadas telefónicas y los procesos manuales.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {[
              { icon: '🔍', title: 'Busca', desc: 'Explora las canchas disponibles cerca de ti' },
              { icon: '📅', title: 'Selecciona', desc: 'Elige la fecha y horario que prefieras' },
              { icon: '✅', title: 'Reserva', desc: 'Confirma tu reserva en segundos' }
            ].map((step, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '32px',
                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                borderRadius: '24px',
                boxShadow: '0 8px 35px rgba(0,0,0,0.06)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>{step.title}</h3>
                <p style={{ fontSize: '16px', color: '#64748b', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Home
