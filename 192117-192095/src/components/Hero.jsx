function Hero() {
  return (
    <section style={{
      padding: '90px 40px 80px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto', gap: '60px'
    }}>
      {/* Texto izquierda */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
          fontSize: '12px', fontWeight: 500, padding: '5px 12px',
          borderRadius: '20px', marginBottom: '22px'
        }}>
          <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} />
          +200 canchas disponibles
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-1.5px', color: '#0f0f0f', marginBottom: '18px' }}>
          Reserva tu cancha<br />
          favorita <span style={{ color: '#22c55e' }}>hoy</span>
        </h1>

        <p style={{ fontSize: '17px', color: '#666', lineHeight: 1.6, marginBottom: '34px', maxWidth: '440px' }}>
          Encuentra canchas sintéticas cerca de ti, elige tu horario y confirma en segundos. Sin llamadas, sin complicaciones.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            background: '#1a1a1a', color: '#fff', padding: '14px 28px',
            borderRadius: '10px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer'
          }}>
            Ver canchas disponibles
          </button>
          <button style={{
            background: '#fff', color: '#1a1a1a', padding: '14px 28px',
            borderRadius: '10px', fontSize: '15px', fontWeight: 500,
            border: '1.5px solid #e5e5e5', cursor: 'pointer'
          }}>
            Cómo funciona →
          </button>
        </div>

        <div style={{ display: 'flex', gap: '32px', marginTop: '42px' }}>
          {[{ num: '12K+', label: 'Partidos jugados' }, { num: '200+', label: 'Canchas' }, { num: '4.9★', label: 'Valoración' }].map(s => (
            <div key={s.label}>
              <strong style={{ fontSize: '26px', fontWeight: 800, color: '#0f0f0f', display: 'block' }}>{s.num}</strong>
              <span style={{ fontSize: '13px', color: '#888' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card cancha derecha */}
      <div style={{ flex: '0 0 340px' }}>
        <div style={{ background: '#f8f9fa', borderRadius: '20px', padding: '24px', border: '1px solid #f0f0f0' }}>
          <div style={{
            width: '100%', height: '200px',
            background: 'linear-gradient(160deg, #166534 0%, #15803d 40%, #16a34a 100%)',
            borderRadius: '14px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <svg width="260" height="160" viewBox="0 0 260 160" style={{ opacity: 0.3 }}>
              <rect x="10" y="10" width="240" height="140" fill="none" stroke="white" strokeWidth="2" />
              <line x1="130" y1="10" x2="130" y2="150" stroke="white" strokeWidth="1.5" />
              <circle cx="130" cy="80" r="22" fill="none" stroke="white" strokeWidth="1.5" />
              <rect x="10" y="48" width="35" height="64" fill="none" stroke="white" strokeWidth="1.5" />
              <rect x="215" y="48" width="35" height="64" fill="none" stroke="white" strokeWidth="1.5" />
            </svg>
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'rgba(255,255,255,0.95)', borderRadius: '8px',
              padding: '6px 10px', fontSize: '11px', fontWeight: 700,
              color: '#166534', display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} />
              Disponible
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Cancha Norte — 5v5</div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>📍 Bogotá, Kennedy · Césped sintético</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '22px', fontWeight: 800 }}>$85.000<span style={{ fontSize: '13px', fontWeight: 400, color: '#999' }}>/hora</span></span>
              <button style={{
                background: '#22c55e', color: '#fff', border: 'none',
                padding: '10px 20px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer'
              }}>
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Hero