import logo from './assets/logo_meal.png'; // Adjust the path if needed

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <div
      className="d-flex"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'linear-gradient(to right, #e8f5e9, #d0f0d0)',
      }}
    >
      {/* Sidebar */}
      <div
        className="bg-success text-white p-3"
        style={{ width: '220px' }}
      >
        <h5 className="mb-4">Menu</h5>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <a className="nav-link text-white" href="#">Dashboard</a>
          </li>
          <li className="nav-item mb-2">
            <a className="nav-link text-white" href="#">My Meals</a>
          </li>
          <li className="nav-item mb-2">
            <a className="nav-link text-white" href="#">Nutrition Plans</a>
          </li>
          <li className="nav-item mb-2">
            <a className="nav-link text-white" href="#">Settings</a>
          </li>
          <li className="nav-item mt-4">
            <button
              className="btn btn-outline-light w-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Topbar */}
        <div
          className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom"
          style={{
            backgroundColor: '#ffffff',
            height: '50px',
            overflow: 'hidden'
          }}
        >
          <img
            src={logo}
            alt="TailorMeal Logo"
            style={{
              height: '170px',
              objectFit: 'contain'
            }}
          />
          <span className="text-success fw-bold fs-5">
            Hello, {user?.firstName || 'Student'} 👋
          </span>
        </div>

        {/* Main Content */}
        <div
          className="px-4 d-flex flex-column justify-content-center"
          style={{ flexGrow: 1 }}
        >
          <h2 className="mb-3 text-success">Welcome to Your Dashboard</h2>
          <p className="text-dark">
            This is your student dashboard. Here you can manage your meals,
            track your nutrition, and explore personalized plans.
          </p>
        </div>
      </div>
    </div>
  );
}