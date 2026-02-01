import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="brand-logo">TalentHub</span>
          <p>Conectando el mejor talento dev con las mejores oportunidades.</p>
        </div>
        <div className="footer-links">
          <button className="btn-footer-link" onClick={() => navigate('/')}>Inicio</button>
          <button className="btn-footer-link" onClick={() => navigate('/create')}>Publicar Empleo</button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 TalentHub. Proyecto Portfolio.</p>
      </div>
    </footer>
  );
};

export default Footer;