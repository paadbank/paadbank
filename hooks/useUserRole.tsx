'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/roleAccess';

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabaseBrowser
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(profile?.role as UserRole || null);
      setLoading(false);
    };

    loadRole();
  }, []);

  return { role, loading };
}
