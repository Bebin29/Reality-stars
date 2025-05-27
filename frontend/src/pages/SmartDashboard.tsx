import { useSession } from '@supabase/auth-helpers-react';
import { isAdmin } from '@/lib/auth';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard.tsx';

// Smart Dashboard that routes to appropriate dashboard based on user role
export default function SmartDashboard() {
  const session = useSession();
  
  // If user is admin, show admin dashboard, otherwise show user dashboard
  if (session?.user && isAdmin(session.user)) {
    return <AdminDashboard />;
  }
  
  return <UserDashboard />;
} 