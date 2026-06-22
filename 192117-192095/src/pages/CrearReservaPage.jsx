import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  getReservationSlotMessage,
  getSlotByStart,
  getUnavailableSlotStarts,
  hasReservationOverlap,
  isValidReservationSlot,
  RESERVATION_SLOTS,
} from "../utils/reservationSchedule";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    color: "#0f172a",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  shell: {
    width: "min(1120px, calc(100% - 40px))",
    margin: "0 auto",
    padding: "42px 0 56px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
  },
  eyebrow: {
    color: "#16a34a",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: 1.05,
    fontWeight: 850,
  },
  subtitle: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.6,
    maxWidth: "620px",
  },
  backButton: {
    background: "#fff",
    color: "#334155",
    border: "1px solid #dbe3ef",
    borderRadius: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
    gap: "24px",
  },
  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
  },
  courtPanel: {
    padding: "28px",
  },
  formPanel: {
    padding: "30px",
  },
  panelTitle: {
    margin: "0 0 18px",
    fontSize: "20px",
    fontWeight: 800,
  },
  courtName: {
    margin: "4px 0 16px",
    fontSize: "28px",
    fontWeight: 850,
    color: "#14532d",
  },
  infoGrid: {
    display: "grid",
    gap: "12px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "12px 0",
    borderBottom: "1px solid #edf2f7",
    color: "#475569",
    fontSize: "14px",
  },
  infoValue: {
    color: "#0f172a",
    fontWeight: 750,
    textAlign: "right",
  },
  field: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 800,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1.5px solid #dbe3ef",
    background: "#fff",
    color: "#0f172a",
    fontSize: "15px",
    outline: "none",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1.5px solid #dbe3ef",
    background: "#fff",
    color: "#0f172a",
    fontSize: "15px",
    outline: "none",
  },
  hint: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  priceBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "16px",
    padding: "18px",
    marginTop: "6px",
  },
  priceLabel: {
    margin: 0,
    color: "#166534",
    fontSize: "14px",
    fontWeight: 800,
  },
  priceValue: {
    margin: 0,
    color: "#14532d",
    fontSize: "26px",
    fontWeight: 900,
  },
  submitButton: {
    width: "100%",
    border: "none",
    borderRadius: "14px",
    background: "#16a34a",
    color: "#fff",
    padding: "15px 22px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 850,
    boxShadow: "0 14px 28px rgba(22, 163, 74, 0.22)",
    marginTop: "22px",
  },
  disabledButton: {
    background: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  empty: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },
  messageModal: {
    width: "min(420px, 100%)",
    background: "#fff",
    borderRadius: "18px",
    padding: "28px",
    textAlign: "center",
    boxShadow: "0 25px 80px rgba(15, 23, 42, 0.28)",
  },
  messageIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 16px",
    color: "#fff",
    fontWeight: 900,
    fontSize: "24px",
  },
  messageTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
    fontWeight: 850,
  },
  messageText: {
    margin: "0 0 22px",
    color: "#64748b",
    lineHeight: 1.55,
  },
  messageButton: {
    border: "none",
    borderRadius: "12px",
    background: "#0f172a",
    color: "#fff",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: 800,
  },
};

const getAlertTheme = (type) => {
  if (type === "success") return { color: "#16a34a", icon: "OK" };
  if (type === "warning") return { color: "#f59e0b", icon: "!" };
  return { color: "#dc2626", icon: "X" };
};

function CenteredAlert({ alert, onClose }) {
  if (!alert) return null;

  const theme = getAlertTheme(alert.type);

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.messageModal} role="alertdialog" aria-modal="true">
        <div style={{ ...styles.messageIcon, background: theme.color }}>
          {theme.icon}
        </div>
        <h2 style={styles.messageTitle}>{alert.title}</h2>
        <p style={styles.messageText}>{alert.text}</p>
        {!alert.locked && (
          <button style={styles.messageButton} onClick={onClose}>
            Entendido
          </button>
        )}
      </div>
    </div>
  );
}

function CrearReservaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canchaId = searchParams.get("canchaId");

  const [cancha, setCancha] = useState(null);
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const selectedSlot = useMemo(() => getSlotByStart(horaInicio), [horaInicio]);
  const horaFin = selectedSlot?.end || "";
  const precioTotal = cancha?.precioHora ? Number(cancha.precioHora) : 0;

  const showAlert = (type, title, text, locked = false) => {
    setAlert({ type, title, text, locked });
  };

  const obtenerCancha = useCallback(async () => {
    if (!canchaId) return;

    try {
      const canchaDoc = await getDoc(doc(db, "canchas", canchaId));
      if (canchaDoc.exists()) {
        setCancha({ id: canchaDoc.id, ...canchaDoc.data() });
      } else {
        showAlert("error", "Cancha no encontrada", "Selecciona otra cancha disponible.");
      }
    } catch (error) {
      console.error("Error al obtener cancha:", error);
      showAlert("error", "No pudimos cargar la cancha", "Intenta nuevamente en unos segundos.");
    }
  }, [canchaId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    obtenerCancha();
  }, [obtenerCancha]);

  const verificarDisponibilidad = useCallback(async () => {
    const q = query(
      collection(db, "reservas"),
      where("canchaId", "==", cancha.id),
      where("fecha", "==", fecha),
      where("estado", "in", ["pendiente", "confirmada"]),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((reservationDoc) => ({
      id: reservationDoc.id,
      ...reservationDoc.data(),
    }));
  }, [cancha?.id, fecha]);

  useEffect(() => {
    const cargarBloquesOcupados = async () => {
      if (!cancha?.id || !fecha) {
        setUnavailableSlots([]);
        return;
      }

      setCheckingAvailability(true);
      try {
        const reservasExistentes = await verificarDisponibilidad();
        const occupiedStarts = getUnavailableSlotStarts(reservasExistentes);
        setUnavailableSlots(occupiedStarts);

        if (occupiedStarts.includes(horaInicio)) {
          setHoraInicio("");
        }
      } catch (error) {
        console.error("Error al cargar bloques ocupados:", error);
        showAlert(
          "error",
          "No pudimos consultar disponibilidad",
          "Intenta nuevamente antes de reservar.",
        );
      } finally {
        setCheckingAvailability(false);
      }
    };

    cargarBloquesOcupados();
  }, [cancha?.id, fecha, horaInicio, verificarDisponibilidad]);

  const crearReserva = async () => {
    if (!auth.currentUser) {
      showAlert("error", "Sesion requerida", "Debes iniciar sesion para reservar.");
      return;
    }

    if (!cancha) {
      showAlert("error", "Cancha requerida", "Selecciona una cancha antes de continuar.");
      return;
    }

    if (cancha.estado === "Mantenimiento") {
      showAlert(
        "warning",
        "Cancha en mantenimiento",
        "Esta cancha no esta disponible para reservas en este momento.",
      );
      return;
    }

    if (!fecha || !horaInicio || !horaFin) {
      showAlert("warning", "Datos incompletos", "Selecciona fecha y horario.");
      return;
    }

    if (!isValidReservationSlot(horaInicio, horaFin)) {
      showAlert("warning", "Horario no disponible", getReservationSlotMessage());
      return;
    }

    setSaving(true);

    try {
      const reservasExistentes = await verificarDisponibilidad();
      if (hasReservationOverlap(reservasExistentes, horaInicio, horaFin)) {
        showAlert(
          "warning",
          "Horario ocupado",
          "Este bloque ya esta reservado por otro usuario. Elige otro horario.",
        );
        return;
      }

      await addDoc(collection(db, "reservas"), {
        usuarioId: auth.currentUser.uid,
        usuarioEmail: auth.currentUser.email,
        canchaId: cancha.id,
        canchaNombre: cancha.nombre,
        canchaTipo: cancha.tipo,
        canchaUbicacion: cancha.ubicacion,
        canchaPrecioHora: cancha.precioHora,
        fecha,
        horaInicio,
        horaFin,
        estado: "pendiente",
        precioTotal,
        fechaCreacion: new Date(),
      });

      showAlert(
        "success",
        "Reserva creada",
        "Tu reserva quedo registrada correctamente.",
        true,
      );
      setTimeout(() => navigate("/reservas"), 1400);
    } catch (error) {
      console.error("Error al crear reserva:", error);
      showAlert("error", "Error al crear la reserva", "Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.empty}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Nueva reserva</div>
            <h1 style={styles.title}>Elige tu bloque de juego</h1>
            <p style={styles.subtitle}>
              Las reservas se toman por bloques exactos de una hora, desde las
              3:00 PM hasta las 11:00 PM.
            </p>
          </div>
          <button
            style={styles.backButton}
            onClick={() => navigate("/buscar-canchas")}
          >
            Volver
          </button>
        </div>

        {!cancha ? (
          <div style={styles.empty}>No hay cancha seleccionada.</div>
        ) : (
          <div style={styles.layout}>
            <section style={{ ...styles.panel, ...styles.courtPanel }}>
              <div style={styles.eyebrow}>Cancha seleccionada</div>
              <h2 style={styles.courtName}>{cancha.nombre}</h2>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span>Tipo</span>
                  <span style={styles.infoValue}>{cancha.tipo}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>Ubicacion</span>
                  <span style={styles.infoValue}>{cancha.ubicacion}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>Precio por hora</span>
                  <span style={styles.infoValue}>${Number(cancha.precioHora).toFixed(2)}</span>
                </div>
                <div style={styles.infoItem}>
                  <span>Disponibilidad</span>
                  <span style={styles.infoValue}>3:00 PM - 11:00 PM</span>
                </div>
              </div>
            </section>

            <section style={{ ...styles.panel, ...styles.formPanel }}>
              <h2 style={styles.panelTitle}>Datos de la reserva</h2>
              <div style={styles.field}>
                <label style={styles.label}>Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Bloque horario</label>
                <select
                  value={horaInicio}
                  onChange={(event) => setHoraInicio(event.target.value)}
                  style={styles.select}
                  disabled={!fecha || checkingAvailability}
                >
                  <option value="">
                    {checkingAvailability
                      ? "Consultando disponibilidad..."
                      : "Selecciona un horario"}
                  </option>
                  {RESERVATION_SLOTS.map((slot) => (
                    <option
                      key={slot.start}
                      value={slot.start}
                      disabled={unavailableSlots.includes(slot.start)}
                    >
                      {slot.label}
                      {unavailableSlots.includes(slot.start) ? " - Reservado" : ""}
                    </option>
                  ))}
                </select>
                <p style={styles.hint}>{getReservationSlotMessage()}</p>
              </div>

              {selectedSlot && (
                <div style={styles.priceBox}>
                  <div>
                    <p style={styles.priceLabel}>Total por 1 hora</p>
                    <p style={styles.hint}>
                      {selectedSlot.label}
                    </p>
                  </div>
                  <p style={styles.priceValue}>${precioTotal.toFixed(2)}</p>
                </div>
              )}

              <button
                style={{
                  ...styles.submitButton,
                  ...(saving ? styles.disabledButton : {}),
                }}
                onClick={crearReserva}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Confirmar reserva"}
              </button>
            </section>
          </div>
        )}
      </div>

      <CenteredAlert alert={alert} onClose={() => setAlert(null)} />
    </div>
  );
}

export default CrearReservaPage;
