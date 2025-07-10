import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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

      // Save token and user info to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
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
    <div className="auth-container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: '400px', borderRadius: '15px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Log in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email"
              name="email"
              className="form-control rounded-pill"
              placeholder=""
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
              placeholder=""
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger text-center py-2">{error}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 rounded-pill py-2 mb-3"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-3">
            <p className="text-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary text-decoration-none">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
