import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
