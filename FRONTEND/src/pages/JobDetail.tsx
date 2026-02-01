import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Heart } from 'lucide-react';
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
        // 1. Cargar datos del trabajo
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.job || res.data);

        // 2. Verificar si el usuario ya está postulado
        if (token) {
          const appsRes = await api.get('/applications');
          // NORMALIZACIÓN: Convertimos ambos a String para asegurar que la comparación funcione
          const hasApplied = appsRes.data.some((app: any) => String(app.job_id) === String(id));
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
        // ❌ RETIRAR POSTULACIÓN
        // Axios requiere enviar el body en la propiedad 'data' para el método DELETE
        await api.delete('/applications', { data: { job_id: id } });
        setIsApplied(false);
        alert("Postulación retirada.");
      } else {
        // 📝 POSTULARSE
        const formData = new FormData();
        formData.append('job_id', String(id));
        const userEmail = localStorage.getItem('userEmail');
        const base64File = localStorage.getItem(`${userEmail}_cvFile`);
        
        if (!base64File) {
          alert("Sube tu CV en el Dashboard antes de postularte.");
          return navigate('/dashboard');
        }

        const fileRes = await fetch(base64File);
        const blob = await fileRes.blob();
        formData.append('cv', blob, "mi_cv.pdf");

        await api.post('/applications', formData);
        setIsApplied(true);
        alert("¡Postulación enviada!");
      }
    } catch (err: any) {
      console.error("Error en postulación:", err);
      alert("Hubo un error al procesar la postulación.");
    }
  };

  if (loading) return <div className="spinner" style={{margin: '100px auto'}}></div>;
  if (!job) return <div style={{textAlign: 'center', padding: '50px'}}>Trabajo no encontrado.</div>;

  return (
    <div className="feed-container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <button onClick={() => navigate(-1)} className="btn-text" style={{ marginBottom: '20px' }}>← Volver</button>
      
      <div className="job-detail-card" style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.3rem', color: '#0f172a', margin: 0 }}>{job.title}</h1>
            <p style={{ color: '#64748b', fontSize: '1.2rem', marginTop: '10px' }}>{job.company} • {job.location}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <span className="badge-premium">{job.job_type}</span>
              <span className="badge-premium">{job.modality}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={handleToggleFavorite} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <Heart size={32} color={isFavorite ? "#ef4444" : "#cbd5e1"} fill={isFavorite ? "#ef4444" : "none"} />
            </button>
            
            <button 
              className={isApplied ? "btn-danger" : "btn-secondary"} 
              onClick={handleApplyToggle}
              style={isApplied ? { backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' } : {}}
            >
              {isApplied ? 'Retirar postulación' : 'Postularme'}
            </button>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '30px 0' }} />
        
        <div 
          style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#334155', whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={job.description?.includes('<') ? { __html: job.description } : undefined}
        >
          {!job.description?.includes('<') && job.description}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;