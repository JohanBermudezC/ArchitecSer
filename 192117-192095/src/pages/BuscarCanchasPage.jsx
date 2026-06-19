import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { useNavigate } from "react-router-dom"

function BuscarCanchasPage() {

  const navigate = useNavigate()

  const [canchas, setCanchas] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerCanchas()
  }, [])

  const obtenerCanchas = async () => {
    try {

      const querySnapshot = await getDocs(
        collection(db, "canchas")
      )

      const datos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Filtrar solo canchas disponibles
      const canchasDisponibles = datos.filter(cancha => cancha.estado === "Disponible")
      setCanchas(canchasDisponibles)

    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  const canchasFiltradas = canchas.filter((cancha) =>
    cancha.nombre.toLowerCase().includes(
      busqueda.toLowerCase()
    ) ||
    cancha.ubicacion.toLowerCase().includes(
      busqueda.toLowerCase()
    )
  )

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8faf8",
        padding: "40px"
      }}
    >

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >

        <h1
          style={{
            textAlign: "center",
            color: "#166534",
            fontSize: "40px",
            marginBottom: "10px"
          }}
        >
          ⚽ Canchas Disponibles
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "30px"
          }}
        >
          Encuentra la cancha perfecta para jugar
        </p>

        <input
          type="text"
          placeholder="Buscar por nombre o ubicación..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            marginBottom: "30px",
            fontSize: "15px"
          }}
        />

        {loading ? (
          <h2>Cargando...</h2>
        ) : (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px"
            }}
          >

            {canchasFiltradas.map((cancha) => (

              <div
                key={cancha.id}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "25px",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)"
                }}
              >

                <h2
                  style={{
                    color: "#166534",
                    marginBottom: "15px"
                  }}
                >
                  {cancha.nombre}
                </h2>

                <p>
                  ⚽ <b>Tipo:</b> {cancha.tipo}
                </p>

                <p>
                  📍 <b>Ubicación:</b> {cancha.ubicacion}
                </p>

                <p>
                  💰 <b>Precio:</b> $
                  {cancha.precioHora}
                </p>

                <p>
                  📌 <b>Estado:</b> {cancha.estado}
                </p>

                <button
                  onClick={() => navigate(`/crear-reserva?canchaId=${cancha.id}`)}
                  style={{
                    width: "100%",
                    marginTop: "15px",
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    padding: "14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "700"
                  }}
                >
                  Reservar
                </button>

              </div>

            ))}

          </div>

        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "30px"
          }}
        >
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

    </div>
  )
}

export default BuscarCanchasPage