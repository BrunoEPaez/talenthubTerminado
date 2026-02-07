import React, { useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Building2, AlignLeft, DollarSign } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState({ 
    title: '', 
    company: '', 
    location: '', 
    description: '', 
    salary: '',
    job_type: 'Full-time', 
    modality: 'Remoto'     
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Importante: El backend espera { job: { title: '...', ... } }
      await api.post('/jobs', { job });
      alert("¡Empleo publicado con éxito!");
      navigate('/dashboard');
    } catch (err: any) { 
      console.error(err);
      if (err.response?.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        navigate('/login');
      } else {
        alert("Error al publicar el empleo. Verifica los campos.");
      }
    }
  };

  return (
    <div className="centered-form-wrapper" style={{ padding: '40px 20px', background: '#f8fafc', minHeight: '100vh' }}>
      <div className="auth-card-premium" style={{ maxWidth: '800px', width: '100%', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '10px' }}>Publicar Nuevo Empleo</h2>
          <p style={{ color: '#64748b' }}>Completa la información para encontrar a tu candidato ideal.</p>
        </div>
        
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            <div className="input-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                <Briefcase size={18} /> Título del Puesto
              </label>
              <input 
                type="text" 
                placeholder="Ej: Senior React Developer"
                value={job.title} 
                onChange={e => setJob({...job, title: e.target.value})} 
                required 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="input-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                <Building2 size={18} /> Empresa
              </label>
              <input 
                type="text" 
                placeholder="Nombre de la empresa"
                value={job.company} 
                onChange={e => setJob({...job, company: e.target.value})} 
                required 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="input-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                <MapPin size={18} /> Ubicación
              </label>
              <input 
                type="text" 
                placeholder="Ej: Madrid, España"
                value={job.location} 
                onChange={e => setJob({...job, location: e.target.value})} 
                required 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="input-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                <DollarSign size={18} /> Salario (Opcional)
              </label>
              <input 
                type="text" 
                placeholder="Ej: 45k - 55k anual"
                value={job.salary} 
                onChange={e => setJob({...job, salary: e.target.value})} 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '25px' }}>
            <div>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Tipo de Contrato</label>
              <select 
                value={job.job_type} 
                onChange={e => setJob({...job, job_type: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Freelance">Freelance</option>
                <option value="Pasantía">Pasantía</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Modalidad</label>
              <select 
                value={job.modality} 
                onChange={e => setJob({...job, modality: e.target.value})}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
              >
                <option value="Remoto">Remoto</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '25px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
              <AlignLeft size={18} /> Descripción detallada
            </label>
            <textarea 
              rows={6} 
              placeholder="Escribe aquí los requisitos, beneficios y responsabilidades..."
              value={job.description} 
              onChange={e => setJob({...job, description: e.target.value})} 
              required 
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
            <button type="submit" className="btn-primary-full" style={{ flex: 2, padding: '16px', borderRadius: '14px', background: '#2563eb', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>
              Publicar ahora
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;