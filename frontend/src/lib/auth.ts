import type { User } from '@supabase/supabase-js';

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  
  // Check if user has admin role or specific admin email
  // You can customize this logic based on your needs
  const adminEmails = [
    'benedikt.koch123@gmx.net',
    // Add more admin emails here
  ];
  
  // Check for role in user metadata
  const userRole = user.user_metadata?.role || user.app_metadata?.role;
  if (userRole === 'admin' || userRole === 'administrator') {
    return true;
  }
  
  // Check if email is in admin list
  if (user.email && adminEmails.includes(user.email)) {
    return true;
  }
  
  return false;
};

export const getUserRole = (user: User | null): 'admin' | 'user' => {
  return isAdmin(user) ? 'admin' : 'user';
}; 