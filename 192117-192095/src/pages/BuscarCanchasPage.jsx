import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import CanchaCard from "../components/CanchaCard";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    color: "#0f172a",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  shell: {
    width: "min(1180px, calc(100% - 40px))",
    margin: "0 auto",
    padding: "42px 0 58px",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "28px",
  },
  eyebrow: {
    color: "#16a34a",
    fontSize: "13px",
    fontWeight: 850,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: 1.05,
    fontWeight: 900,
  },
  subtitle: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.6,
  },
  search: {
    width: "min(420px, 100%)",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1.5px solid #dbe3ef",
    background: "#fff",
    color: "#0f172a",
    fontSize: "15px",
    outline: "none",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: "22px",
  },
  empty: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "52px 24px",
    textAlign: "center",
    color: "#64748b",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
  },
  footer: {
    textAlign: "center",
    marginTop: "34px",
  },
  button: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 800,
  },
};

function BuscarCanchasPage() {
  const navigate = useNavigate();
  const [canchas, setCanchas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const obtenerCanchas = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "canchas"));
      const datos = querySnapshot.docs.map((courtDoc) => ({
        id: courtDoc.id,
        ...courtDoc.data(),
      }));

      setCanchas(datos.filter((cancha) => cancha.estado === "Disponible"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    obtenerCanchas();
  }, [obtenerCanchas]);

  const canchasFiltradas = canchas.filter((cancha) => {
    const search = busqueda.toLowerCase();
    return (
      cancha.nombre.toLowerCase().includes(search) ||
      cancha.ubicacion.toLowerCase().includes(search) ||
      cancha.tipo.toLowerCase().includes(search)
    );
  });

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Canchas disponibles</div>
            <h1 style={styles.title}>Encuentra tu proximo partido</h1>
            <p style={styles.subtitle}>
              Filtra por nombre, tipo o ubicacion y reserva en bloques de una hora.
            </p>
          </div>

          <input
            type="text"
            placeholder="Buscar cancha..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            style={styles.search}
          />
        </div>

        {loading ? (
          <div style={styles.empty}>Cargando canchas...</div>
        ) : canchasFiltradas.length === 0 ? (
          <div style={styles.empty}>No encontramos canchas disponibles.</div>
        ) : (
          <div style={styles.grid}>
            {canchasFiltradas.map((cancha) => (
              <CanchaCard
                key={cancha.id}
                cancha={cancha}
                onReserve={(canchaId) => navigate(`/crear-reserva?canchaId=${canchaId}`)}
              />
            ))}
          </div>
        )}

        <div style={styles.footer}>
          <button style={styles.button} onClick={() => navigate("/dashboard")}>
            Menu principal
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuscarCanchasPage;
