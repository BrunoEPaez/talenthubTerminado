import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Heart, Briefcase, Users, UploadCloud, MapPin, Building2, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'favs' | 'applied' | 'my-posts'>('favs');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('userEmail');
  const [cvName, setCvName] = useState(localStorage.getItem(`${userEmail}_cvName`));
  const API_BASE = "https://yucky-rina-emmanuelnovo-3439a4c7.koyeb.app"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [favsRes, appsRes, receivedRes] = await Promise.all([
          api.get('/favorites').catch(() => ({ data: [] })),
          api.get('/applications').catch(() => ({ data: [] })),
          api.get('/my_job_applications').catch(() => ({ data: [] }))
        ]);

        setFavorites(Array.isArray(favsRes.data) ? favsRes.data : (favsRes.data.favorites || []));
        setMyApplications(Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data.applications || []));
        setReceivedApplications(Array.isArray(receivedRes.data) ? receivedRes.data : (receivedRes.data.received || receivedRes.data.applications || []));
        
      } catch (err) {
        console.error("Error al cargar datos del dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userEmail) return;

    const formData = new FormData();
    formData.append('cv', file);
    // Ya no es estrictamente necesario enviar el email porque el backend usa el Token

    try {
      // ✅ IMPORTANTE: Quitamos el '/' inicial si tu axios client ya tiene '/api'
      const res = await api.put('profile/update_cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newCvName = res.data.cv_name;
      setCvName(newCvName);
      localStorage.setItem(`${userEmail}_cvName`, newCvName);
      alert("¡CV actualizado con éxito!");
    } catch (err: any) { 
      console.error(err);
      alert(err.response?.data?.error || "Error al subir el CV."); 
    }
  };

  return (
    <div className="feed-container" style={{ maxWidth: '900px', margin: '40px auto' }}>
      <div className="dashboard-card" style={{ background: 'white', padding: '30px', borderRadius: '24px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>Mi Panel</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '5px' }}>{userEmail}</p>
          </div>
          <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}>
            <UploadCloud size={18} /> {cvName ? 'Cambiar CV' : 'Subir CV'}
            <input type="file" hidden accept=".pdf" onChange={handleCvUpload} />
          </label>
        </div>
        {cvName && <p style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CheckCircle size={14} /> CV Activo: {cvName}
        </p>}
      </div>

      <div className="tabs-container" style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button className={`tab-btn-modern ${tab === 'favs' ? 'active' : ''}`} onClick={() => setTab('favs')}><Heart size={18}/> Favoritos</button>
        <button className={`tab-btn-modern ${tab === 'applied' ? 'active' : ''}`} onClick={() => setTab('applied')}><Briefcase size={18}/> Mis Postulaciones</button>
        <button className={`tab-btn-modern ${tab === 'my-posts' ? 'active' : ''}`} onClick={() => setTab('my-posts')}><Users size={18}/> Candidatos</button>
      </div>

      <div className="tab-content">
        {loading ? <div className="spinner" style={{margin: '50px auto'}}></div> : (
          <div className="jobs-list">
            {tab === 'favs' && (
              favorites.length > 0 ? favorites.map(f => {
                const job = f.job || f;
                const jobId = f.job_id || f.id;
                return (
                  <div key={f.id} className="job-card-premium clickable-card" onClick={() => navigate(`/job/${jobId}`)}>
                    <div className="job-info-main">
                      <h3 style={{ color: '#2563eb' }}>{job.title || job.job_title}</h3>
                      <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', margin: '5px 0' }}>
                        <Building2 size={14}/> {job.company}
                      </p>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Haz clic para ver más →</span>
                    </div>
                    <Heart size={22} fill="#ef4444" color="#ef4444" />
                  </div>
                )
              }) : <p className="empty-state">No tienes favoritos guardados.</p>
            )}
            
            {tab === 'applied' && (
              myApplications.length > 0 ? myApplications.map(app => {
                const job = app.job || app;
                const jobId = app.job_id || job.id;
                return (
                  <div key={app.id} className="job-card-premium clickable-card" onClick={() => navigate(`/job/${jobId}`)}>
                    <div className="job-info-main">
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{job.title || job.job_title}</h3>
                      <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '0.95rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Building2 size={16}/> {job.company}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16}/> {job.location}</span>
                      </div>
                    </div>
                    <span className="status-pill">Postulado</span>
                  </div>
                )
              }) : <p className="empty-state">Aún no te has postulado.</p>
            )}

            {tab === 'my-posts' && (
              receivedApplications.length > 0 ? receivedApplications.map(app => (
                <div key={app.id} className="job-card-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{app.user_email || app.user?.email}</h3>
                    <p style={{ color: '#64748b' }}>Trabajo: {app.job_title || app.job?.title}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => app.cv_url ? window.open(`${API_BASE}${app.cv_url}`, '_blank') : alert("No hay CV")}>Ver CV</button>
                    <a href={`mailto:${app.user_email}`} className="btn-primary-small">Contactar</a>
                  </div>
                </div>
              )) : <p className="empty-state">Sin candidatos nuevos.</p>
            )}
          </div>
        )}
      </div>

      <style>{`
        .clickable-card { cursor: pointer; transition: 0.2s; }
        .clickable-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        .tab-btn-modern { background: none; border: none; padding: 10px 20px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 500; color: #64748b; border-radius: 12px; }
        .tab-btn-modern.active { color: #2563eb; background: #eff6ff; }
        .status-pill { background: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .empty-state { text-align: center; padding: 50px; color: #94a3b8; }
        .btn-primary-small { background: #0f172a; color: white; padding: 8px 16px; border-radius: 10px; text-decoration: none; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};

export default Dashboard;