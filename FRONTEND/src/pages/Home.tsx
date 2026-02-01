import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const Home = () => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [modalityFilter, setModalityFilter] = useState('Todos');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (err) {
      console.error("Error al cargar empleos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const results = jobs.filter(job => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        job.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesType =
        typeFilter === 'Todos' || job.job_type === typeFilter;

      const matchesModality =
        modalityFilter === 'Todos' || job.modality === modalityFilter;

      return matchesSearch && matchesLocation && matchesType && matchesModality;
    });

    setFilteredJobs(results);
  }, [searchTerm, locationFilter, typeFilter, modalityFilter, jobs]);

  return (
    <>
      <header className="hero-section">
        <h1>El mercado laboral para <span>Devs</span></h1>
        <p>Busca por ciudad, con el mejor talento dev.</p>
      </header>

      <div className="feed-container">
        <div
          className="search-section-premium"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'white',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}
        >
          {/* Inputs de búsqueda */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Puesto, empresa o tecnología..."
              style={{ flex: 2, minWidth: '250px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <input
              type="text"
              placeholder="📍 Ciudad o país..."
              style={{ flex: 1, minWidth: '180px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            />
          </div>

          {/* Sección de Filtros (Pills) */}
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Filtro de Tipo de Trabajo */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', alignSelf: 'center', fontWeight: '500' }}>Tipo:</span>
              {['Todos', 'Full-time', 'Part-time', 'Freelance'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`pill ${typeFilter === type ? 'active' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Filtro de Modalidad (NUEVO) */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', alignSelf: 'center', fontWeight: '500' }}>Modalidad:</span>
              {['Todos', 'Remoto', 'Presencial', 'Hibrido'].map(mod => (
                <button
                  key={mod}
                  onClick={() => setModalityFilter(mod)}
                  className={`pill ${modalityFilter === mod ? 'active' : ''}`}
                >
                  {mod}
                </button>
              ))}
            </div>

          </div>
        </div>

        <div className="jobs-list" style={{ marginTop: '30px' }}>
          {loading ? <div className="spinner"></div> :
            filteredJobs.slice(0, visibleCount).map(job => (
              <div
                key={job.id}
                className="job-card-premium"
                onClick={() => navigate(`/job/${job.id}`)}
              >
                <div className="job-info-main">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge-premium" style={{ fontSize: '0.7rem' }}>{job.job_type}</span>
                    <span className="badge-premium" style={{ fontSize: '0.7rem', background: '#f0fdf4', color: '#16a34a' }}>{job.modality}</span>
                  </div>
                  <h3>{job.title}</h3>
                  <p>{job.company} — {job.location}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(job.id); 
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Heart
                    size={20}
                    fill={favorites.some(favId => String(favId) === String(job.id)) ? '#ef4444' : 'none'}
                    color={favorites.some(favId => String(favId) === String(job.id)) ? '#ef4444' : '#64748b'}
                  />
                </button>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Home;