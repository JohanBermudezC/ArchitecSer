import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getPasswordPolicyMessage,
  getPasswordStrength,
  PASSWORD_POLICY_TEXT,
} from "../../utils/passwordPolicy";

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8faf8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: "40px 20px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "48px 52px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 4px 40px rgba(0,0,0,0.07)",
  },
  logo: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f0f0f",
    marginBottom: "32px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: {
    width: "9px",
    height: "9px",
    background: "#22c55e",
    borderRadius: "50%",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#0f0f0f",
    marginBottom: "6px",
    letterSpacing: "-0.5px",
  },
  subtitle: { fontSize: "14px", color: "#888", marginBottom: "30px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  group: { marginBottom: "16px" },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#333",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "11px 13px",
    border: "1.5px solid #e5e5e5",
    borderRadius: "9px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  inputErr: { borderColor: "#ef4444" },
  error: { fontSize: "12px", color: "#ef4444", marginTop: "4px" },
  btn: {
    width: "100%",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "8px",
  },
  foot: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#888",
  },
  link: { color: "#22c55e", textDecoration: "none", fontWeight: 500 },
  strength: {
    height: "4px",
    borderRadius: "4px",
    marginTop: "6px",
    transition: "all 0.3s",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    padding: "36px 40px",
    maxWidth: "480px",
    width: "90%",
    boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "16px",
    color: "#0f0f0f",
  },
  modalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
  },
  modalBtn: {
    marginTop: "24px",
    width: "100%",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nombre obligatorio";
    if (!form.lastname.trim()) e.lastname = "Apellido obligatorio";
    if (!form.email) e.email = "Correo obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Formato inválido";
    if (!form.password) e.password = "Contraseña obligatoria";
    else {
      const passwordPolicyMessage = getPasswordPolicyMessage(form.password);
      if (passwordPolicyMessage) e.password = passwordPolicyMessage;
    }
    if (!form.confirm) e.confirm = "Confirma tu contraseña";
    else if (form.confirm !== form.password)
      e.confirm = "Las contraseñas no coinciden";
    return e;
  };

  const change = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (firebaseError) setFirebaseError("");
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);
    setFirebaseError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      const user = userCredential.user;
      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: form.name,
        apellido: form.lastname,
        email: form.email,
        telefono: form.phone || "",
        foto: "",
        creadoEn: serverTimestamp(),
      });
      
      navigate("/login", { state: { registered: true } });
    } catch (error) {
      console.error("Error registro:", error.code, error.message);
      if (error.code === "auth/email-already-in-use") {
        setFirebaseError(
          "Este correo ya está registrado. Inicia sesión o usa otro.",
        );
      } else if (error.code === "auth/weak-password") {
        setFirebaseError(
          `La contraseña es muy débil. ${PASSWORD_POLICY_TEXT}`,
        );
      } else if (error.code === "auth/network-request-failed") {
        setFirebaseError("Error de red. Verifica tu conexión.");
      } else {
        setFirebaseError("Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={s.dot} />
          Reservalapp
        </div>
        <h1 style={s.title}>Crea tu cuenta</h1>
        <p style={s.subtitle}>Únete y reserva canchas en segundos</p>

        <div style={s.row}>
          <div style={s.group}>
            <label style={s.label}>Nombre</label>
            <input
              style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
              placeholder="Juan"
              value={form.name}
              onChange={(e) => change("name", e.target.value)}
            />
            {errors.name && <div style={s.error}>⚠ {errors.name}</div>}
          </div>
          <div style={s.group}>
            <label style={s.label}>Apellido</label>
            <input
              style={{ ...s.input, ...(errors.lastname ? s.inputErr : {}) }}
              placeholder="Pérez"
              value={form.lastname}
              onChange={(e) => change("lastname", e.target.value)}
            />
            {errors.lastname && <div style={s.error}>⚠ {errors.lastname}</div>}
          </div>
        </div>

        <div style={s.group}>
          <label style={s.label}>Correo electrónico</label>
          <input
            style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={(e) => change("email", e.target.value)}
          />
          {errors.email && <div style={s.error}>⚠ {errors.email}</div>}
        </div>

        <div style={s.group}>
          <label style={s.label}>
            Teléfono{" "}
            <span style={{ color: "#bbb", fontWeight: 400 }}>(opcional)</span>
          </label>
          <input
            style={s.input}
            placeholder="+57 300 000 0000"
            value={form.phone}
            onChange={(e) => change("phone", e.target.value)}
          />
        </div>

        <div style={s.group}>
          <label style={s.label}>Contraseña</label>
          <input
            style={{ ...s.input, ...(errors.password ? s.inputErr : {}) }}
            type="password"
            placeholder={PASSWORD_POLICY_TEXT}
            value={form.password}
            onChange={(e) => change("password", e.target.value)}
          />
          {form.password && (
            <div style={{ marginTop: "6px" }}>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "4px",
                      background:
                        i <= Math.ceil((strength.score / 5) * 3)
                          ? strength.color
                          : "#e5e5e5",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: strength.color,
                  fontWeight: 500,
                }}
              >
                {strength.label}
              </div>
            </div>
          )}
          {errors.password && <div style={s.error}>⚠ {errors.password}</div>}
        </div>

        <div style={s.group}>
          <label style={s.label}>Confirmar contraseña</label>
          <input
            style={{ ...s.input, ...(errors.confirm ? s.inputErr : {}) }}
            type="password"
            placeholder="Repite tu contraseña"
            value={form.confirm}
            onChange={(e) => change("confirm", e.target.value)}
          />
          {errors.confirm && <div style={s.error}>⚠ {errors.confirm}</div>}
        </div>

        {firebaseError && (
          <div
            style={{
              ...s.error,
              marginBottom: "12px",
              textAlign: "center",
              background: "#fee2e2",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {firebaseError}
          </div>
        )}

        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        <div style={s.foot}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={s.link}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
