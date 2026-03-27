import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', height: '64px', background: '#fff',
      borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
        Cancha Ya
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {['Inicio', 'Canchas', 'Mis Reservas', 'Contacto'].map(link => (
          <a key={link} href="#" style={{ fontSize: '14px', color: '#555', textDecoration: 'none' }}>{link}</a>
        ))}
        <div style={{cursor: 'pointer'}}>
        <Link to="/login">
        <button style={{
          background: '#1a1a1a', color: '#fff', border: 'none',
          padding: '10px 22px', borderRadius: '8px', fontSize: '14px',
          fontWeight: 500, 
        }}>
            Iniciar sesión 
          
        </button>
        </Link>
        </div>
        <Link to="/register">
         <button style={{
          background: '#1a1a1a', color: '#fff', border: 'none',
          padding: '10px 22px', borderRadius: '8px', fontSize: '14px',
          fontWeight: 500, cursor: 'pointer'
        }}>
             Registrarme
          
        </button>
        </Link>
      </div>
    </nav>
  )
}
export default Navbar