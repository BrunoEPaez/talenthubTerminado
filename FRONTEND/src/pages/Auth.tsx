import React, { useState } from 'react';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom'; // Importamos Link
import { UserPlus, LogIn } from 'lucide-react'; // Iconos para que se vea mejor

const Auth = ({ mode }: { mode: 'login' | 'register' }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    password_confirmation: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    
    // Validación básica para registro
    if (mode === 'register' && formData.password !== formData.password_confirmation) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await api.post(endpoint, { user: formData });
      if (mode === 'login') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userEmail', res.data.user.email);
        localStorage.setItem('userId', res.data.user.id);
        window.location.href = '/';
      } else {
        alert("Registro exitoso, ahora inicia sesión");
        navigate('/login');
      }
    } catch (err) { 
      alert("Error en las credenciales o datos inválidos"); 
    }
  };

  return (
    <div className="centered-form-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="auth-card-premium" style={{ width: '100%', maxWidth: '400px', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ background: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            {mode === 'login' ? <LogIn color="#2563eb" size={30} /> : <UserPlus color="#2563eb" size={30} />}
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: 0 }}>
            {mode === 'login' ? '¡Bienvenido!' : 'Crea tu cuenta'}
          </h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>
            {mode === 'login' ? 'Ingresa tus datos para continuar' : 'Únete a nuestra comunidad de empleo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1e293b' }}>Email</label>
            <input 
              type="email" 
              placeholder="tu@email.com"
              required 
              value={formData.email} // IMPORTANTE
              onChange={e => setFormData({...formData, email: e.target.value})} 
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1e293b' }}>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              required 
              value={formData.password} // IMPORTANTE
              onChange={e => setFormData({...formData, password: e.target.value})} 
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1e293b' }}>Confirmar Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••"
                required 
                value={formData.password_confirmation} // IMPORTANTE
                onChange={e => setFormData({...formData, password_confirmation: e.target.value})} 
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
            </div>
          )}

          <button type="submit" className="btn-primary-full" style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', background: '#0f172a', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
            {mode === 'login' ? 'Entrar ahora' : 'Registrarme gratis'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: '#64748b' }}>
          {mode === 'login' ? (
            <p>¿No tienes cuenta? <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Regístrate aquí</Link></p>
          ) : (
            <p>¿Ya tienes cuenta? <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Inicia sesión</Link></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;