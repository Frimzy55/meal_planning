import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion as Motion } from 'framer-motion';
import logo from './assets/logo_meal.png';
import { pageFade, cardSlide, buttonMotion, fadeIn } from './authAnimations';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Motion.div
      className="auth-container position-relative d-flex flex-column align-items-center justify-content-center vh-100"
      style={{ background: 'linear-gradient(to right, #e8f5e9, #d0f0d0)' }}
      {...pageFade}
    >
      {/* ✅ Logo outside the card, top-left */}
      <img
        src={logo}
        alt="TailorMeal Logo"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '120px',
          height: 'auto',
          zIndex: 10,
        }}
      />

      {/* ✅ Login card */}
      <Motion.div
        className="card p-4 shadow-lg"
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '15px',
          border: '1px solid #a5d6a7',
          backgroundColor: '#ffffff',
        }}
        {...cardSlide}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-success">Welcome Back</h2>
          <p className="text-muted">Log in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control rounded-pill"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control rounded-pill"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <Motion.div
              className="alert alert-danger text-center py-2"
              {...fadeIn}
            >
              {error}
            </Motion.div>
          )}

          <Motion.button
            type="submit"
            className="btn btn-success w-100 rounded-pill py-2 mb-3"
            disabled={loading}
            {...buttonMotion}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Motion.button>

          <div className="text-center mt-3">
            <p className="text-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-success text-decoration-none">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  );
}
