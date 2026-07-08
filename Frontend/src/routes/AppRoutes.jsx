import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

/**
 * Only auth routes exist so far. Once Dashboard, Meters, etc. are built,
 * "/" and other protected routes will render through ProtectedRoute here,
 * and the catch-all will point at a real NotFound page instead of /login.
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;