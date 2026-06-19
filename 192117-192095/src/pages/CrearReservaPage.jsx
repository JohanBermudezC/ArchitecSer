import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { collection, addDoc, getDoc, doc, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "../firebase"
import { onAuthStateChanged } from "firebase/auth"

function CrearReservaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const canchaId = searchParams.get("canchaId")

  const [cancha, setCancha] = useState(null)
  const [fecha, setFecha] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFin, setHoraFin] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login")
        return
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (canchaId) {
      obtenerCancha()
    }
  }, [canchaId])

  const obtenerCancha = async () => {
    try {
      const canchaDoc = await getDoc(doc(db, "canchas", canchaId))
      if (canchaDoc.exists()) {
        setCancha({ id: canchaDoc.id, ...canchaDoc.data() })
      }
    } catch (error) {
      console.error("Error al obtener cancha:", error)
    }
  }

  const calcularPrecioTotal = () => {
    if (!cancha || !horaInicio || !horaFin) return 0
    const inicio = new Date(`2000-01-01T${horaInicio}`)
    const fin = new Date(`2000-01-01T${horaFin}`)
    const horas = (fin - inicio) / (1000 * 60 * 60)
    return Math.max(0, horas * cancha.precioHora)
  }

  const verificarDisponibilidad = async () => {
    try {
      const q = query(
        collection(db, "reservas"),
        where("canchaId", "==", cancha.id),
        where("fecha", "==", fecha),
        where("estado", "in", ["pendiente", "confirmada"])
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data())
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error)
      return []
    }
  }

  const haySuperposicion = (reservasExistentes, inicio, fin) => {
    return reservasExistentes.some(reserva => {
      const reservaInicio = new Date(`2000-01-01T${reserva.horaInicio}`)
      const reservaFin = new Date(`2000-01-01T${reserva.horaFin}`)
      return (inicio < reservaFin && fin > reservaInicio)
    })
  }

  const crearReserva = async () => {
    if (!auth.currentUser) {
      setMensaje("❌ Debes iniciar sesión para reservar")
      return
    }

    if (!cancha) {
      setMensaje("❌ No se ha seleccionado una cancha")
      return
    }

    // Validar estado de la cancha
    if (cancha.estado === "Mantenimiento") {
      setMensaje("⚠️ Esta cancha está en mantenimiento y no se puede reservar")
      return
    }

    if (!fecha || !horaInicio || !horaFin) {
      setMensaje("⚠️ Todos los campos son obligatorios")
      return
    }

    const inicio = new Date(`2000-01-01T${horaInicio}`)
    const fin = new Date(`2000-01-01T${horaFin}`)
    
    // Validar horarios (3pm - 12am)
    const horaInicioNum = parseInt(horaInicio.split(':')[0])
    const horaFinNum = parseInt(horaFin.split(':')[0])
    if (horaInicioNum < 15 || horaFinNum < 15) {
      setMensaje("⚠️ Las canchas solo están disponibles de 3:00 PM a 12:00 AM")
      return
    }
    
    if (fin <= inicio) {
      setMensaje("⚠️ La hora de fin debe ser posterior a la hora de inicio")
      return
    }

    // Verificar disponibilidad
    const reservasExistentes = await verificarDisponibilidad()
    if (haySuperposicion(reservasExistentes, inicio, fin)) {
      setMensaje("⚠️ Este horario ya está reservado por otro usuario")
      return
    }

    try {
      const precioTotal = calcularPrecioTotal()

      await addDoc(collection(db, "reservas"), {
        usuarioId: auth.currentUser.uid,
        usuarioEmail: auth.currentUser.email,
        canchaId: cancha.id,
        canchaNombre: cancha.nombre,
        canchaTipo: cancha.tipo,
        canchaUbicacion: cancha.ubicacion,
        canchaPrecioHora: cancha.precioHora,
        fecha,
        horaInicio,
        horaFin,
        estado: "pendiente",
        precioTotal,
        fechaCreacion: new Date()
      })

      setMensaje("✅ Reserva creada correctamente")
      setTimeout(() => {
        navigate("/reservas")
      }, 1500)

    } catch (error) {
      console.error("Error al crear reserva:", error)
      setMensaje("❌ Error al crear la reserva")
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "#0f172a", fontSize: "42px", fontWeight: 800, marginBottom: "12px" }}>
            ⚽ Crear Reserva
          </h1>
          <p style={{ color: "#64748b", fontSize: "18px", maxWidth: "500px", margin: "0 auto" }}>
            Completa los datos para reservar tu cancha favorita
          </p>
        </div>

        {mensaje && (
          <div style={{
            background: mensaje.includes("✅") ? "#dcfce7" : mensaje.includes("⚠️") ? "#fef9c3" : "#fee2e2",
            color: mensaje.includes("✅") ? "#166534" : mensaje.includes("⚠️") ? "#854d0e" : "#991b1b",
            padding: "16px 24px",
            borderRadius: "16px",
            marginBottom: "24px",
            fontWeight: 600,
            fontSize: "15px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            {mensaje}
          </div>
        )}

        {cancha && (
          <div style={{ 
            background: "linear-gradient(135deg, #ffffff, #f8fafc)", 
            padding: "28px", 
            borderRadius: "24px", 
            marginBottom: "28px", 
            boxShadow: "0 8px 35px rgba(0,0,0,0.06)",
            border: "1px solid #e5e7eb"
          }}>
            <h3 style={{ color: "#0f172a", fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Cancha seleccionada</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>⚽</span>
                <span style={{ color: "#334155" }}><b>Nombre:</b> {cancha.nombre}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🏟️</span>
                <span style={{ color: "#334155" }}><b>Tipo:</b> {cancha.tipo}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📍</span>
                <span style={{ color: "#334155" }}><b>Ubicación:</b> {cancha.ubicacion}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>💰</span>
                <span style={{ color: "#334155" }}><b>Precio por hora:</b> ${cancha.precioHora}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          background: "linear-gradient(135deg, #ffffff, #f8fafc)", 
          padding: "40px", 
          borderRadius: "28px", 
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "15px" }}>📅 Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "14px 18px", 
                  borderRadius: "12px", 
                  border: "2px solid #e5e7eb", 
                  fontSize: "16px",
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  transition: "border-color 0.2s",
                  outline: "none"
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "15px" }}>⏰ Hora inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "14px 18px", 
                  borderRadius: "12px", 
                  border: "2px solid #e5e7eb", 
                  fontSize: "16px",
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  transition: "border-color 0.2s",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "15px" }}>⏰ Hora fin</label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "14px 18px", 
                  borderRadius: "12px", 
                  border: "2px solid #e5e7eb", 
                  fontSize: "16px",
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  transition: "border-color 0.2s",
                  outline: "none"
                }}
              />
            </div>

            {cancha && horaInicio && horaFin && (
              <div style={{ 
                background: "linear-gradient(135deg, #dcfce7, #bbf7d0)", 
                padding: "20px 24px", 
                borderRadius: "16px", 
                marginTop: "8px",
                boxShadow: "0 4px 12px rgba(34,197,94,0.1)"
              }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#166534", fontSize: "18px" }}>
                  💰 Precio total: ${calcularPrecioTotal().toFixed(2)}
                </p>
              </div>
            )}

            <button
              onClick={crearReserva}
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                border: "none",
                padding: "16px 32px",
                borderRadius: "14px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "16px",
                marginTop: "12px",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 8px 20px rgba(34,197,94,0.3)"
              }}
            >
              ⚽ Crear Reserva
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "28px" }}>
          <button
            onClick={() => navigate("/buscar-canchas")}
            style={{
              background: "transparent",
              color: "#64748b",
              border: "2px solid #e5e7eb",
              padding: "12px 28px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "15px",
              transition: "all 0.2s"
            }}
          >
            ← Volver a buscar canchas
          </button>
        </div>
      </div>
    </div>
  )
}

export default CrearReservaPage
