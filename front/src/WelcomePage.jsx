import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="text-center mb-5">
        <h1 className="display-3 fw-bold text-primary">Welcome to KTU Lost & Found Hub</h1>
        <p className="lead mt-3 text-muted">Reuniting lost items with their owners</p>
      </div>
      <div className="d-flex gap-3">
        <button 
          className="btn btn-primary btn-lg px-4 py-3 rounded-pill shadow-sm"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button 
          className="btn btn-outline-primary btn-lg px-4 py-3 rounded-pill shadow-sm"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}