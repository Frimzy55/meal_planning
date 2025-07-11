import { useNavigate } from 'react-router-dom';
import logo from './assets/logo_meal.png'; // Ensure this path is correct

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="welcome-container position-relative d-flex justify-content-center align-items-center vh-100"
      style={{
        background: 'linear-gradient(to right, #e6f9ec, #d4f5dc)',
        color: '#2e7d32',
      }}
    >
      {/* Logo at top-left */}
      <img
        src={logo}
        alt="TailorMeal Logo"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '190px',
          height: 'auto',
        }}
      />

      {/* Centered Text and Buttons */}
      <div className="text-center px-3">
        <h1 className="display-2 fw-bold" style={{ color: '#467748ff' }}>
          Personalised Nutrition and Meal Planning Platform
        </h1>
        <p className="lead mt-3 mb-4" style={{ color: '#54d0d4ff' }}>
          Empowering you to eat better, live healthier, and stay on track
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button
            className="btn btn-success btn-lg px-4 py-3 rounded-pill shadow-sm"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="btn btn-outline-success btn-lg px-4 py-3 rounded-pill shadow-sm"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
