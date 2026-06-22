const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
  },
  visual: {
    minHeight: "128px",
    background:
      "linear-gradient(135deg, #14532d 0%, #16a34a 52%, #86efac 100%)",
    position: "relative",
    padding: "18px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  fieldLines: {
    position: "absolute",
    inset: "16px",
    border: "1.5px solid rgba(255,255,255,0.42)",
    borderRadius: "10px",
    pointerEvents: "none",
  },
  badge: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: 850,
    backdropFilter: "blur(8px)",
    zIndex: 1,
  },
  price: {
    alignSelf: "flex-end",
    background: "#fff",
    color: "#14532d",
    borderRadius: "12px",
    padding: "9px 12px",
    fontSize: "14px",
    fontWeight: 900,
    zIndex: 1,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.14)",
  },
  body: {
    padding: "22px",
  },
  titleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
    lineHeight: 1.2,
    fontWeight: 900,
  },
  status: {
    flex: "0 0 auto",
    borderRadius: "999px",
    padding: "6px 10px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: 850,
  },
  details: {
    display: "grid",
    gap: "10px",
    marginBottom: "20px",
  },
  detail: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    color: "#64748b",
    fontSize: "14px",
  },
  detailValue: {
    color: "#0f172a",
    fontWeight: 800,
    textAlign: "right",
  },
  button: {
    width: "100%",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "13px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 850,
    fontSize: "15px",
    boxShadow: "0 12px 24px rgba(22, 163, 74, 0.22)",
  },
};

function CanchaCard({ cancha, onReserve, actionLabel = "Reservar" }) {
  const statusStyle =
    cancha.estado === "Disponible"
      ? styles.status
      : { ...styles.status, background: "#fef3c7", color: "#92400e" };

  return (
    <article style={styles.card}>
      <div style={styles.visual}>
        <div style={styles.fieldLines} />
        <span style={styles.badge}>{cancha.tipo}</span>
        <span style={styles.price}>${Number(cancha.precioHora || 0).toFixed(2)}/hora</span>
      </div>

      <div style={styles.body}>
        <div style={styles.titleRow}>
          <h3 style={styles.title}>{cancha.nombre}</h3>
          <span style={statusStyle}>{cancha.estado || "Disponible"}</span>
        </div>

        <div style={styles.details}>
          <div style={styles.detail}>
            <span>Ubicacion</span>
            <span style={styles.detailValue}>{cancha.ubicacion}</span>
          </div>
          <div style={styles.detail}>
            <span>Horario</span>
            <span style={styles.detailValue}>3:00 PM - 11:00 PM</span>
          </div>
        </div>

        <button style={styles.button} onClick={() => onReserve(cancha.id)}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

export default CanchaCard;
