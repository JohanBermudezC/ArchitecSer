import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore"

import {
auth,
db
} from "../firebase"

import {
onAuthStateChanged,
signOut
} from "firebase/auth"

function CanchasPage() {

const navigate = useNavigate()

const [nombre, setNombre] = useState("")
const [tipo, setTipo] = useState("")
const [ubicacion, setUbicacion] = useState("")
const [precioHora, setPrecioHora] = useState("")
const [estado, setEstado] = useState("Disponible")
const [canchas, setCanchas] = useState([])
const [editandoId, setEditandoId] = useState(null)

const [mensaje, setMensaje] = useState("")

useEffect(() => {

const unsubscribe = onAuthStateChanged(auth, async (user) => {

  if (!user) {
    navigate("/login")
    return
  }

  const userRef = doc(db, "usuarios", user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    navigate("/dashboard")
    return
  }

  const userData = userSnap.data()

  if (userData.rol !== "admin") {
    navigate("/dashboard")
  }
  await obtenerCanchas()

})

return () => unsubscribe()

}, [navigate])

const obtenerCanchas = async () => {

const querySnapshot = await getDocs(
collection(db, "canchas")
)

const datos = querySnapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}))

setCanchas(datos)
}

const cerrarSesion = async () => {
await signOut(auth)
navigate("/login")
}
const eliminarCancha = async (id) => {

const confirmar = window.confirm(
"¿Deseas eliminar esta cancha?"
)

if (!confirmar) return

try {

await deleteDoc(
  doc(db, "canchas", id)
)

setMensaje("✅ Cancha eliminada correctamente")

await obtenerCanchas()

} catch (error) {

console.error(error)

setMensaje("❌ Error al eliminar la cancha")

}
}

const editarCancha = (cancha) => {

setEditandoId(cancha.id)

setNombre(cancha.nombre)
setTipo(cancha.tipo)
setUbicacion(cancha.ubicacion)
setPrecioHora(cancha.precioHora)
setEstado(cancha.estado)

window.scrollTo({
top: 0,
behavior: "smooth"
})
}

const guardarCancha = async () => {

try {

  if (!nombre || !tipo || !ubicacion || !precioHora) {
setMensaje("⚠️ Todos los campos son obligatorios")
return
}

if (Number(precioHora) <= 0) {
setMensaje("⚠️ El precio debe ser mayor que cero")
return
}

  if (editandoId) {

await updateDoc(
doc(db, "canchas", editandoId),
{
nombre,
tipo,
ubicacion,
precioHora: Number(precioHora),
estado
}
)

setMensaje("✅ Cancha actualizada correctamente")

setEditandoId(null)

} else {

await addDoc(collection(db, "canchas"), {
nombre,
tipo,
ubicacion,
precioHora: Number(precioHora),
estado,
fechaCreacion: new Date()
})

setMensaje("✅ Cancha creada correctamente")
}

  setMensaje("✅ Cancha creada correctamente")

  setNombre("")
  setTipo("")
  setUbicacion("")
  setPrecioHora("")
  setEstado("Disponible")
  setEditandoId(null)

await obtenerCanchas()


} catch (error) {

  console.error(error)

  setMensaje("❌ Error al guardar la cancha")

}

}

return (
<div
style={{
minHeight: "100vh",
background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
fontFamily: "'Segoe UI', system-ui, sans-serif",
padding: "40px 20px"
}}
>
<div style={{ maxWidth: "900px", margin: "0 auto" }}>

    <div
      style={{
        textAlign: "center",
        marginBottom: "40px"
      }}
    >
      <h1
        style={{
          color: "#0f172a",
          marginBottom: "12px",
          fontSize: "42px",
          fontWeight: "800"
        }}
      >
        ⚽ Gestión de Canchas
      </h1>

      <p
        style={{
          color: "#64748b",
          fontSize: "18px",
          margin: 0
        }}
      >
        Administra las canchas disponibles para los usuarios
      </p>
    </div>

    {mensaje && (
      <div
        style={{
          background:
            mensaje.includes("✅")
              ? "#dcfce7"
              : mensaje.includes("⚠️")
              ? "#fef9c3"
              : "#fee2e2",

          color:
            mensaje.includes("✅")
              ? "#166534"
              : mensaje.includes("⚠️")
              ? "#854d0e"
              : "#991b1b",

          padding: "16px 24px",
          borderRadius: "16px",
          marginBottom: "24px",
          fontWeight: 600,
          fontSize: "15px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}
      >
        {mensaje}
      </div>
    )}

    <form
      style={{
        background: "linear-gradient(135deg, #ffffff, #f8fafc)",
        padding: "40px",
        borderRadius: "28px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%"
      }}
    >

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "15px" }}>⚽ Nombre de la cancha</label>
        <input
          type="text"
          placeholder="Ej: Cancha Principal"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
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
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "15px" }}>🏟️ Tipo de cancha</label>
        <input
          type="text"
          placeholder="Ej: Fútbol 5, Fútbol 7"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
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
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "15px" }}>📍 Ubicación</label>
        <input
          type="text"
          placeholder="Ej: Centro deportivo norte"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
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
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "15px" }}>💰 Precio por hora</label>
        <input
          type="number"
          min="1"
          placeholder="Ej: 50"
          value={precioHora}
          onChange={(e) => setPrecioHora(e.target.value)}
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
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "15px" }}>📌 Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "2px solid #e5e7eb",
            fontSize: "16px",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            transition: "border-color 0.2s",
            outline: "none",
            backgroundColor: "#fff"
          }}
        >
          <option value="Disponible">Disponible</option>
          <option value="Mantenimiento">Mantenimiento</option>
        </select>
      </div>

      <button
        type="button"
        onClick={guardarCancha}
        style={{
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "#fff",
          border: "none",
          padding: "16px 32px",
          borderRadius: "14px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "16px",
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 8px 20px rgba(34,197,94,0.3)"
        }}
      >
        {editandoId ? "✏️ Actualizar Cancha" : "⚽ Guardar Cancha"}
      </button>

    </form>

    <h2
      style={{
        marginTop: "50px",
        color: "#0f172a",
        fontSize: "28px",
        fontWeight: 800,
        textAlign: "center"
      }}
    >
      Canchas Registradas
    </h2>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "30px" }}>
      {canchas.map((cancha) => (

        <div
          key={cancha.id}
          style={{
            background: "linear-gradient(135deg, #ffffff, #f8fafc)",
            padding: "28px",
            borderRadius: "24px",
            boxShadow: "0 8px 35px rgba(0,0,0,0.06)",
            border: "1px solid #e5e7eb"
          }}
        >

          <h3 style={{ color: "#0f172a", fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>{cancha.nombre}</h3>

          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🏟️</span>
              <span style={{ color: "#334155" }}>{cancha.tipo}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>📍</span>
              <span style={{ color: "#334155" }}>{cancha.ubicacion}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>💰</span>
              <span style={{ color: "#334155" }}>${cancha.precioHora}/hora</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>📌</span>
              <span style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                background: cancha.estado === "Disponible" ? "#dcfce7" : "#fef9c3",
                color: cancha.estado === "Disponible" ? "#166534" : "#854d0e"
              }}>{cancha.estado}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px"
            }}
          >

            <button
              onClick={() => editarCancha(cancha)}
              style={{
                flex: 1,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                transition: "background 0.2s"
              }}
            >
              ✏️ Editar
            </button>

            <button
              onClick={() => eliminarCancha(cancha.id)}
              style={{
                flex: 1,
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                transition: "background 0.2s"
              }}
            >
              🗑️ Eliminar
            </button>

          </div>

        </div>

      ))}
    </div>

    <div
      style={{
        textAlign: "center",
        marginTop: "40px"
      }}
    >
      <button
        onClick={cerrarSesion}
        style={{
          background: "transparent",
          border: "2px solid #e5e7eb",
          color: "#64748b",
          padding: "12px 28px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "15px",
          transition: "all 0.2s"
        }}
      >
        Cerrar sesión
      </button>
    </div>

  </div>
</div>

)
}

export default CanchasPage