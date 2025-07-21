/*import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? children : <Navigate to="/login" replace />;
}
*/


// ProtectedRoute.js
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    user = null;
  }

  // Add strict check: no user or missing valid fields
  if (!user || !user.email) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
