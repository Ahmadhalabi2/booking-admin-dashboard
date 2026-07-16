import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage         from './pages/LoginPage';
import SignupPage       from './pages/SignupPage';
import HomePage         from './pages/HomePage';
import DashboardPage    from './pages/DashboardPage';
import HotelsPage       from './pages/hotels/HotelsPage';
import BookingsPage     from './pages/bookings/BookingsPage';
import CustomersPage    from './pages/customers/CustomersPage';
import AnalyticsPage    from './pages/analytics/AnalyticsPage';
import RoomsPage        from './pages/rooms/RoomsPage';
import RevenuePage      from './pages/revenue/RevenuePage';
import SettingsPage     from './pages/settings/SettingsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage      from './pages/profile/ProfilePage';
import UsersPage        from './pages/users/UsersPage';
import MyBookingsPage   from './pages/my-bookings/MyBookingsPage';
import BookHotelPage    from './pages/book-hotel/BookHotelPage';
import StartPage        from './pages/StartPage';
import SupportChatPage  from './pages/support/SupportChatPage';

export default function App() {
  const { isAuthenticated, currentUser } = useAuthStore();
  const role = currentUser?.role;
  const isAdmin = role === 'superadmin';
  const isSupport = role === 'support';

  // دالة لتحديد المسار الافتراضي المناسب لكل صلاحية بعد الدخول
  const getDefaultRoute = () => {
    if (isAdmin) return '/dashboard';
    if (isSupport) return '/support'; 
    return '/home'; 
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* الصفحة الأولى الافتراضية للموقع بدون أي شروط */}
        <Route path="/" element={<StartPage />} />

        {/* صفحات تسجيل الدخول والتسجيل */}
        <Route 
          path="/login"  
          element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/home" replace /> : <SignupPage />} 
        />

        {/* المسارات المحمية */}
        <Route path="/home"          element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/hotels"        element={<ProtectedRoute><HotelsPage /></ProtectedRoute>} />
        <Route path="/settings"      element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* مسارات المستخدم العادي والدعم */}
        <Route path="/my-bookings"      element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/book-hotel/:id"   element={<ProtectedRoute><BookHotelPage /></ProtectedRoute>} />
        
        {/* مسار الدعم الفني */}
        <Route path="/support"          element={<ProtectedRoute><SupportChatPage /></ProtectedRoute>} />

        {/* مسارات الإدارة والموظفين */}
        <Route path="/bookings"  element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/rooms"     element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/revenue"   element={<ProtectedRoute><RevenuePage /></ProtectedRoute>} />

        {/* مسارات الآدمن المطلق */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="superadmin"><DashboardPage /></ProtectedRoute>} />
        <Route path="/users"     element={<ProtectedRoute requiredRole="superadmin"><UsersPage /></ProtectedRoute>} />

        {/* إعادة التوجيه في حال وجود مسار خاطئ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}