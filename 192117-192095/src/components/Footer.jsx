function Footer() {
  return (
    <footer style={{
      background: '#0f0f0f', color: '#fff', padding: '36px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
        Reservalapp
      </div>
      <span style={{ fontSize: '13px', color: '#666' }}>© 2026 Reservalapp. Todos los derechos reservados.</span>
      <div style={{ display: 'flex', gap: '20px' }}>
        {['Términos', 'Privacidad', 'Contacto'].map(l => (
          <a key={l} href="#" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>{l}</a>
        ))}
      </div>
    </footer>
  )
}
export default Footer