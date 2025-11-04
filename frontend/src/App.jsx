import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import LoginPage from './LoginAndSignUp/LoginPage';
import SignupPage from './LoginAndSignUp/SignupPage';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

import DefaultDashboard from './DashboardViews/DefaultDashboard';
import ProfilePreferences from './DashboardViews/ProfilePreferences';
import MealPlanner from './DashboardViews/MealPlanner';
import Recommendations from './DashboardViews/Recommendations';
import NutrientTracker from './DashboardViews/NutrientTracker';
import GroceryList from './DashboardViews/GroceryList';
import CustomizeMeals from './DashboardViews/CustomizeMeals';

import AdminHome from './AdminHome';
import AdminManageUsers from './AdminManageUsers';
import AdminSettings from './AdminSettings';
import AdminManageMeals from './AdminManageMeals';

import ProtectedRoute from './ProtectedRoute';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?.id;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ✅ Admin Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminManageUsers />} />
          <Route path="settings" element={<AdminSettings />} />
           <Route path="meals" element={<AdminManageMeals />} />
        </Route>

        {/* ✅ User Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DefaultDashboard userId={userId} />} />
          <Route path="profile" element={<ProfilePreferences />} />
          <Route path="planner" element={<MealPlanner userId={userId} />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="tracker" element={<NutrientTracker userId={userId} />} />
          <Route path="grocery" element={<GroceryList userId={userId} />} />
          <Route path="customize" element={<CustomizeMeals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
