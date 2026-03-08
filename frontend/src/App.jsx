import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { usePushNotifications } from './hooks/usePushNotifications'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import MapPage from './pages/MapPage'
import FlightsPage from './pages/FlightsPage'
import ARPage from './pages/ARPage'
import IdentityPage from './pages/IdentityPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import DemoPage from './pages/DemoPage'

function AuthGuard({ children }) {
  const { accessToken, onboardingComplete } = useStore()
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to onboarding if not completed (except when already on /onboarding)
  if (!onboardingComplete && location.pathname !== '/onboarding' && location.pathname !== '/admin') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default function App() {
  usePushNotifications()

  return (
    <div className="h-full w-full">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <OnboardingPage />
            </AuthGuard>
          }
        />
        <Route
          path="/map"
          element={
            <AuthGuard>
              <MapPage />
            </AuthGuard>
          }
        />
        <Route
          path="/flights"
          element={
            <AuthGuard>
              <FlightsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/ar"
          element={
            <AuthGuard>
              <ARPage />
            </AuthGuard>
          }
        />
        <Route
          path="/identity"
          element={
            <AuthGuard>
              <IdentityPage />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminPage />
            </AuthGuard>
          }
        />
        <Route
          path="/demo"
          element={
            <AuthGuard>
              <DemoPage />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Routes>
    </div>
  )
}
