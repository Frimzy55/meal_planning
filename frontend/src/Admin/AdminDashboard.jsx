import { Link, Outlet, useLocation } from 'react-router-dom';
import logo from '../assets/logo_meal.png';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const menuItems = [
    { name: "Admin Dashboard", icon: <DashboardIcon />, path: "/admin" },
    { name: "Manage Users", icon: <UsersIcon />, path: "/admin/users" },
    { name: "Settings", icon: <SettingsIcon />, path: "/admin/settings" }
  ];

  return (
    <div className="d-flex vh-100 overflow-hidden">
      {/* Sidebar */}
      <div className="d-flex flex-column text-white"
           style={{
             width: '240px',
             background: 'linear-gradient(to bottom, #4a148c, #6a1b9a)' // purple admin theme
           }}>
        <div className="d-flex align-items-center p-3 pb-2 mb-2">
          <img src={logo} alt="Logo" className="me-3" style={{ height: '36px' }} />
          <h4 className="m-0 fw-semibold">AdminPanel</h4>
        </div>

        <nav className="flex-grow-1 overflow-hidden">
          <ul className="list-unstyled d-flex flex-column h-100 m-0 p-0">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index} className="mb-1">
                  <Link
                    to={item.path}
                    className="d-flex align-items-center text-white text-decoration-none px-3 py-2 mx-2 rounded w-100"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <span className="me-3 d-flex">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-100 py-2 rounded d-flex align-items-center justify-content-center"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogoutIcon className="me-2" style={{ fontSize: '20px' }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="d-flex flex-column flex-grow-1 bg-light">
        {/* Topbar */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white shadow-sm"
             style={{ minHeight: '72px' }}>
          <h3 className="m-0 text-purple fw-semibold">Admin Dashboard</h3>
          <div className="d-flex align-items-center">
            <span className="me-3 text-dark fw-medium">Welcome, Admin {user?.firstName || 'Admin'}</span>
            <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                 style={{ width: '40px', height: '40px', fontSize: '16px' }}>
              {user?.firstName?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
