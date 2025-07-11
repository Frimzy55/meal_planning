import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      setError("Passwords don't match!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password.trim()
      });

      if (response.data.message) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-container d-flex justify-content-center align-items-center vh-100"
      style={{ background: 'linear-gradient(to right, #e8f5e9, #d0f0d0)' }}
    >
      <div
        className="card p-4 shadow"
        style={{
          width: '350px',
          borderRadius: '12px',
          border: '1px solid #a5d6a7',
          backgroundColor: '#ffffff',
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-success mb-1">Create Account</h2>
          <p className="text-muted small">Get started with your account</p>
        </div>

        {error && (
          <div className="alert alert-danger small mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label small">First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-control form-control-sm rounded-pill"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label small">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-control form-control-sm rounded-pill"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label small">Email</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-sm rounded-pill"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label small">Password</label>
            <input
              type="password"
              name="password"
              className="form-control form-control-sm rounded-pill"
              value={formData.password}
              onChange={handleChange}
              minLength="8"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control form-control-sm rounded-pill"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="8"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success btn-sm w-100 rounded-pill py-2 mb-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing Up...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          <div className="text-center mt-2">
            <p className="text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="text-success text-decoration-none">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
