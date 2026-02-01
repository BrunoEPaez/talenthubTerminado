import { useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

const CreateJob = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState({ 
    title: '', 
    company: '', 
    location: '', 
    description: '', 
    job_type: 'Full-time', // Valor por defecto
    modality: 'Remoto'     // Valor por defecto
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Enviamos el objeto job tal cual al backend de Rails
      await api.post('/jobs', { job });
      alert("¡Empleo publicado con éxito!");
      navigate('/dashboard');
    } catch (err) { 
      console.error(err);
      alert("Error al publicar el empleo. Verifica que todos los campos estén completos."); 
    }
  };

  return (
    <div className="centered-form-wrapper" style={{ padding: '40px 20px' }}>
      <div className="auth-card-premium" style={{ maxWidth: '700px', width: '100%' }}>
        <h2 style={{ marginBottom: '10px' }}>Publicar Nuevo Empleo</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Completa los detalles para atraer a los mejores candidatos.</p>
        
        <form onSubmit={handleSave} className="form-group">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label>Título del Puesto</label>
              <input 
                type="text" 
                placeholder="Ej: Senior Fullstack Developer"
                value={job.title} 
                onChange={e => setJob({...job, title: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label>Empresa</label>
              <input 
                type="text" 
                placeholder="Nombre de tu empresa"
                value={job.company} 
                onChange={e => setJob({...job, company: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '15px' }}>
            <div>
              <label>Ubicación</label>
              <input 
                type="text" 
                placeholder="Ej: Madrid, España"
                value={job.location} 
                onChange={e => setJob({...job, location: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label>Tipo de Trabajo</label>
              <select 
                value={job.job_type} 
                onChange={e => setJob({...job, job_type: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
                <option value="Pasantía">Pasantía</option>
              </select>
            </div>
            <div>
              <label>Modalidad</label>
              <select 
                value={job.modality} 
                onChange={e => setJob({...job, modality: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              >
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>Descripción del Puesto</label>
            <textarea 
              rows={8} 
              placeholder="Detalla las responsabilidades, requisitos y beneficios..."
              value={job.description} 
              onChange={e => setJob({...job, description: e.target.value})} 
              required 
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>
              Publicar Empleo
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;