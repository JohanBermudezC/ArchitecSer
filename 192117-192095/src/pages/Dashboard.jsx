import { useState, useEffect } from 'react';
import { onAuthStateChanged, linkWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, EmailAuthProvider, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

import {
  FaCalendarAlt,
  FaFutbol,
  FaHistory,
  FaUserCircle,
  FaGoogle,
  FaGithub,
  FaFacebook,
  FaEnvelope
} from 'react-icons/fa';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  },
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  hero: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    borderRadius: '30px',
    padding: '50px',
    marginBottom: '40px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
    textAlign: 'center'
  },
  avatar: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '6px solid #22c55e',
    boxShadow: '0 10px 30px rgba(34,197,94,.25)',
    marginBottom: '20px'
  },
  avatarFallback: {
    fontSize: '140px',
    color: '#22c55e',
    marginBottom: '10px'
  },
  title: {
    fontSize: '42px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '12px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    maxWidth: '700px',
    margin: '0 auto'
  },
  emailBadge: {
    marginTop: '20px',
    display: 'inline-block',
    background: '#ecfdf5',
    color: '#166534',
    padding: '10px 18px',
    borderRadius: '999px',
    fontWeight: 600,
    fontSize: '14px'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
    gap: '20px',
    marginTop: '40px'
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #e5e7eb'
  },
  statNumber: {
    fontSize: '30px',
    fontWeight: 800,
    color: '#22c55e'
  },
  statText: {
    color: '#64748b',
    marginTop: '8px',
    fontWeight: 500
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
    gap: '25px'
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '35px',
    textAlign: 'center',
    boxShadow: '0 8px 35px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  icon: {
    fontSize: '50px',
    color: '#22c55e',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#111827'
  },
  cardText: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.6'
  },
  btn: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    padding: '14px 30px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.2s'
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '25px',
    marginTop: '50px',
    textAlign: 'center'
  },
  providerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxWidth: '500px',
    margin: '0 auto 40px auto',
    padding: '25px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 8px 35px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  providerItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
  },
  providerItemLast: {
    borderBottom: 'none',
  },
  providerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  providerIcon: {
    fontSize: '24px',
    color: '#64748b',
  },
  providerName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
  },
  providerStatus: {
    fontSize: '14px',
    fontWeight: 500,
    padding: '5px 10px',
    borderRadius: '8px',
  },
  statusLinked: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  statusNotLinked: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  linkButton: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  unlinkButton: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    fontSize: '14px',
    color: '#ef4444',
    textAlign: 'center',
    marginTop: '15px',
    marginBottom: '15px',
  },
};

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const facebookProvider = new FacebookAuthProvider();

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkingError, setLinkingError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Si el usuario no existe en Firestore, crearlo con los datos básicos de Auth
            const initialProviders = new Set(currentUser.providerData.map(p => p.providerId));
            if (currentUser.email && currentUser.providerData.some(p => p.providerId === 'password')) {
              initialProviders.add('password');
            }
            const newUserData = {
              nombre: currentUser.displayName || '',
              email: currentUser.email,
              foto: currentUser.photoURL || '',
              proveedores: Array.from(initialProviders),
              creadoEn: serverTimestamp(),
            };
            await setDoc(doc(db, 'usuarios', currentUser.uid), newUserData);
            setUserData(newUserData);
          }
        } catch (error) {
          console.error('Error obteniendo/creando usuario en Firestore:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateFirestoreProviders = async (uid, currentAuthProviders) => {
    const userRef = doc(db, 'usuarios', uid);
    const userSnap = await getDoc(userRef);

    let providersToSave = new Set(currentAuthProviders);
    
    if (userSnap.exists()) {
      const existingInFirestore = userSnap.data().proveedores || [];
      existingInFirestore.forEach(p => providersToSave.add(p));
    }

    const providersArray = Array.from(providersToSave);
    
    await updateDoc(userRef, {
      proveedores: providersArray,
    });
    
    setUserData(prev => ({ 
      ...prev, 
      proveedores: providersArray 
    }));
  };

  const handleLinkProvider = async (provider) => {
    if (!user) return;
    setLinkingError('');

    try {
      const result = await linkWithPopup(user, provider);
      // Después de vincular, el user.providerData se actualiza automáticamente
      const currentAuthProviders = new Set(result.user.providerData.map(p => p.providerId));
      if (result.user.email) {
        const signInMethods = await fetchSignInMethodsForEmail(auth, result.user.email);
        if (signInMethods.includes('password')) {
          currentAuthProviders.add('password');
        }
      }
      await updateFirestoreProviders(result.user.uid, currentAuthProviders);
      alert(`Cuenta vinculada con ${provider.providerId.split('.')[0]} exitosamente!`);
    } catch (error) {
      console.error('Error al vincular cuenta:', error);
      if (error.code === 'auth/credential-already-in-use') {
        setLinkingError('Esta cuenta ya está vinculada a otro usuario.');
      } else if (error.code === 'auth/provider-already-linked') {
        setLinkingError('Este proveedor ya está vinculado a tu cuenta.');
      } else if (error.code === 'auth/email-already-in-use') {
        setLinkingError('El email de este proveedor ya está en uso por otra cuenta. Por favor, desvincula primero.');
      } else {
        setLinkingError(`Error al vincular: ${error.message}`);
      }
    }
  };

  const isProviderLinked = (providerId) => {
    return userData?.proveedores?.includes(providerId) || false;
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '100px'
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '100px'
        }}
      >
        No has iniciado sesión.
      </div>
    );
  }

  const nombre =
    `${userData?.nombre || ''} ${userData?.apellido || ''}`.trim() ||
    user.displayName ||
    'Usuario';

  const foto =
    userData?.foto ||
    user.photoURL;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.hero}>
          {foto ? (
            <img
              src={foto}
              alt="Perfil"
              style={styles.avatar}
            />
          ) : (
            <FaUserCircle
              style={styles.avatarFallback}
            />
          )}

          <h1 style={styles.title}>
            Bienvenido, {nombre}
          </h1>

          <p style={styles.subtitle}>
            Administra tus reservas,
            consulta tu historial y encuentra
            las mejores canchas disponibles.
          </p>

          <div style={styles.emailBadge}>
            {user.email}
          </div>

          <div style={styles.stats}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                ⚽
              </div>
              <div style={styles.statText}>
                Reserva tu cancha favorita
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                📅
              </div>
              <div style={styles.statText}>
                Gestiona tus reservas
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                📊
              </div>
              <div style={styles.statText}>
                Consulta tu historial
              </div>
            </div>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>Gestión de Cuentas Vinculadas</h2>
        <div style={styles.providerContainer}>
          {linkingError && <p style={styles.error}>{linkingError}</p>}

          <div style={styles.providerItem}>
            <div style={styles.providerInfo}>
              <FaEnvelope style={styles.providerIcon} />
              <span style={styles.providerName}>Email y Contraseña</span>
            </div>
            <span style={{ ...styles.providerStatus, ...(isProviderLinked('password') ? styles.statusLinked : styles.statusNotLinked) }}>
              {isProviderLinked('password') ? 'Vinculado' : 'No Vinculado'}
            </span>
          </div>

          <div style={styles.providerItem}>
            <div style={styles.providerInfo}>
              <FaGoogle style={styles.providerIcon} />
              <span style={styles.providerName}>Google</span>
            </div>
            {isProviderLinked('google.com') ? (
              <span style={{ ...styles.providerStatus, ...styles.statusLinked }}>Vinculado</span>
            ) : (
              <button style={styles.linkButton} onClick={() => handleLinkProvider(googleProvider)}>Vincular</button>
            )}
          </div>

          <div style={styles.providerItem}>
            <div style={styles.providerInfo}>
              <FaGithub style={styles.providerIcon} />
              <span style={styles.providerName}>GitHub</span>
            </div>
            {isProviderLinked('github.com') ? (
              <span style={{ ...styles.providerStatus, ...styles.statusLinked }}>Vinculado</span>
            ) : (
              <button style={styles.linkButton} onClick={() => handleLinkProvider(githubProvider)}>Vincular</button>
            )}
          </div>

          <div style={{ ...styles.providerItem, ...styles.providerItemLast }}>
            <div style={styles.providerInfo}>
              <FaFacebook style={styles.providerIcon} />
              <span style={styles.providerName}>Facebook</span>
            </div>
            {isProviderLinked('facebook.com') ? (
              <span style={{ ...styles.providerStatus, ...styles.statusLinked }}>Vinculado</span>
            ) : (
              <button style={styles.linkButton} onClick={() => handleLinkProvider(facebookProvider)}>Vincular</button>
            )}
          </div>
        </div>

        <div style={styles.cards}>
          <div style={styles.card}>
            <FaCalendarAlt style={styles.icon} />

            <h3 style={styles.cardTitle}>
              Mis Reservas
            </h3>

            <p style={styles.cardText}>
              Consulta, administra y organiza
              todas tus reservas activas.
            </p>

            <button style={styles.btn} onClick={() => navigate("/reservas")}>
              Ver Reservas
            </button>
          </div>

          <div style={styles.card}>
            <FaFutbol style={styles.icon} />
            <h3 style={styles.cardTitle}>
              Buscar Canchas
            </h3>

            <p style={styles.cardText}>
              Encuentra canchas disponibles
              cerca de ti y reserva fácilmente.
            </p>

          <button
  style={styles.btn}
  onClick={() => {
    navigate("/buscar-canchas");
        
        }}
>
            Buscar
</button>
        </div>

          <div style={styles.card}>
            <FaHistory style={styles.icon} />

            <h3 style={styles.cardTitle}>
              Historial de Sesiones
            </h3>

            <p style={styles.cardText}>
              Revisa toda tu actividad,
              accesos y sesiones anteriores.
            </p>

            <Link to="/history">
              <button style={styles.btn}>
                Ver Historial
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;
