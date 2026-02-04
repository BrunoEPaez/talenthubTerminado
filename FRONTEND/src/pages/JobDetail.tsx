import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Heart, ArrowLeft, CheckCircle } from 'lucide-react'; // Quitamos AlertCircle de aquí
import { useFavorites } from '../context/FavoritesContext';

const JobDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false); 
  const token = localStorage.getItem('token');

  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some(favId => String(favId) === String(id));

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/jobs/${id}`);
        const jobData = res.data.job || res.data;
        setJob(jobData);

        if (token) {
          const appsRes = await api.get('/applications');
          const hasApplied = appsRes.data.some((app: any) => {
            const appId = app.job_id || app.job?.id;
            return String(appId) === String(id);
          });
          setIsApplied(hasApplied);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, token]);

  const handleToggleFavorite = async () => {
    if (!token) return navigate('/login');
    try {
      await toggleFavorite(Number(id));
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const handleApplyToggle = async () => {
    if (!token) return navigate('/login');
    
    try {
      if (isApplied) {
        await api.delete('/applications', { data: { job_id: id } });
        setIsApplied(false);
        alert("Postulación retirada.");
      } else {
        // Enviamos el job_id. Rails usará el CV que el usuario ya tiene en el server.
        await api.post('/applications', { job_id: id });
        setIsApplied(true);
        alert("¡Postulación enviada con éxito!");
      }
    } catch (err: any) {
      console.error("Error en postulación:", err);
      if (err.response?.status === 422) {
        alert("Por favor, sube tu CV en el Dashboard antes de postularte.");
        navigate('/dashboard');
      } else {
        alert("Hubo un error al procesar la postulación.");
      }
    }
  };

  if (loading) return <div className="spinner" style={{margin: '100px auto'}}></div>;
  if (!job) return <div style={{textAlign: 'center', padding: '50px'}}>Trabajo no encontrado.</div>;

  return (
    <div className="feed-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <button onClick={() => navigate(-1)} className="btn-text" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={18} /> Volver
      </button>
      
      <div className="job-detail-card" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2.3rem', color: '#0f172a', margin: 0, lineHeight: '1.2' }}>{job.title}</h1>
            <p style={{ color: '#64748b', fontSize: '1.2rem', marginTop: '10px' }}>{job.company} • {job.location}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <span className="badge-premium">{job.job_type || 'Full-time'}</span>
              <span className="badge-premium">{job.modality || 'Remoto'}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={handleToggleFavorite} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
              <Heart size={32} color={isFavorite ? "#ef4444" : "#cbd5e1"} fill={isFavorite ? "#ef4444" : "none"} />
            </button>
            
            <button 
              onClick={handleApplyToggle}
              style={{
                backgroundColor: isApplied ? '#ecfdf5' : '#2563eb',
                color: isApplied ? '#059669' : 'white',
                border: isApplied ? '1px solid #10b981' : 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                minWidth: '160px',
                justifyContent: 'center'
              }}
            >
              {isApplied ? (
                <>
                  <CheckCircle size={18} />
                  <span>Postulado</span>
                </>
              ) : (
                <span>Postularme</span>
              )}
            </button>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '30px 0' }} />
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>Descripción del puesto</h3>
          <div 
            style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#334155', whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={job.description?.includes('<') ? { __html: job.description } : undefined}
          >
            {!job.description?.includes('<') && job.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;