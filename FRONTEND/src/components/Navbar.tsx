import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/';
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="brand-logo">TalentHub</span>
        </div>
        <div className="nav-right">
          {token ? (
            <>
              <span style={{ marginRight: '15px', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                Hola, <strong>{currentUserEmail?.split('@')[0]}</strong>
              </span>
              <button className="btn-text" onClick={() => navigate('/dashboard')}>Mi Actividad</button>
              <button className="btn-secondary" onClick={() => navigate('/create')}>+ Publicar Empleo</button>
              <button className="btn-text" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <button className="btn-primary-full" onClick={() => navigate('/login')} style={{ padding: '8px 20px' }}>Entrar</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;