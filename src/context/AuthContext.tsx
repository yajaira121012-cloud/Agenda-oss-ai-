import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  reinitializeSupabaseClient,
} from '../lib/supabase';
import { Profile } from '../types';
import { getCurrentUserProfile } from '../services/profilesService';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, fullName: string, qualification: string) => Promise<{ error: AuthError | Error | null }>;
  signInDemo: (fullName?: string, qualification?: string) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  checkConfiguration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'agenda_oss_demo_user';
const SAVED_PROFILE_KEY = 'agenda_oss_saved_profile';

const DEFAULT_OPERATOR_USER = {
  id: 'op-yajaira-001',
  app_metadata: {},
  user_metadata: { full_name: 'Yajaira', qualification: 'Operatore Socio-Sanitario (OSS)' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
  email: 'yajaira121012@gmail.com',
} as unknown as User;

const DEFAULT_OPERATOR_PROFILE: Profile = {
  id: 'op-yajaira-001',
  email: 'yajaira121012@gmail.com',
  full_name: 'Yajaira',
  first_name: 'Yajaira',
  last_name: '',
  qualification: 'Operatore Socio-Sanitario (OSS)',
  department: 'Assistenza Domiciliare (ADI)',
  phone: '',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_OPERATOR_USER);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SAVED_PROFILE_KEY);
        if (saved) return { ...DEFAULT_OPERATOR_PROFILE, ...JSON.parse(saved) };
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_OPERATOR_PROFILE;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkConfiguration = useCallback(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      reinitializeSupabaseClient();
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await getCurrentUserProfile(userId);
      if (data) {
        setProfile((prev) => {
          const merged = { ...(prev || DEFAULT_OPERATOR_PROFILE), ...data };
          localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(merged));
          return merged;
        });
      } else {
        // Fallback default profile
        const fallback: Profile = {
          id: userId,
          email: user?.email || 'yajaira121012@gmail.com',
          full_name: user?.user_metadata?.full_name || 'Yajaira',
          qualification: user?.user_metadata?.qualification || 'Operatore Socio-Sanitario (OSS)',
          department: 'Assistenza Domiciliare (ADI)',
        };
        setProfile((prev) => {
          const merged = { ...fallback, ...(prev || {}) };
          localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn('Profile fetch warning:', err);
    }
  }, [user]);

  const updateCurrentProfile = async (updates: Partial<Profile>): Promise<{ error?: string }> => {
    try {
      const updatedProfile: Profile = {
        ...(profile || DEFAULT_OPERATOR_PROFILE),
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // 1. Immediately update React state and LocalStorage
      setProfile(updatedProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(updatedProfile));
      }

      // 2. Also try updating on Supabase if connected
      if (isSupabaseConfigured() && user?.id) {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email || updatedProfile.email,
            full_name: updatedProfile.full_name,
            qualification: updatedProfile.qualification,
            department: updatedProfile.department,
            phone: updatedProfile.phone,
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Could not sync profile to remote DB (stored locally):', dbErr);
        }
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Errore aggiornamento profilo' };
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // Check if custom demo user is stored locally
      const storedDemo = typeof window !== 'undefined' ? localStorage.getItem(DEMO_USER_STORAGE_KEY) : null;
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          if (isMounted && parsed?.user) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            setIsDemoMode(true);
            setLoading(false);
            return;
          }
        } catch {
          // ignore corrupted demo storage
        }
      }

      try {
        if (isSupabaseConfigured()) {
          const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
          if (!sessionError && initialSession?.user) {
            if (isMounted) {
              setSession(initialSession);
              setUser(initialSession.user);
              await fetchProfile(initialSession.user.id);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err: any) {
        console.warn('Supabase auth check:', err);
      }

      // Default seamless operator session
      if (isMounted) {
        setUser(DEFAULT_OPERATOR_USER);
        setProfile(DEFAULT_OPERATOR_PROFILE);
        setIsDemoMode(false);
        setLoading(false);
      }
    }

    initAuth();

    if (!isSupabaseConfigured()) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          setIsDemoMode(false);
          await fetchProfile(newSession.user.id);
        } else {
          // Maintain active session so the user is never kicked out or asked for keys
          setUser(DEFAULT_OPERATOR_USER);
          setProfile(DEFAULT_OPERATOR_PROFILE);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInDemo = (
    fullName: string = 'Operatore OSS (Dimostrativo)',
    qualification: string = 'Operatore Socio-Sanitario (OSS)'
  ) => {
    const demoUser = {
      id: 'demo-operator-id-001',
      app_metadata: {},
      user_metadata: { full_name: fullName, qualification },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'operatore.demo@reparto.it',
    } as unknown as User;

    const demoProfile: Profile = {
      id: 'demo-operator-id-001',
      email: 'operatore.demo@reparto.it',
      full_name: fullName,
      qualification,
    };

    localStorage.setItem(
      DEMO_USER_STORAGE_KEY,
      JSON.stringify({ user: demoUser, profile: demoProfile })
    );

    setUser(demoUser);
    setProfile(demoProfile);
    setIsDemoMode(true);
    setError(null);
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    if (!isSupabaseConfigured()) {
      return {
        error: new Error('Supabase non è configurato. Inserisci URL e Anon Key nelle Impostazioni o nel file .env'),
      };
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { error: signInError };
      }

      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      setIsDemoMode(false);
      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      setError(err.message || 'Errore di autenticazione');
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    qualification: string
  ) => {
    setError(null);
    if (!isSupabaseConfigured()) {
      return {
        error: new Error('Supabase non è ancora configurato. Inserisci URL e Anon Key per procedere.'),
      };
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            qualification: qualification.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { error: signUpError };
      }

      if (data.session && data.user) {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        setIsDemoMode(false);
        setUser(data.user);
        setSession(data.session);
      }
      return { error: null };
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione');
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      setIsDemoMode(false);
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured,
        isDemoMode,
        error,
        signIn,
        signUp,
        signInDemo,
        signOut,
        refreshProfile,
        updateCurrentProfile,
        checkConfiguration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
}
