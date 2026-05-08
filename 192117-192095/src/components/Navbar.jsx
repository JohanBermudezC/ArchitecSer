import { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'

function Navbar() {

  const [user, setUser] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()

  }, [])

  const handleLogout = async () => {

    if (user) {

      try {

        const q = query(
          collection(db, 'historial'),
          where('usuario', '==', user.email),
          where('estado', '==', 'activo')
        )

        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {

          const sorted = querySnapshot.docs.sort((a, b) => {

            const aTime = a.data().tiempoInicio?.seconds || 0
            const bTime = b.data().tiempoInicio?.seconds || 0

            return bTime - aTime

          })

          const lastDoc = sorted[0]

          const start = lastDoc.data().tiempoInicio

          const endTime = Date.now()

          const durationSeconds = start
            ? Math.max(
              0,
              Math.floor(
                (endTime - start.seconds * 1000) / 1000
              )
            )
            : null

          await updateDoc(
            doc(db, 'historial', lastDoc.id),
            {
              tiempoSalida: serverTimestamp(),
              estado: 'finalizada',
              duracionSegundos: durationSeconds
            }
          )
        }

      } catch (error) {

        console.error('Error updating logout:', error)
      }
    }

    await signOut(auth)

    navigate('/')
  }

  return (

    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      height: '64px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>

      <div style={{
        fontSize: '20px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>

        <span style={{
          width: '10px',
          height: '10px',
          background: '#22c55e',
          borderRadius: '50%',
          display: 'inline-block'
        }} />

        Cancha Ya

      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '28px'
      }}>

        {user ? (

          <>

            <Link
              to="/dashboard"
              style={{
                fontSize: '14px',
                color: '#555',
                textDecoration: 'none'
              }}
            >
              Dashboard
            </Link>

            


            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cerrar sesión
            </button>

          </>

        ) : (

          <>

            <Link to="/login">

              <button style={{
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                Iniciar sesión
              </button>

            </Link>

            <Link to="/register">

              <button style={{
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                Registrarme
              </button>

            </Link>

          </>

        )}

      </div>

    </nav>
  )
}

export default Navbar