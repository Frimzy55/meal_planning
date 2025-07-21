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

import ProtectedRoute from './ProtectedRoute'; // ✅ Import the wrapper

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Admin Dashboard */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Protected User Dashboard and its child views */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<DefaultDashboard />} />
          <Route path="profile" element={<ProfilePreferences />} />
          <Route path="planner" element={<MealPlanner />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="tracker" element={<NutrientTracker />} />
          <Route path="grocery" element={<GroceryList />} />
          <Route path="customize" element={<CustomizeMeals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
