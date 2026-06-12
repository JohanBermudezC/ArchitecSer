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
background: "#f8faf8",
display: "flex",
justifyContent: "center",
alignItems: "center",
padding: "40px"
}}
>
<div style={{ width: "100%", maxWidth: "700px" }}>

    <div
      style={{
        textAlign: "center",
        marginBottom: "25px"
      }}
    >
      <h1
        style={{
          color: "#166534",
          marginBottom: "10px",
          fontSize: "38px",
          fontWeight: "800"
        }}
      >
        ⚽ Gestión de Canchas
      </h1>

      <p
        style={{
          color: "#6b7280",
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

          padding: "12px",
          borderRadius: "10px",
          marginBottom: "20px",
          fontWeight: "600",
          textAlign: "center"
        }}
      >
        {mensaje}
      </div>
    )}

    <form
      style={{
        background: "#fff",
        padding: "35px",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "100%"
      }}
    >

      <input
        type="text"
        placeholder="Nombre de la cancha"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        type="text"
        placeholder="Tipo de cancha"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      />

      <input
        type="text"
        placeholder="Ubicación"
        value={ubicacion}
        onChange={(e) => setUbicacion(e.target.value)}
      />

     <input
type="number"
min="1"
placeholder="Precio por hora"
value={precioHora}
onChange={(e) => setPrecioHora(e.target.value)}
/>

      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
      >
        <option value="Disponible">Disponible</option>
        <option value="Mantenimiento">Mantenimiento</option>
      </select>

      <button
        type="button"
        onClick={guardarCancha}
        style={{
          background: "#22c55e",
          color: "#fff",
          border: "none",
          padding: "15px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "15px"
        }}
      >
        {editandoId ? "✏️ Actualizar Cancha" : "⚽ Guardar Cancha"}
      </button>

    </form>
    
    <h2
  style={{
    marginTop: "40px",
    color: "#166534"
  }}
>
  Canchas Registradas
</h2>
{canchas.map((cancha) => (

  <div
    key={cancha.id}
    style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "15px",
      marginTop: "15px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
    }}
  >

    <h3>{cancha.nombre}</h3>

    <p>⚽ {cancha.tipo}</p>

    <p>📍 {cancha.ubicacion}</p>

    <p>💰 ${cancha.precioHora}</p>

    <p>{cancha.estado}</p>

    <div
      style={{
        display: "flex",
        gap: "10px"
      }}
    >

      <button
onClick={() => editarCancha(cancha)}
style={{
background: "#2563eb",
color: "#fff",
border: "none",
padding: "8px 15px",
borderRadius: "8px",
cursor: "pointer"
}}

>

Editar </button>


      <button
  onClick={() => eliminarCancha(cancha.id)}
  style={{
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Eliminar
</button>

    </div>

  </div>

))}

    <div
      style={{
        textAlign: "center",
        marginTop: "20px"
      }}
    >
      <button
        onClick={cerrarSesion}
        style={{
          background: "transparent",
          border: "none",
          color: "#dc2626",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px"
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