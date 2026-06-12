import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

import { auth, db } from "../../firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 3.653 29.315 2 24 2 11.85 2 2 11.85 2 24s9.85 22 22 22 22-9.85 22-22c0-1.33-.112-2.632-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 3.653 29.315 2 24 2 16.202 2 9.415 6.026 5.483 12.062z"/>
    <path fill="#4CAF50" d="M24 46c5.059 0 9.602-1.701 13.208-4.562l-6.233-5.341C28.947 37.473 26.604 38 24 38c-5.174 0-9.563-3.284-11.233-7.922l-6.586 5.105C10.122 41.428 16.598 46 24 46z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.233 5.341C37.568 39.052 46 32.556 46 24c0-1.33-.112-2.632-.389-3.917z"/>
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#181717" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#1877F2" d="M24 4C12.95 4 4 12.95 4 24c0 9.99 7.31 18.27 16.88 19.77V29.89h-4.99V24h4.99v-4.49c0-4.92 2.93-7.64 7.41-7.64 2.15 0 4.39.38 4.39.38v4.83h-2.47c-2.44 0-3.2 1.52-3.2 3.07V24h5.44l-.87 5.89h-4.57v13.88C36.69 42.27 44 33.99 44 24c0-11.05-8.95-20-20-20z"/>
    <path fill="#FFF" d="M31.66 29.89l.87-5.89h-5.44v-3.76c0-1.55.76-3.07 3.2-3.07h2.47v-4.83s-2.24-.38-4.39-.38c-4.48 0-7.41 2.72-7.41 7.64V24h-4.99v5.89h4.99v13.88c1.01.16 2.04.24 3.09.24s2.08-.08 3.09-.24V29.89h4.57z"/>
  </svg>
);

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "#f8faf8",
  },
  left: {
    flex: "0 0 480px",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px 56px",
    boxShadow: "2px 0 24px rgba(0,0,0,0.04)",
  },
  right: {
    flex: 1,
    background: "linear-gradient(160deg, #166534 0%, #15803d 50%, #22c55e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  logo: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f0f0f",
    marginBottom: "40px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: {
    width: "10px",
    height: "10px",
    background: "#22c55e",
    borderRadius: "50%",
  },
  title: {
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f0f0f",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "36px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#333",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#e5e5e5",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    marginBottom: "4px",
  },
  inputError: { borderColor: "#ef4444" },
  error: {
    fontSize: "12px",
    color: "#ef4444",
    marginBottom: "14px",
    marginTop: "2px",
  },
  group: { marginBottom: "18px" },
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
    transition: "background-color 0.2s",
  },
  socialContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },
  socialBtn: {
    flex: 1,
    background: "#fff",
    color: "#333",
    border: "1.5px solid #e5e5e5",
    padding: "13px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "20px 0",
  },
  dividerLine: { flex: 1, height: "1px", background: "#e5e5e5" },
  dividerText: { fontSize: "12px", color: "#aaa", fontWeight: 500 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  link: {
    fontSize: "13px",
    color: "#22c55e",
    textDecoration: "none",
    fontWeight: 500,
  },
  registerRow: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#888",
  },
};

const googleProvider   = new GoogleAuthProvider();
const githubProvider   = new GithubAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");

  const [loadingGoogle,   setLoadingGoogle]   = useState(false);
  const [loadingGithub,   setLoadingGithub]   = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "El correo es obligatorio";
    if (!form.password) e.password = "La contraseña es obligatoria";
    return e;
  };

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (firebaseError) setFirebaseError("");
  };

  const guardarHistorial = async (metodo, email) => {
    await addDoc(collection(db, "historial"), {
      metodo,
      usuario:      email,
      tiempoInicio: serverTimestamp(),
      tiempoSalida: null,
      estado:       "activo",
    });
  };

  const guardarUsuario = async (user) => {
    if (!user.uid) return;
    const userRef  = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    const currentProviders = new Set(user.providerData.map(p => p.providerId));
    if (user.email) {
      const methods = await fetchSignInMethodsForEmail(auth, user.email);
      if (methods.includes('password')) currentProviders.add('password');
    }

    if (!userSnap.exists()) {
      const partes = (user.displayName || "").split(" ");
      await setDoc(userRef, {
        nombre:     partes[0] || "",
        apellido:   partes.slice(1).join(" ") || "",
        email:      user.email,
        foto:       user.photoURL || "",
        proveedores: Array.from(currentProviders),
        creadoEn:   serverTimestamp(),
      });
    } else {
      const existingProviders = new Set(userSnap.data().proveedores || []);
      currentProviders.forEach(p => existingProviders.add(p));
      await updateDoc(userRef, { proveedores: Array.from(existingProviders) });
    }
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setFirebaseError("");

    try {
      const result = await signInWithEmailAndPassword(auth, form.email, form.password);
      await guardarUsuario(result.user);
      await guardarHistorial("password", form.email);
      navigate("/dashboard");
    } catch (error) {
      setFirebaseError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider, setProviderLoading) => {
    setProviderLoading(true);
    setFirebaseError("");

    try {
      const result = await signInWithPopup(auth, provider);
      await guardarUsuario(result.user);
      await guardarHistorial(provider.providerId, result.user.email);
      navigate("/dashboard");
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData.email;
        const methods = await fetchSignInMethodsForEmail(auth, email);
        const method = methods[0] === 'password' ? 'email y contraseña' : methods[0];
        setFirebaseError(`Ya existe una cuenta con el email ${email} usando ${method}. Inicia sesión con ${method} y vincula este servicio desde tu Dashboard.`);
      } else {
        setFirebaseError("Error al iniciar sesión.");
      }
    } finally {
      setProviderLoading(false);
    }
  };

  const anyLoading = loading || loadingGoogle || loadingGithub || loadingFacebook;

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.logo}><span style={styles.dot} />Reservalapp</div>
        <h1 style={styles.title}>Bienvenido de nuevo</h1>
        <p style={styles.subtitle}>Inicia sesión para reservar tu cancha favorita</p>

        <div style={styles.group}>
          <label style={styles.label}>Correo electrónico</label>
          <input
            style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
            type="email" placeholder="tu@correo.com"
            value={form.email} onChange={(e) => change("email", e.target.value)}
          />
          {errors.email && <span style={styles.error}>{errors.email}</span>}
        </div>

        <div style={styles.group}>
          <div style={styles.row}>
            <label style={styles.label}>Contraseña</label>
            <Link to="/forgot" style={styles.link}>¿Olvidaste tu contraseña?</Link>
          </div>
          <input
            style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
            type="password" placeholder="••••••••"
            value={form.password} onChange={(e) => change("password", e.target.value)}
          />
          {errors.password && <span style={styles.error}>{errors.password}</span>}
        </div>

        {firebaseError && (
          <div style={{ ...styles.error, textAlign: "center", background: "#fee2e2", padding: "10px", borderRadius: "8px", marginBottom: "16px" }}>
            {firebaseError}
          </div>
        )}

        <button style={styles.btn} onClick={handleSubmit} disabled={anyLoading}>
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        <div style={styles.divider}>
          <div style={styles.dividerLine} /><span style={styles.dividerText}>o continúa con</span><div style={styles.dividerLine} />
        </div>

        <div style={styles.socialContainer}>
          <button style={styles.socialBtn} onClick={() => handleSocialLogin(googleProvider, setLoadingGoogle)} disabled={anyLoading}>
            {loadingGoogle ? "..." : <><GoogleIcon /> Google</>}
          </button>
          <button style={styles.socialBtn} onClick={() => handleSocialLogin(githubProvider, setLoadingGithub)} disabled={anyLoading}>
            {loadingGithub ? "..." : <><GithubIcon /> GitHub</>}
          </button>
          <button style={styles.socialBtn} onClick={() => handleSocialLogin(facebookProvider, setLoadingFacebook)} disabled={anyLoading}>
            {loadingFacebook ? "..." : <><FacebookIcon /> Facebook</>}
          </button>
        </div>

        <div style={styles.registerRow}>
          ¿No tienes cuenta? <Link to="/register" style={styles.link}>Regístrate gratis</Link>
        </div>
      </div>

      <div style={styles.right}>
        <div style={{ textAlign: "center", color: "#fff", zIndex: 1 }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>⚽</div>
          <div style={{ fontSize: "26px", fontWeight: 800, marginBottom: "10px" }}>Tu cancha te espera</div>
          <div style={{ fontSize: "15px", opacity: 0.8, maxWidth: "260px" }}>Reserva en segundos, juega sin complicaciones</div>
        </div>
      </div>
    </div>
  );
}
