import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";
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
    width: "min(1180px, calc(100% - 40px))",
    margin: "0 auto",
    padding: "42px 0 58px",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
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
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  primaryButton: {
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "#fff",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 12px 24px rgba(22, 163, 74, 0.2)",
  },
  secondaryButton: {
    border: "1px solid #dbe3ef",
    borderRadius: "12px",
    background: "#fff",
    color: "#334155",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  exportButton: {
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
    gap: "18px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  status: {
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: 850,
    textTransform: "uppercase",
  },
  courtTitle: {
    margin: "0 0 6px",
    color: "#14532d",
    fontSize: "22px",
    fontWeight: 900,
  },
  meta: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  detailGrid: {
    display: "grid",
    gap: "10px",
    marginTop: "18px",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    paddingBottom: "10px",
    borderBottom: "1px solid #edf2f7",
    color: "#64748b",
    fontSize: "14px",
  },
  detailValue: {
    color: "#0f172a",
    fontWeight: 800,
    textAlign: "right",
  },
  editBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "16px",
    marginTop: "18px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 850,
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
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
  cardActions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "20px",
  },
  twoActions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "14px",
  },
  smallButton: {
    border: "none",
    borderRadius: "11px",
    color: "#fff",
    padding: "10px 11px",
    cursor: "pointer",
    fontWeight: 800,
  },
  empty: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "54px 24px",
    textAlign: "center",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
  },
  emptyTitle: {
    margin: "0 0 10px",
    fontSize: "24px",
    fontWeight: 900,
  },
  emptyText: {
    margin: "0 0 22px",
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
  modal: {
    width: "min(430px, 100%)",
    background: "#fff",
    borderRadius: "18px",
    padding: "28px",
    textAlign: "center",
    boxShadow: "0 25px 80px rgba(15, 23, 42, 0.28)",
  },
  modalTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
    fontWeight: 900,
  },
  modalText: {
    margin: "0 0 22px",
    color: "#64748b",
    lineHeight: 1.55,
  },
  modalActions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
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
};

const getStatusTheme = (estado) => {
  switch (estado) {
    case "pendiente":
      return { background: "#fef3c7", color: "#92400e" };
    case "confirmada":
      return { background: "#dcfce7", color: "#166534" };
    case "cancelada":
      return { background: "#fee2e2", color: "#991b1b" };
    default:
      return { background: "#e2e8f0", color: "#334155" };
  }
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
      <div style={styles.modal} role="alertdialog" aria-modal="true">
        <div style={{ ...styles.messageIcon, background: theme.color }}>
          {theme.icon}
        </div>
        <h2 style={styles.modalTitle}>{alert.title}</h2>
        <p style={styles.modalText}>{alert.text}</p>
        <button
          style={{ ...styles.smallButton, background: "#0f172a", minWidth: "130px" }}
          onClick={onClose}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

function ReservasPage() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState({
    mostrar: false,
    accion: "",
    reservaId: null,
  });
  const [editando, setEditando] = useState(null);
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState("");
  const [editUnavailableSlots, setEditUnavailableSlots] = useState([]);
  const [checkingEditAvailability, setCheckingEditAvailability] = useState(false);

  const selectedEditSlot = useMemo(
    () => getSlotByStart(nuevaHoraInicio),
    [nuevaHoraInicio],
  );

  const showAlert = (type, title, text) => {
    setAlert({ type, title, text });
  };

  const obtenerReservas = useCallback(async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, "reservas"),
        where("usuarioId", "==", auth.currentUser.uid),
      );
      const querySnapshot = await getDocs(q);
      const datos = querySnapshot.docs
        .map((reservationDoc) => ({
          id: reservationDoc.id,
          ...reservationDoc.data(),
        }))
        .sort((a, b) => `${b.fecha} ${b.horaInicio}`.localeCompare(`${a.fecha} ${a.horaInicio}`));

      setReservas(datos);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
      showAlert("error", "No pudimos cargar tus reservas", "Intenta nuevamente.");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      await obtenerReservas();
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, obtenerReservas]);

  const exportarPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(28);
    pdf.setTextColor(34, 197, 94);
    pdf.text("Reservalapp", 105, 20, { align: "center" });

    pdf.setFontSize(16);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Tus reservas", 105, 35, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 45, {
      align: "center",
    });

    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(0.5);
    pdf.line(20, 50, 190, 50);

    let yPosition = 62;

    if (reservas.length === 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(100, 116, 139);
      pdf.text("No tienes reservas registradas", 105, yPosition + 10, {
        align: "center",
      });
    } else {
      reservas.forEach((reserva) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 24;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(34, 197, 94);
        pdf.text(`Estado: ${reserva.estado.toUpperCase()}`, 25, yPosition);

        pdf.setFontSize(14);
        pdf.setTextColor(15, 23, 42);
        pdf.text(reserva.canchaNombre, 25, yPosition + 10);

        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Tipo: ${reserva.canchaTipo}`, 25, yPosition + 20);
        pdf.text(`Ubicacion: ${reserva.canchaUbicacion}`, 25, yPosition + 28);
        pdf.text(`Fecha: ${reserva.fecha}`, 25, yPosition + 36);
        pdf.text(`Horario: ${reserva.horaInicio} - ${reserva.horaFin}`, 25, yPosition + 44);
        pdf.text(`Precio total: $${Number(reserva.precioTotal).toFixed(2)}`, 25, yPosition + 52);

        pdf.setDrawColor(226, 232, 240);
        pdf.line(20, yPosition + 60, 190, yPosition + 60);
        yPosition += 70;
      });
    }

    pdf.save("TusReservas.pdf");
  };

  const cancelarReserva = (id) => {
    setModalConfirmar({ mostrar: true, accion: "cancelar", reservaId: id });
  };

  const eliminarReserva = (id) => {
    setModalConfirmar({ mostrar: true, accion: "eliminar", reservaId: id });
  };

  const confirmarAccion = async () => {
    try {
      if (modalConfirmar.accion === "cancelar") {
        await updateDoc(doc(db, "reservas", modalConfirmar.reservaId), {
          estado: "cancelada",
        });
        showAlert("success", "Reserva cancelada", "La reserva quedo marcada como cancelada.");
      } else if (modalConfirmar.accion === "eliminar") {
        await deleteDoc(doc(db, "reservas", modalConfirmar.reservaId));
        showAlert("success", "Reserva eliminada", "La reserva fue eliminada correctamente.");
      }

      await obtenerReservas();
    } catch (error) {
      console.error("Error al realizar accion:", error);
      showAlert("error", "No pudimos completar la accion", "Intenta nuevamente.");
    } finally {
      setModalConfirmar({ mostrar: false, accion: "", reservaId: null });
    }
  };

  const verificarDisponibilidadEdicion = async (reserva) => {
    const q = query(
      collection(db, "reservas"),
      where("canchaId", "==", reserva.canchaId),
      where("fecha", "==", reserva.fecha),
      where("estado", "in", ["pendiente", "confirmada"]),
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((reservationDoc) => ({
      id: reservationDoc.id,
      ...reservationDoc.data(),
    }));
  };

  const iniciarEdicion = async (reserva) => {
    setEditando(reserva.id);
    setNuevaHoraInicio(reserva.horaInicio);
    setCheckingEditAvailability(true);

    try {
      const reservasExistentes = await verificarDisponibilidadEdicion(reserva);
      setEditUnavailableSlots(
        getUnavailableSlotStarts(reservasExistentes, reserva.id),
      );
    } catch (error) {
      console.error("Error al cargar disponibilidad de edicion:", error);
      showAlert(
        "error",
        "No pudimos consultar disponibilidad",
        "Intenta editar la reserva nuevamente.",
      );
      setEditUnavailableSlots([]);
    } finally {
      setCheckingEditAvailability(false);
    }
  };

  const guardarEdicion = async (reserva) => {
    const nuevaHoraFin = selectedEditSlot?.end || "";

    if (!nuevaHoraInicio || !nuevaHoraFin) {
      showAlert("warning", "Horario requerido", "Selecciona un bloque para actualizar.");
      return;
    }

    if (!isValidReservationSlot(nuevaHoraInicio, nuevaHoraFin)) {
      showAlert("warning", "Horario no disponible", getReservationSlotMessage());
      return;
    }

    try {
      const reservasExistentes = await verificarDisponibilidadEdicion(reserva);
      if (
        hasReservationOverlap(
          reservasExistentes,
          nuevaHoraInicio,
          nuevaHoraFin,
          reserva.id,
        )
      ) {
        showAlert(
          "warning",
          "Horario ocupado",
          "Este bloque ya esta reservado por otro usuario. Elige otro horario.",
        );
        return;
      }

      await updateDoc(doc(db, "reservas", reserva.id), {
        horaInicio: nuevaHoraInicio,
        horaFin: nuevaHoraFin,
        precioTotal: Number(reserva.canchaPrecioHora || 0),
      });

      showAlert("success", "Reserva actualizada", "El horario se actualizo correctamente.");
      setEditando(null);
      setNuevaHoraInicio("");
      await obtenerReservas();
    } catch (error) {
      console.error("Error al actualizar reserva:", error);
      showAlert("error", "Error al actualizar", "Intenta nuevamente.");
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaHoraInicio("");
    setEditUnavailableSlots([]);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.empty, width: "min(420px, calc(100% - 40px))", margin: "80px auto" }}>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Reservas</div>
            <h1 style={styles.title}>Mis reservas</h1>
            <p style={styles.subtitle}>
              Administra tus horarios. Cada reserva ocupa un bloque exacto de una hora
              entre 3:00 PM y 11:00 PM.
            </p>
          </div>
          <div style={styles.actions}>
            <button style={styles.secondaryButton} onClick={() => navigate("/dashboard")}>
              Menu principal
            </button>
            <button style={styles.exportButton} onClick={exportarPDF}>
              Exportar PDF
            </button>
          </div>
        </div>

        {reservas.length === 0 ? (
          <div style={styles.empty}>
            <h2 style={styles.emptyTitle}>Aun no tienes reservas</h2>
            <p style={styles.emptyText}>
              Busca una cancha y elige un bloque disponible para jugar.
            </p>
            <button
              style={styles.primaryButton}
              onClick={() => navigate("/buscar-canchas")}
            >
              Buscar canchas
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {reservas.map((reserva) => {
              const statusTheme = getStatusTheme(reserva.estado);
              const editingThis = editando === reserva.id;

              return (
                <article key={reserva.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <h2 style={styles.courtTitle}>{reserva.canchaNombre}</h2>
                      <p style={styles.meta}>{reserva.canchaTipo}</p>
                    </div>
                    <span style={{ ...styles.status, ...statusTheme }}>
                      {reserva.estado}
                    </span>
                  </div>

                  <div style={styles.detailGrid}>
                    <div style={styles.detailItem}>
                      <span>Ubicacion</span>
                      <span style={styles.detailValue}>{reserva.canchaUbicacion}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span>Fecha</span>
                      <span style={styles.detailValue}>{reserva.fecha}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span>Horario</span>
                      <span style={styles.detailValue}>
                        {reserva.horaInicio} - {reserva.horaFin}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span>Total</span>
                      <span style={styles.detailValue}>
                        ${Number(reserva.precioTotal || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {editingThis && (
                    <div style={styles.editBox}>
                      <label style={styles.label}>Nuevo bloque horario</label>
                      <select
                        value={nuevaHoraInicio}
                        onChange={(event) => setNuevaHoraInicio(event.target.value)}
                        style={styles.select}
                        disabled={checkingEditAvailability}
                      >
                        <option value="">
                          {checkingEditAvailability
                            ? "Consultando disponibilidad..."
                            : "Selecciona un horario"}
                        </option>
                        {RESERVATION_SLOTS.map((slot) => (
                          <option
                            key={slot.start}
                            value={slot.start}
                            disabled={editUnavailableSlots.includes(slot.start)}
                          >
                            {slot.label}
                            {editUnavailableSlots.includes(slot.start)
                              ? " - Reservado"
                              : ""}
                          </option>
                        ))}
                      </select>
                      <p style={styles.hint}>{getReservationSlotMessage()}</p>
                      <div style={styles.twoActions}>
                        <button
                          style={{ ...styles.smallButton, background: "#16a34a" }}
                          onClick={() => guardarEdicion(reserva)}
                        >
                          Guardar
                        </button>
                        <button
                          style={{ ...styles.smallButton, background: "#64748b" }}
                          onClick={cancelarEdicion}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {reserva.estado !== "cancelada" && !editingThis && (
                    <div style={styles.cardActions}>
                      <button
                        style={{ ...styles.smallButton, background: "#2563eb" }}
                        onClick={() => iniciarEdicion(reserva)}
                      >
                        Editar
                      </button>
                      <button
                        style={{ ...styles.smallButton, background: "#f59e0b" }}
                        onClick={() => cancelarReserva(reserva.id)}
                      >
                        Cancelar
                      </button>
                      <button
                        style={{ ...styles.smallButton, background: "#dc2626" }}
                        onClick={() => eliminarReserva(reserva.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}

                  {reserva.estado === "cancelada" && (
                    <button
                      style={{
                        ...styles.smallButton,
                        background: "#dc2626",
                        width: "100%",
                        marginTop: "20px",
                      }}
                      onClick={() => eliminarReserva(reserva.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <CenteredAlert alert={alert} onClose={() => setAlert(null)} />

      {modalConfirmar.mostrar && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} role="dialog" aria-modal="true">
            <h2 style={styles.modalTitle}>
              {modalConfirmar.accion === "cancelar"
                ? "Cancelar reserva"
                : "Eliminar reserva"}
            </h2>
            <p style={styles.modalText}>
              {modalConfirmar.accion === "cancelar"
                ? "La reserva quedara marcada como cancelada y ya no contara como horario activo."
                : "Esta accion eliminara la reserva permanentemente."}
            </p>
            <div style={styles.modalActions}>
              <button
                style={{ ...styles.smallButton, background: "#64748b" }}
                onClick={() =>
                  setModalConfirmar({ mostrar: false, accion: "", reservaId: null })
                }
              >
                Volver
              </button>
              <button
                style={{
                  ...styles.smallButton,
                  background:
                    modalConfirmar.accion === "cancelar" ? "#f59e0b" : "#dc2626",
                }}
                onClick={confirmarAccion}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservasPage;
