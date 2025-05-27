import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import LoginPage from './pages/Login';
import TestPage from './pages/Test';
import SmartDashboard from './pages/SmartDashboard';
import Profile from './pages/Profile';
import Personalities from './pages/Personalities';
import { useEffect } from 'react';

// A layout for authenticated users
function ProtectedLayout() {
  // For the new pages, we don't need a wrapper layout since they handle their own headers
  return <Outlet />;
}

function App() {
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Can use this to react to auth changes, e.g., redirect on SIGN_OUT
      if (event === 'SIGNED_OUT') {
        // Optionally navigate to login or show a message
        // For example: navigate('/login', { replace: true });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  return (
    <Router>
      <Routes>
        <Route path="/test" element={<TestPage />} />
        <Route 
          path="/login" 
          element={session ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route 
          path="/*" 
          element={session ? <ProtectedLayout /> : <Navigate to="/login" replace />}
        >
          {/* Nested routes for authenticated users */}
          <Route index element={<SmartDashboard />} /> {/* Default page after login */}
          <Route path="profile" element={<Profile />} />
          <Route path="personalities" element={<Personalities />} />
          <Route path="test" element={<TestPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
