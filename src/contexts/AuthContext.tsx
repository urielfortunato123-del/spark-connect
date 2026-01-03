import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppPlan = 'free' | 'telecom' | 'ev' | 'governo' | 'pro';
type AppModule = 'torres_5g' | 'eletropostos' | 'viabilidade' | 'ambiental' | 'cenarios' | 'relatorios' | 'ia_assistant';
type AppRole = 'admin' | 'user';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface UserPlan {
  plan: AppPlan;
  modules_enabled: AppModule[];
  valid_until: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  userPlan: UserPlan | null;
  userRole: AppRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  hasModuleAccess: (module: AppModule) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Fetch plan
      const { data: planData } = await supabase
        .from('user_plans')
        .select('plan, modules_enabled, valid_until')
        .eq('user_id', userId)
        .single();
      
      if (planData) {
        setUserPlan(planData as UserPlan);
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (roleData) {
        setUserRole(roleData.role as AppRole);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer data fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserPlan(null);
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserPlan(null);
    setUserRole(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const hasModuleAccess = (module: AppModule): boolean => {
    if (!userPlan) return false;
    if (userPlan.plan === 'pro') return true;
    return userPlan.modules_enabled.includes(module);
  };

  const isAdmin = userRole === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      userPlan,
      userRole,
      isLoading,
      isAdmin,
      hasModuleAccess,
      signIn,
      signUp,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
