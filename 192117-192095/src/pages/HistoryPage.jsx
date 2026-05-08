import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8faf8',
    fontFamily: 'Segoe UI, system-ui, sans-serif'
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },

  title: {
    fontSize: '36px',
    fontWeight: 800,
    color: '#0f0f0f',
    marginBottom: '20px',
    textAlign: 'center'
  },

  search: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    fontSize: '16px',
    marginBottom: '20px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 40px rgba(0,0,0,0.07)'
  },

  th: {
    padding: '15px',
    textAlign: 'left',
    background: '#f8f9fa',
    fontWeight: 700,
    color: '#333'
  },

  td: {
    padding: '15px',
    borderBottom: '1px solid #f0f0f0'
  },

  loading: {
    textAlign: 'center',
    padding: '50px'
  }
}

function HistoryPage() {

  const [history, setHistory] = useState([])

  const [filteredHistory, setFilteredHistory] = useState([])

  const [searchTerm, setSearchTerm] = useState('')

  const [loading, setLoading] = useState(true)

  const [, forceUpdate] = useState(0)

  useEffect(() => {

    const fetchHistory = async () => {

      try {

        const q = query(
          collection(db, 'historial'),
          orderBy('tiempoInicio', 'desc')
        )

        const querySnapshot = await getDocs(q)

        const historyData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setHistory(historyData)

        setFilteredHistory(historyData)

      } catch (error) {

        console.error('Error fetching history:', error)

      } finally {

        setLoading(false)
      }
    }

    fetchHistory()

  }, [])

  // Actualiza el tiempo cada segundo
  useEffect(() => {

    const interval = setInterval(() => {

      forceUpdate(prev => prev + 1)

    }, 1000)

    return () => clearInterval(interval)

  }, [])

  useEffect(() => {

    const filtered = history.filter(item =>

      item.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||

      item.metodo?.toLowerCase().includes(searchTerm.toLowerCase()) ||

      item.estado?.toLowerCase().includes(searchTerm.toLowerCase())

    )

    setFilteredHistory(filtered)

  }, [searchTerm, history])

  // Calcular duración real
  const calculateDuration = (item) => {

    if (!item.tiempoInicio) return ''

    const startTime = item.tiempoInicio.seconds * 1000

    // Si la sesión sigue activa
    const endTime = item.tiempoSalida
      ? item.tiempoSalida.seconds * 1000
      : Date.now()

    const durationMs = endTime - startTime

    if (durationMs < 0) return ''

    const totalSeconds = Math.floor(durationMs / 1000)

    const hours = Math.floor(totalSeconds / 3600)

    const minutes = Math.floor((totalSeconds % 3600) / 60)

    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }

    return `${seconds}s`
  }

  if (loading) {

    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.loading}>
          Cargando historial...
        </div>
        <Footer />
      </div>
    )
  }

  return (

    <div style={styles.page}>

      <Navbar />

      <div style={styles.container}>

        <h1 style={styles.title}>
          Historial de Sesiones
        </h1>

        <input
          type="text"
          placeholder="Buscar por usuario, método o estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.search}
        />

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>Usuario</th>

              <th style={styles.th}>Método</th>

              <th style={styles.th}>Hora de Entrada</th>

              <th style={styles.th}>Hora de Salida</th>

              <th style={styles.th}>Tiempo Total</th>

              <th style={styles.th}>Estado</th>

            </tr>

          </thead>

          <tbody>

            {filteredHistory.map(item => (

              <tr key={item.id}>

                <td style={styles.td}>
                  {item.usuario}
                </td>

                <td style={styles.td}>
                  {item.metodo}
                </td>

                <td style={styles.td}>
                  {
                    item.tiempoInicio
                      ? new Date(
                          item.tiempoInicio.seconds * 1000
                        ).toLocaleString()
                      : ''
                  }
                </td>

                <td style={styles.td}>
                  {
                    item.tiempoSalida
                      ? new Date(
                          item.tiempoSalida.seconds * 1000
                        ).toLocaleString()
                      : ''
                  }
                </td>

                <td style={styles.td}>
                  {calculateDuration(item)}
                </td>

                <td style={styles.td}>
                  {item.estado}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <Footer />

    </div>
  )
}

export default HistoryPage