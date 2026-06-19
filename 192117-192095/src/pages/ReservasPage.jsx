import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { auth, db } from "../firebase"
import { onAuthStateChanged } from "firebase/auth"
import jsPDF from "jspdf"

function ReservasPage() {
  const navigate = useNavigate()
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState("")
  const [modalConfirmar, setModalConfirmar] = useState({ mostrar: false, accion: "", reservaId: null })
  const [editando, setEditando] = useState(null)
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState("")
  const [nuevaHoraFin, setNuevaHoraFin] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login")
        return
      }
      await obtenerReservas()
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const obtenerReservas = async () => {
    try {
      const q = query(
        collection(db, "reservas"),
        where("usuarioId", "==", auth.currentUser.uid)
      )
      const querySnapshot = await getDocs(q)
      const datos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setReservas(datos)
    } catch (error) {
      console.error("Error al obtener reservas:", error)
    }
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    
    // Título "reservalapp" en verde
    doc.setFontSize(28)
    doc.setTextColor(34, 197, 94) // Verde #22c55e
    doc.text("reservalapp", 105, 20, { align: "center" })
    
    // Subtítulo
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("Tus Reservas", 105, 35, { align: "center" })
    
    // Fecha de generación
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 45, { align: "center" })
    
    // Línea separadora
    doc.setDrawColor(34, 197, 94)
    doc.setLineWidth(0.5)
    doc.line(20, 50, 190, 50)
    
    let yPosition = 60
    
    if (reservas.length === 0) {
      doc.setFontSize(14)
      doc.setTextColor(107, 114, 128)
      doc.text("No tienes reservas registradas", 105, yPosition + 10, { align: "center" })
    } else {
      reservas.forEach((reserva, index) => {
        // Verificar si necesitamos nueva página
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        // Estado de la reserva
        doc.setFontSize(12)
        const estadoColor = reserva.estado === "pendiente" ? [34, 197, 94] : [239, 68, 68]
        doc.setTextColor(...estadoColor)
        doc.text(`Estado: ${reserva.estado.toUpperCase()}`, 25, yPosition)
        
        // Nombre de la cancha
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text(reserva.canchaNombre, 25, yPosition + 10)
        
        // Detalles
        doc.setFontSize(10)
        doc.setTextColor(107, 114, 128)
        doc.text(`Tipo: ${reserva.canchaTipo}`, 25, yPosition + 20)
        doc.text(`Ubicación: ${reserva.canchaUbicacion}`, 25, yPosition + 28)
        doc.text(`Fecha: ${reserva.fecha}`, 25, yPosition + 36)
        doc.text(`Horario: ${reserva.horaInicio} - ${reserva.horaFin}`, 25, yPosition + 44)
        doc.text(`Precio total: $${reserva.precioTotal.toFixed(2)}`, 25, yPosition + 52)
        
        // Línea separadora entre reservas
        doc.setDrawColor(229, 231, 235)
        doc.setLineWidth(0.3)
        doc.line(20, yPosition + 60, 190, yPosition + 60)
        
        yPosition += 70
      })
    }
    
    // Guardar PDF
    doc.save("TusReservas.pdf")
  }

  const cancelarReserva = async (id) => {
    setModalConfirmar({ mostrar: true, accion: "cancelar", reservaId: id })
  }

  const eliminarReserva = async (id) => {
    setModalConfirmar({ mostrar: true, accion: "eliminar", reservaId: id })
  }

  const confirmarAccion = async () => {
    try {
      if (modalConfirmar.accion === "cancelar") {
        await updateDoc(doc(db, "reservas", modalConfirmar.reservaId), {
          estado: "cancelada"
        })
        setMensaje("✅ Reserva cancelada correctamente")
      } else if (modalConfirmar.accion === "eliminar") {
        await deleteDoc(doc(db, "reservas", modalConfirmar.reservaId))
        setMensaje("✅ Reserva eliminada correctamente")
      }
      await obtenerReservas()
    } catch (error) {
      console.error("Error al realizar acción:", error)
      setMensaje("❌ Error al realizar la acción")
    }
    setModalConfirmar({ mostrar: false, accion: "", reservaId: null })
  }

  const iniciarEdicion = (reserva) => {
    setEditando(reserva.id)
    setNuevaHoraInicio(reserva.horaInicio)
    setNuevaHoraFin(reserva.horaFin)
  }

  const guardarEdicion = async (reserva) => {
    const inicio = new Date(`2000-01-01T${nuevaHoraInicio}`)
    const fin = new Date(`2000-01-01T${nuevaHoraFin}`)
    
    // Validar horarios (3pm - 12am)
    const horaInicioNum = parseInt(nuevaHoraInicio.split(':')[0])
    const horaFinNum = parseInt(nuevaHoraFin.split(':')[0])
    if (horaInicioNum < 15 || horaFinNum < 15) {
      setMensaje("⚠️ Las canchas solo están disponibles de 3:00 PM a 12:00 AM")
      return
    }
    
    if (fin <= inicio) {
      setMensaje("⚠️ La hora de fin debe ser posterior a la hora de inicio")
      return
    }

    // Calcular nuevo precio
    const horas = (fin - inicio) / (1000 * 60 * 60)
    const nuevoPrecio = Math.max(0, horas * reserva.canchaPrecioHora)

    try {
      await updateDoc(doc(db, "reservas", reserva.id), {
        horaInicio: nuevaHoraInicio,
        horaFin: nuevaHoraFin,
        precioTotal: nuevoPrecio
      })
      setMensaje("✅ Reserva actualizada correctamente")
      setEditando(null)
      await obtenerReservas()
    } catch (error) {
      console.error("Error al actualizar reserva:", error)
      setMensaje("❌ Error al actualizar la reserva")
    }
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setNuevaHoraInicio("")
    setNuevaHoraFin("")
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente": return "#fef9c3"
      case "confirmada": return "#dcfce7"
      case "cancelada": return "#fee2e2"
      default: return "#f3f4f6"
    }
  }

  const getEstadoTextColor = (estado) => {
    switch (estado) {
      case "pendiente": return "#854d0e"
      case "confirmada": return "#166534"
      case "cancelada": return "#991b1b"
      default: return "#374151"
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Cargando...
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf8", padding: "40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h1 style={{ color: "#166534", fontSize: "40px", margin: 0 }}>
            ⚽ Mis Reservas
          </h1>
          <button
            onClick={exportarPDF}
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
          >
            📄 Exportar PDF
          </button>
        </div>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "30px" }}>
          Gestiona tus reservas de canchas
        </p>

        {mensaje && (
          <div style={{
            background: mensaje.includes("✅") ? "#dcfce7" : mensaje.includes("⚠️") ? "#fef9c3" : "#fee2e2",
            color: mensaje.includes("✅") ? "#166534" : mensaje.includes("⚠️") ? "#854d0e" : "#991b1b",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontWeight: "600",
            textAlign: "center"
          }}>
            {mensaje}
          </div>
        )}

        {reservas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <h3 style={{ color: "#6b7280", marginBottom: "20px" }}>No tienes reservas aún</h3>
            <button
              onClick={() => navigate("/buscar-canchas")}
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                padding: "15px 30px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "15px"
              }}
            >
              Buscar canchas
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" }}>
            {reservas.map((reserva) => (
              <div
                key={reserva.id}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "25px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
                }}
              >
                <div style={{
                  background: getEstadoColor(reserva.estado),
                  color: getEstadoTextColor(reserva.estado),
                  padding: "8px 15px",
                  borderRadius: "10px",
                  display: "inline-block",
                  marginBottom: "15px",
                  fontWeight: "600",
                  fontSize: "14px"
                }}>
                  {reserva.estado.toUpperCase()}
                </div>

                <h2 style={{ color: "#166534", marginBottom: "15px" }}>
                  {reserva.canchaNombre}
                </h2>

                <p>⚽ <b>Tipo:</b> {reserva.canchaTipo}</p>
                <p>📍 <b>Ubicación:</b> {reserva.canchaUbicacion}</p>
                <p>📅 <b>Fecha:</b> {reserva.fecha}</p>
                
                {editando === reserva.id ? (
                  <div style={{ marginTop: "15px", padding: "15px", background: "#f3f4f6", borderRadius: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Nueva hora inicio:</label>
                    <input
                      type="time"
                      value={nuevaHoraInicio}
                      onChange={(e) => setNuevaHoraInicio(e.target.value)}
                      style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" }}
                    />
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Nueva hora fin:</label>
                    <input
                      type="time"
                      value={nuevaHoraFin}
                      onChange={(e) => setNuevaHoraFin(e.target.value)}
                      style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => guardarEdicion(reserva)}
                        style={{
                          flex: 1,
                          background: "#22c55e",
                          color: "#fff",
                          border: "none",
                          padding: "8px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        style={{
                          flex: 1,
                          background: "#6b7280",
                          color: "#fff",
                          border: "none",
                          padding: "8px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>⏰ <b>Horario:</b> {reserva.horaInicio} - {reserva.horaFin}</p>
                    <p>💰 <b>Precio total:</b> ${reserva.precioTotal.toFixed(2)}</p>
                  </>
                )}

                {reserva.estado !== "cancelada" && editando !== reserva.id && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button
                      onClick={() => iniciarEdicion(reserva)}
                      style={{
                        flex: 1,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => cancelarReserva(reserva.id)}
                      style={{
                        flex: 1,
                        background: "#f59e0b",
                        color: "#fff",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => eliminarReserva(reserva.id)}
                      style={{
                        flex: 1,
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                )}

                {reserva.estado === "cancelada" && (
                  <button
                    onClick={() => eliminarReserva(reserva.id)}
                    style={{
                      width: "100%",
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      marginTop: "20px"
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "#166534",
              color: "#fff",
              border: "none",
              padding: "12px 25px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>

      {modalConfirmar.mostrar && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "20px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ color: "#166534", marginBottom: "15px" }}>
              {modalConfirmar.accion === "cancelar" ? "¿Cancelar reserva?" : "¿Eliminar reserva?"}
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "25px" }}>
              {modalConfirmar.accion === "cancelar" 
                ? "Esta acción cambiará el estado de la reserva a cancelada." 
                : "Esta acción eliminará permanentemente la reserva y no se puede deshacer."}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setModalConfirmar({ mostrar: false, accion: "", reservaId: null })}
                style={{
                  flex: 1,
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                style={{
                  flex: 1,
                  background: modalConfirmar.accion === "cancelar" ? "#f59e0b" : "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                {modalConfirmar.accion === "cancelar" ? "Sí, cancelar" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservasPage
