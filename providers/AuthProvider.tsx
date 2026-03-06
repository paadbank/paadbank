'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase/client';
import AuthBlocker from '@/components/AuthBlocker/AuthBlocker';

interface AuthContextType {
  initialized: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const publicRoutes = ['/', '/privacy', '/terms', '/about'];
  const authRoutes = ['/login', '/signup', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname) || authRoutes.some(r => pathname.startsWith(r));

  useEffect(() => {
    if (isPublicRoute) {
      setInitialized(true);
      return;
    }

    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabaseBrowser.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setInitialized(true);
        }

        const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
          (_event: any, newSession: Session | null) => {
            if (mounted) {
              setSession(newSession);
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('[AUTH] Error:', error);
        if (mounted) setInitialized(true);
      }
    };

    const cleanup = initializeAuth();

    return () => {
      mounted = false;
      cleanup?.then(unsub => unsub?.());
    };
  }, [pathname, isPublicRoute]);

  return (
    <AuthContext.Provider value={{ initialized, session }}>
      <AuthBlocker>{children}</AuthBlocker>
    </AuthContext.Provider>
  );
}
