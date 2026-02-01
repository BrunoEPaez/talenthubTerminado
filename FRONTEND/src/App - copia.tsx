import { useEffect, useState } from 'react';
import { api } from './api/client';
import './App.css';
import { Heart } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';


interface Job {
  id: number;
  user_id?: number;
  title: string;
  company: string;
  description: string;
  location: string;
  job_type: string; 
  modality: string; 
  created_at?: string;
  external?: boolean;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigateTo = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0); // Opcional: sube al inicio de la página al cambiar de ruta
  };
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [currentUserId, setCurrentUserId] = useState<number | null>(localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [modalityFilter, setModalityFilter] = useState('Todos');

  const [favorites, setFavorites] = useState<number[]>([]);
  const [myApplications, setMyApplications] = useState<Job[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
  const [cvName, setCvName] = useState<string | null>(localStorage.getItem(`${currentUserEmail}_cvName`));
  const [cvFile, setCvFile] = useState<File | null>(null); // <-- Nuevo: guarda el archivo real

  const [dashboardTab, setDashboardTab] = useState<'my-posts' | 'favs' | 'applied'>('favs');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [authData, setAuthData] = useState({ email: '', password: '', password_confirmation: '' });
  const [newJob, setNewJob] = useState({ 
    title: '', 
    company: '', 
    description: '', 
    location: '', 
    job_type: 'Full-time', 
    modality: 'Remoto' 
  });


// ✅ USA ESTA VERSIÓN:
useEffect(() => {
  fetchJobs(); // Carga los empleos siempre al iniciar
  
  if (token) {
    // Configuramos el token en la instancia de API por si acaso
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Cargamos Favoritos del servidor
    api.get('/favorites')
      .then(res => {
        const ids = res.data.map((fav: any) => fav.job_id);
        setFavorites(ids);
      })
      .catch(err => console.error("Error al cargar favoritos:", err));

    // Cargamos Mis Postulaciones
    api.get('/applications')
      .then(res => setMyApplications(res.data))
      .catch(err => console.error("Error al cargar postulaciones:", err));

    // Cargamos Postulaciones Recibidas
    api.get('/my_job_applications')
      .then(res => setReceivedApplications(res.data))
      .catch(err => console.error("Error al cargar candidatos:", err));
  }
}, [token]); // Solo depende del token

  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem(`${currentUserEmail}_favs`, JSON.stringify(favorites));
      localStorage.setItem(`${currentUserEmail}_apps`, JSON.stringify(myApplications));
    }
  }, [favorites, myApplications, currentUserEmail]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get<Job[]>('http://localhost:3000/jobs');
      const localJobs = res.data.map((j: Job) => ({ ...j, external: false }));
      const sorted = localJobs.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setJobs(sorted);
      setFilteredJobs(sorted);
    } catch (error) {
      console.error("Error cargando empleos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchJobs();
  
  // Si el usuario ya está logueado, traemos sus favoritos de la base de datos
  if (token) {
    api.get('/favorites').then(res => {
      // Guardamos solo los IDs en el estado
      const ids = res.data.map((fav: any) => fav.job_id);
      setFavorites(ids);
    }).catch(err => console.log("Error cargando favoritos"));
  }
}, [token]);

  useEffect(() => {
    const results = jobs.filter(job => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = job.title.toLowerCase().includes(term) || job.company.toLowerCase().includes(term);
      const matchesLocation = job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesType = typeFilter === 'Todos' || job.job_type === typeFilter;
      const matchesModality = modalityFilter === 'Todos' || job.modality === modalityFilter;
      return matchesSearch && matchesLocation && matchesType && matchesModality;
    });
    setFilteredJobs(results);
    setVisibleCount(12);
  }, [searchTerm, locationFilter, typeFilter, modalityFilter, jobs]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('http://localhost:3000/api/register', {
        user: {
          email: authData.email.trim(),
          password: authData.password,
          password_confirmation: authData.password_confirmation
        }
      });
      alert("¡Registro completado!");
      MapsTo('/login');
    } catch (error) {
      alert("Error en el registro");
    }
  };


const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // 1. Usamos 'api' en lugar de 'axios' para mantener la coherencia
    const res = await api.post('/api/login', {
      user: { email: authData.email.trim(), password: authData.password }
    });

    const { token, user } = res.data;

    // 2. Guardamos en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id.toString());
    localStorage.setItem('userEmail', user.email);

    // 3. ACTUALIZACIÓN CRÍTICA:
    // Le avisamos a nuestra instancia de API que use el nuevo token de inmediato
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 4. Seteamos estados
    setToken(token);
    setCurrentUserId(Number(user.id));
    setCurrentUserEmail(user.email);
    
    MapsTo('/');
    fetchJobs(); 
  } catch (error) {
    console.error("Login error:", error);
    alert("Email o contraseña incorrectos");
  }
};

  const handleLogout = () => {
    localStorage.clear(); 
    setToken(null);
    setCurrentUserEmail(null);
    setCurrentUserId(null); 
    setJobs([]);
    setFilteredJobs([]);
    fetchJobs();
    MapsTo('/');
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    const config = { headers: { Authorization: `Bearer ${currentToken}` } };
    try {
      if (editingId) {
        await api.patch(`http://localhost:3000/jobs/${editingId}`, { job: newJob }, config);
        alert("¡Empleo actualizado con éxito!");
      } else {
        await api.post('http://localhost:3000/jobs', { job: newJob }, config);
        alert("¡Publicado con éxito!");
      }
      setNewJob({ title: '', company: '', description: '', location: '', job_type: 'Full-time', modality: 'Remoto' });
      setEditingId(null);
      await fetchJobs(); 
      MapsTo('/dashboard');
      setDashboardTab('my-posts');
    } catch (err) {
      alert("Hubo un error al procesar la solicitud.");
    }
  };

  const handleDelete = async (jobId: number) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar este empleo?")) {
      try {
        await api.delete(`http://localhost:3000/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        alert("Empleo eliminado");
        fetchJobs();
      } catch {
        alert("No tienes permiso para eliminar este empleo.");
      }
    }
  };



  // Busca alrededor de la línea 150-200, antes del return
const handleToggleFavorite = async (jobId: number) => {
  if (!token) {
    alert("Debes iniciar sesión para guardar favoritos");
    navigateTo('/login');
    return;
  }

  const isFavorite = favorites.includes(jobId);

  try {
    if (isFavorite) {
      // Si ya es favorito, lo eliminamos en el backend
      await api.delete('/favorites', { data: { job_id: jobId } });
      // Actualizamos el estado visual eliminando el ID
      setFavorites(prev => prev.filter(id => id !== jobId));
    } else {
      // Si no es favorito, lo guardamos en el backend
      await api.post('/favorites', { job_id: jobId });
      // Actualizamos el estado visual agregando el ID
      setFavorites(prev => [...prev, jobId]);
    }
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    alert("No se pudo guardar el favorito. Revisa la conexión con el servidor.");
  }
};


  const handleApply = async (job: Job) => {
  if (!token) { MapsTo('/login'); return; }
  
  // Verificamos si tiene un CV cargado
  if (!cvFile) {
    alert("Por favor, carga tu CV en 'Mi Actividad' antes de postularte.");
    MapsTo('/dashboard');
    setDashboardTab('favs'); // O donde tengas el botón de carga
    return;
  }

  try {
    const formData = new FormData();
    formData.append('job_id', job.id.toString());
    formData.append('cv', cvFile); // Adjuntamos el archivo físico

    await api.post('http://localhost:3000/applications', formData, { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' // Indica que va un archivo
      } 
    });

    const resApp = await api.get("http://localhost:3000/applications", { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    setMyApplications(resApp.data);
    alert("¡Te has postulado con éxito enviando tu CV!");
  } catch (error) {
    alert("Error al postularte. Asegúrate de que el archivo sea válido.");
  }
};
  
  const handleRemoveApplication = async (e: React.MouseEvent, applicationId: number) => {
  e.stopPropagation();
  if (!window.confirm("¿Deseas retirar tu postulación?")) return;
  
  try {
    await api.delete(`http://localhost:3000/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMyApplications(prev => prev.filter(app => app.id !== applicationId));
    alert("Postulación retirada.");
  } catch (error) {
    alert("Error al retirar la postulación.");
  }
};
  

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setCvFile(file); // Guardamos el archivo en memoria
    setCvName(file.name);
    if (currentUserEmail) {
      localStorage.setItem(`${currentUserEmail}_cvName`, file.name);
    }
    alert("CV preparado para enviar: " + file.name);
  }
};




  return (
    <div className="app-layout">
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-left" onClick={() => navigateTo('/')} style={{ cursor: 'pointer' }}>
            <span className="brand-logo">TalentHub</span>
          </div>
          <div className="nav-right">
            {token ? (
              <>
                <span style={{ marginRight: '15px', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                  Hola, <strong>{currentUserEmail?.split('@')[0]}</strong>
                </span>
                <button className="btn-text" onClick={() => MapsTo('/dashboard')}>Mi Actividad</button>
                <button className="btn-secondary" onClick={() => { setEditingId(null); MapsTo('/create'); }}>+ Publicar Empleo</button>
                <button className="btn-text" onClick={handleLogout}>Salir</button>
              </>
            ) : (
              <button className="btn-primary-full" onClick={() => MapsTo('/login')} style={{ padding: '8px 20px' }}>Entrar</button>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
  <Routes>
    {/* VISTA: HOME (RUTA PRINCIPAL) */}
    <Route path="/" element={
      <>
        <header className="hero-section">
          <h1>El mercado laboral para <span>Devs</span></h1>
          <p>Busca por ciudad, con el mejor talento dev.</p>
        </header>

        <div className="feed-container">
          {/* Sección de Búsqueda */}
          <div className="search-section-premium" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="🔍 Puesto, empresa o tecnología..." style={{ flex: 2, minWidth: '250px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <input type="text" placeholder="📍 Ciudad o país..." style={{ flex: 1, minWidth: '180px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
              <button className="btn-secondary" style={{ padding: '0 30px', borderRadius: '12px', fontWeight: 'bold' }} onClick={() => setVisibleCount(12)}>Buscar</button>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Jornada:</span>
                {['Todos', 'Full-time', 'Part-time', 'Freelance'].map(type => (
                  <button key={type} onClick={() => setTypeFilter(type)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '0.85rem', cursor: 'pointer', background: typeFilter === type ? '#2563eb' : 'white', color: typeFilter === type ? 'white' : '#64748b' }}>{type}</button>
                ))}
              </div>
              <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }}></div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Modalidad:</span>
                {['Todos', 'Remoto', 'Presencial', 'Híbrido'].map(mod => (
                  <button key={mod} onClick={() => setModalityFilter(mod)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '0.85rem', cursor: 'pointer', background: modalityFilter === mod ? '#2563eb' : 'white', color: modalityFilter === mod ? 'white' : '#64748b' }}>{mod}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Empleos */}
          <div className="jobs-list" style={{ marginTop: '30px' }}>
            {loading ? (
              <div className="spinner-container">
                <div className="spinner"></div>
                <p style={{ marginTop: '15px', color: '#64748b', fontWeight: '500' }}>Buscando las mejores ofertas...</p>
              </div>
            ) : (
              filteredJobs.slice(0, visibleCount).map(job => (
                <div key={job.id} className="job-card-premium" onClick={() => { setSelectedJob(job); navigateTo(`/job/${job.id}`); }}>
                  <div className="job-info-main">
                    <h3>{job.title}</h3>
                    <p>{job.company} — {job.location}</p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#e2e8f0' }}>{job.job_type}</span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#e2e8f0' }}>{job.modality}</span>
                      {job.created_at && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📅 {new Date(job.created_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="job-card-actions">
                    <button className={`btn-favorite ${favorites.includes(job.id) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleToggleFavorite(job.id); }}>
                      <Heart size={20} fill={favorites.includes(job.id) ? "#ef4444" : "none"} color={favorites.includes(job.id) ? "#ef4444" : "#64748b"} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && filteredJobs.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '60px' }}>
              <button className="btn-primary-full" style={{ width: 'auto', padding: '12px 40px', fontSize: '1rem' }} onClick={() => setVisibleCount(prev => prev + 12)}>Mostrar más ofertas</button>
            </div>
          )}
        </div>
      </>
    } />

    {/* VISTA: DASHBOARD */}
    <Route path="/dashboard" element={
      <div className="feed-container" style={{ marginTop: '40px' }}>
        <div className="dashboard-header">
          <div style={{ marginBottom: '25px', borderLeft: '4px solid #2563eb', paddingLeft: '15px', display: 'flex', alignItems: 'baseline', gap: '15px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Mi Actividad</h2>
            <span style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>
              | Usuario: <strong style={{ color: '#2563eb' }}>{currentUserEmail}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
            <div className="dashboard-tabs" style={{ display: 'flex', gap: '10px' }}>
              <button className={`btn-outline ${dashboardTab === 'favs' ? 'active' : ''}`} onClick={() => setDashboardTab('favs')}>Favoritos ({favorites.length})</button>
              <button className={`btn-outline ${dashboardTab === 'applied' ? 'active' : ''}`} onClick={() => setDashboardTab('applied')}>Postulaciones ({myApplications.length})</button>
              <button className={`btn-outline ${dashboardTab === 'my-posts' ? 'active' : ''}`} onClick={() => setDashboardTab('my-posts')}>Mis Empleos</button>
            </div>
            <label className="btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {cvName ? `📄 ${cvName.substring(0, 12)}...` : '📤 Cargar CV'}
              <input type="file" onChange={handleFileUpload} hidden accept=".pdf,.doc,.docx" />
            </label>
          </div>
        </div>

        <div className="jobs-list">
          {dashboardTab === 'favs' && (
            jobs.filter(j => favorites.includes(j.id)).length > 0 ? (
              jobs.filter(j => favorites.includes(j.id)).map(job => (
                <div key={job.id} className="job-card-premium" onClick={() => { setSelectedJob(job); navigateTo(`/job/${job.id}`); }}>
                  <div className="job-info-main">
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                  </div>
                  <button className="btn-text" onClick={(e) => { e.stopPropagation(); handleToggleFavorite(job.id); }}>❤️</button>
                </div>
              ))
            ) : <p>No tienes favoritos guardados.</p>
          )}

          {dashboardTab === 'applied' && (
            myApplications.length > 0 ? (
              myApplications.map(job => (
                <div key={job.id} className="job-card-premium" onClick={() => { setSelectedJob(job); navigateTo(`/job/${job.id}`); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{job.title}</h3>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#64748b' }}>{job.company}</p>
                    <span className="badge-applied" style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.8rem' }}>✓ Postulado</span>
                  </div>
                  <button className="btn-text" onClick={(e) => handleRemoveApplication(e, job.id)} style={{ fontSize: '1.2rem', color: '#ef4444', padding: '10px' }} title="Retirar postulación">🗑️</button>
                </div>
              ))
            ) : <p>No te has postulado a ninguna oferta aún.</p>
          )}

          {dashboardTab === 'my-posts' && (
            <div className="my-posts-container" style={{ width: '100%' }}>
              {jobs.filter(j => Number(j.user_id) === Number(currentUserId)).length > 0 ? (
                jobs.filter(j => Number(j.user_id) === Number(currentUserId)).map(job => {
                  const applicants = receivedApplications.filter((app: any) => app.job_id === job.id);
                  return (
                    <div key={job.id} className="job-card-premium" style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="job-info-main" onClick={() => { setSelectedJob(job); navigateTo(`/job/${job.id}`); }} style={{ cursor: 'pointer', flex: 1 }}>
                          <h3 style={{ margin: 0 }}>{job.title}</h3>
                          <p style={{ margin: '4px 0', color: '#64748b' }}>{job.company} (Tu aviso)</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-text" onClick={() => { setNewJob(job); setEditingId(job.id); navigateTo('/create'); }}>Edit</button>
                          <button className="btn-text" style={{ color: '#ef4444' }} onClick={() => handleDelete(job.id)}>Delete</button>
                        </div>
                      </div>
                      <div style={{ marginTop: '15px', padding: '15px', background: '#f1f5f9', borderRadius: '8px' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', color: '#475569' }}>👤 Candidatos postulados: {applicants.length}</p>
                        {applicants.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'disc' }}>
                            {applicants.map((app: any, idx: number) => (
                              <li key={idx} style={{ fontSize: '0.85rem', color: '#2563eb', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                <span>
                                  <strong>{app.user?.email}</strong> 
                                  <span style={{ color: '#64748b' }}> (Postulado el {new Date(app.created_at).toLocaleDateString()})</span>
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {app.cv_url ? (
                                    <a href={`http://localhost:3000${app.cv_url}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: '#2563eb', padding: '4px 10px', borderRadius: '6px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>📄 Ver CV</a>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sin CV adjunto</span>
                                  )}
                                  <a href={`mailto:${app.user?.email}?subject=Contacto por tu postulación a ${job.title}`} style={{ textDecoration: 'none', background: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', color: '#475569', fontSize: '0.75rem', fontWeight: 'bold' }}>📧 Contactar</a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Sin candidatos aún.</p>}
                      </div>
                    </div>
                  );
                })
              ) : <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc' }}><p>No tienes empleos publicados.</p></div>}
            </div>
          )}
        </div>
      </div>
    } />

    {/* VISTA: LOGIN */}
    <Route path="/login" element={
      <div className="centered-form-wrapper">
        <div className="auth-card-premium">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin} className="form-group">
            <label>Email</label>
            <input type="email" required onChange={e => setAuthData({ ...authData, email: e.target.value })} />
            <label>Contraseña</label>
            <input type="password" required onChange={e => setAuthData({ ...authData, password: e.target.value })} />
            <button type="submit" className="btn-primary-full">Entrar</button>
            <p onClick={() => navigateTo('/register')} style={{ cursor: 'pointer', marginTop: '10px', textAlign: 'center' }}>¿No tienes cuenta? Regístrate</p>
          </form>
        </div>
      </div>
    } />

    {/* VISTA: REGISTER */}
    <Route path="/register" element={
      <div className="centered-form-wrapper">
        <div className="auth-card-premium">
          <h2>Crear Cuenta</h2>
          <form onSubmit={handleRegister} className="form-group">
            <label>Email</label>
            <input type="email" required onChange={e => setAuthData({ ...authData, email: e.target.value })} />
            <label>Contraseña</label>
            <input type="password" required onChange={e => setAuthData({ ...authData, password: e.target.value })} />
            <label>Confirmar Contraseña</label>
            <input type="password" required onChange={e => setAuthData({ ...authData, password_confirmation: e.target.value })} />
            <button type="submit" className="btn-primary-full">Registrarse</button>
            <p onClick={() => navigateTo('/login')} style={{ cursor: 'pointer', marginTop: '10px', textAlign: 'center' }}>Ya tengo cuenta</p>
          </form>
        </div>
      </div>
    } />

    {/* VISTA: CREAR/EDITAR */}
    <Route path="/create" element={
      <div className="centered-form-wrapper">
        <div className="auth-card-premium" style={{ maxWidth: '550px' }}>
          <h2 style={{ marginBottom: '25px' }}>{editingId ? 'Editar Empleo' : 'Publicar Nuevo Empleo'}</h2>
          <form onSubmit={handleSaveJob} className="form-group">
            <label>Título del Puesto</label>
            <input type="text" placeholder="Ej: Senior Frontend Developer" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required />
            <label>Empresa</label>
            <input type="text" placeholder="Nombre de la empresa" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} required />
            <label>Ubicación (Ciudad, País)</label>
            <input type="text" placeholder="Ej: Barcelona, España" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} required />
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>Tipo de Jornada</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Full-time', 'Part-time', 'Freelance'].map(type => (
                  <button key={type} type="button" onClick={() => setNewJob({ ...newJob, job_type: type })} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.9rem', background: newJob.job_type === type ? '#2563eb' : 'white', color: newJob.job_type === type ? 'white' : '#64748b' }}>{type}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>Modalidad</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Remoto', 'Presencial', 'Híbrido'].map(mod => (
                  <button key={mod} type="button" onClick={() => setNewJob({ ...newJob, modality: mod })} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.9rem', background: newJob.modality === mod ? '#2563eb' : 'white', color: newJob.modality === mod ? 'white' : '#64748b' }}>{mod}</button>
                ))}
              </div>
            </div>
            <label>Descripción detallada</label>
            <textarea rows={6} value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} required />
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="submit" className="btn-primary-full">{editingId ? 'Guardar Cambios' : 'Publicar Ahora'}</button>
              <button type="button" className="btn-text" onClick={() => navigateTo('/')}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    } />

    {/* VISTA: DETALLE (CON PARÁMETRO ID) */}
    <Route path="/job/:id" element={
      selectedJob && (
        <div className="feed-container" style={{ marginTop: '40px' }}>
          <div className="job-detail-card" style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <button className="btn-text" onClick={() => navigateTo('/')} style={{ marginBottom: '20px' }}>← Volver</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{selectedJob.title}</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontWeight: 'bold', fontSize: '0.8rem' }}>{selectedJob.job_type}</span>
                  <span style={{ padding: '4px 12px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', fontSize: '0.8rem' }}>{selectedJob.modality}</span>
                </div>
              </div>
              <button className="btn-secondary" onClick={() => handleApply(selectedJob)}>Postularme</button>
            </div>
            <p style={{ color: '#64748b', fontSize: '1.2rem', margin: '20px 0 30px 0' }}>{selectedJob.company} • {selectedJob.location}</p>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />
            <div className="job-description" style={{ lineHeight: '1.6', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
          </div>
        </div>
      )
    } />
  </Routes>
</main>





      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="brand-logo">TalentHub</span>
            <p>Conectando el mejor talento dev con las mejores oportunidades.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Navegación</h4>
              <button className="btn-footer-link" onClick={() => { window.scrollTo(0, 0); MapsTo('/'); }}>Inicio</button>
              <button className="btn-footer-link" onClick={() => { window.scrollTo(0, 0); MapsTo('/create'); }}>Publicar Empleo</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 TalentHub. Proyecto Portfolio.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;