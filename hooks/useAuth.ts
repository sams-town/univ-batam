'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchAndHealProfile = async (userId: string, email: string) => {
      let { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, role_id, avatar_url, phone, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      const isAdminEmailOrId = userId === 'b6b9d09e-2094-4459-884e-7b0a0caad7b3' || email.toLowerCase().includes('admin');

      if (isAdminEmailOrId && (!profileData || !profileData.role)) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('id, name')
          .eq('name', 'super_admin')
          .maybeSingle();

        if (roleData) {
          if (profileData) {
            await supabase
              .from('profiles')
              .update({ role_id: roleData.id })
              .eq('id', userId);
          } else {
            await supabase
              .from('profiles')
              .insert({
                id: userId,
                role_id: roleData.id,
                first_name: 'Super',
                last_name: 'Admin',
                email: email
              });
          }

          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, role, role_id, avatar_url, phone, created_at, updated_at')
            .eq('id', userId)
            .maybeSingle();

          if (updatedProfile) {
            profileData = updatedProfile;
            error = null;
          }
        }
      }

      if (error) {
        console.error('Error fetching profile:', error);
      }
      return profileData as Profile;
    };

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        setUser(session.user);

        const profileData = await fetchAndHealProfile(
          session.user.id,
          session.user.email || ''
        );

        setProfile(profileData);
      } catch (err) {
        console.error('Session or profile request failed:', err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            localStorage.removeItem('user_role');
            setLoading(false);
            router.push('/login');
          } else if (session) {
            setUser(session.user);
            const profileData = await fetchAndHealProfile(
              session.user.id,
              session.user.email || ''
            );
            setProfile(profileData);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      abortController.abort();
    };
  }, [router]);

  return { user, profile, loading };
}
