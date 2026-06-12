import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../firebase"
import { auth } from "../firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react"

function CanchasPage() {
    useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log("USUARIO:", user)
  })

  return () => unsubscribe()
}, [])
  const [nombre, setNombre] = useState("")
  const [tipo, setTipo] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [precioHora, setPrecioHora] = useState("")
  const [estado, setEstado] = useState("Disponible")

  const guardarCancha = async () => {
    try {
      if (!nombre || !tipo || !ubicacion || !precioHora) {
        alert("Todos los campos son obligatorios")
        return
      }

      await addDoc(collection(db, "canchas"), {
        nombre,
        tipo,
        ubicacion,
        precioHora: Number(precioHora),
        estado,
        fechaCreacion: new Date()
      })

      alert("Cancha guardada correctamente")

      setNombre("")
      setTipo("")
      setUbicacion("")
      setPrecioHora("")
      setEstado("Disponible")
    } catch (error) {
      console.error(error)
      alert("Error al guardar la cancha")
    }
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Gestión de Canchas</h1>

      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "500px",
          marginTop: "30px"
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
        >
          Guardar Cancha
        </button>
      </form>
    </div>
  )
}

export default CanchasPage