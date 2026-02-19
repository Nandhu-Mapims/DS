import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { ToastProvider } from './components/ToastProvider';
import { LoadingProvider } from './context/LoadingContext';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { SummariesPage } from './pages/SummariesPage';
import { DoctorList } from './pages/doctor/DoctorList';
import { DoctorCreateDischarge } from './pages/doctor/DoctorCreateDischarge';
import { DoctorPreviewEdit } from './pages/doctor/DoctorPreviewEdit';
import { ChiefQueue } from './pages/chief/ChiefQueue';
import { ChiefReview } from './pages/chief/ChiefReview';
import { VerifiedList } from './pages/verified/VerifiedList';
import { VerifiedView } from './pages/verified/VerifiedView';
import { getStoredToken, getStoredUser } from './api/axios';
import { LogoutButton } from './components/LogoutButton';

const ALL_NAV_ITEMS = [
  { to: '/', label: 'Home', roles: ['DOCTOR', 'CHIEF', 'ADMIN'] },
  { to: '/doctor', label: 'Doctor', roles: ['DOCTOR', 'ADMIN'] },
  { to: '/chief', label: 'Chief', roles: ['CHIEF', 'ADMIN'] },
  { to: '/verified', label: 'Verified', roles: ['DOCTOR', 'CHIEF', 'ADMIN'] },
  { to: '/dashboard', label: 'Dashboard', roles: ['DOCTOR', 'CHIEF', 'ADMIN'] },
  { to: '/summaries', label: 'Summaries', roles: ['DOCTOR', 'CHIEF', 'ADMIN'] },
];

function getNavItemsForRole(role) {
  if (!role) return [{ to: '/', label: 'Home' }];
  return ALL_NAV_ITEMS.filter((item) => item.roles.includes(role)).map(({ to, label }) => ({ to, label }));
}

function RequireAuth({ children }) {
  const location = useLocation();
  const token = getStoredToken();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function RequireRole({ allowedRoles, children }) {
  const user = getStoredUser();
  const role = user?.role;
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AuthenticatedLayout({ children }) {
  const user = getStoredUser();
  const navItems = getNavItemsForRole(user?.role);
  const rightSlot = (
    <>
      {user?.email && (
        <span className="text-muted small d-none d-md-inline me-2" title={user?.role}>
          {user.email}
          {user.role && <span className="ms-1 opacity-75">({user.role})</span>}
        </span>
      )}
      <LogoutButton />
    </>
  );
  return (
    <AppLayout navItems={navItems} rightSlot={rightSlot}>
      {children}
    </AppLayout>
  );
}

function UnauthListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => navigate('/login', { replace: true });
    window.addEventListener('ds-unauthorized', handler);
    return () => window.removeEventListener('ds-unauthorized', handler);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LoadingProvider>
          <BrowserRouter>
            <UnauthListener />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <RequireAuth>
                    <AuthenticatedLayout>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/doctor" element={<RequireRole allowedRoles={['DOCTOR', 'ADMIN']}><DoctorList /></RequireRole>} />
                        <Route path="/doctor/create" element={<RequireRole allowedRoles={['DOCTOR', 'ADMIN']}><DoctorCreateDischarge /></RequireRole>} />
                        <Route path="/doctor/preview/:id" element={<RequireRole allowedRoles={['DOCTOR', 'ADMIN']}><DoctorPreviewEdit /></RequireRole>} />
                        <Route path="/chief" element={<RequireRole allowedRoles={['CHIEF', 'ADMIN']}><ChiefQueue /></RequireRole>} />
                        <Route path="/chief/review/:id" element={<RequireRole allowedRoles={['CHIEF', 'ADMIN']}><ChiefReview /></RequireRole>} />
                        <Route path="/verified" element={<VerifiedList />} />
                        <Route path="/verified/:id" element={<VerifiedView />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/summaries" element={<SummariesPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AuthenticatedLayout>
                  </RequireAuth>
                }
              />
            </Routes>
          </BrowserRouter>
        </LoadingProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
