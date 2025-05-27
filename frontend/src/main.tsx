import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createClient } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'

// Ensure you have a .env file in your frontend directory with these variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and/or Anon Key are missing. Please check your .env file.")
}

// Cookie-Hilfsfunktionen für sichere Refresh-Token Speicherung
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure;`;
};

// Custom Storage Implementation - Refresh-Token in sicheren Cookies
const customStorage = {
  getItem: (key: string) => {
    // Für normale Session-Daten localStorage verwenden
    const localValue = localStorage.getItem(key);
    
    if (localValue) {
      try {
        const parsedValue = JSON.parse(localValue);
        
        // Wenn es Session-Daten sind und kein refresh_token hat, aus Cookie holen
        if (parsedValue && typeof parsedValue === 'object' && !parsedValue.refresh_token) {
          const refreshToken = getCookie('sb_refresh_token');
          if (refreshToken) {
            return JSON.stringify({
              ...parsedValue,
              refresh_token: refreshToken
            });
          }
        }
      } catch {
        // Falls es kein JSON ist, normal zurückgeben
      }
    }
    
    return localValue;
  },
  
  setItem: (key: string, value: string) => {
    try {
      const parsedValue = JSON.parse(value);
      
      // Wenn es Session-Daten mit refresh_token sind
      if (parsedValue && typeof parsedValue === 'object' && parsedValue.refresh_token) {
        console.log('Storing refresh_token in secure cookie');
        
        // Refresh-Token in sicheren Cookie speichern
        setCookie('sb_refresh_token', parsedValue.refresh_token, 7); // 7 Tage
        
        // Session-Daten ohne refresh_token in localStorage
        const sanitizedValue = { ...parsedValue };
        delete sanitizedValue.refresh_token;
        localStorage.setItem(key, JSON.stringify(sanitizedValue));
        return;
      }
    } catch {
      // Falls es kein JSON ist, normal speichern
    }
    
    localStorage.setItem(key, value);
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    // Auch Refresh-Token Cookie löschen
    deleteCookie('sb_refresh_token');
  }
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
    autoRefreshToken: true, // Automatisches Token-Refresh aktiviert (Cookie-basiert)
    detectSessionInUrl: true,
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>,
)
