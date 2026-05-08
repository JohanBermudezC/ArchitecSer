import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

function History() {
  const [history, setHistory] = useState([])
  const [filteredHistory, setFilteredHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'historial'))
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

  useEffect(() => {
    const filtered = history.filter(item => {
      const metodo = item.metodo || ''
      const usuario = item.usuario || ''
      const estado = item.estado || ''
      return metodo.toLowerCase().includes(searchTerm.toLowerCase()) ||
             usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
             estado.toLowerCase().includes(searchTerm.toLowerCase())
    })
    setFilteredHistory(filtered)
  }, [searchTerm, history])

  if (loading) {
    return <div>Cargando historial...</div>
  }

  return (
    <div className="history-container">
      <h2>Historial</h2>
      <input
        type="text"
        placeholder="Buscar por método, usuario o estado..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <table className="history-table">
        <thead>
          <tr>
            <th>Método</th>
            <th>Usuario</th>
            <th>Tiempo Inicio</th>
            <th>Tiempo Salida</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map(item => (
            <tr key={item.id}>
              <td>{item.metodo}</td>
              <td>{item.usuario}</td>
              <td>{item.tiempoInicio ? new Date(item.tiempoInicio.seconds * 1000).toLocaleString() : ''}</td>
              <td>{item.tiempoSalida ? new Date(item.tiempoSalida.seconds * 1000).toLocaleString() : ''}</td>
              <td>{item.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default History