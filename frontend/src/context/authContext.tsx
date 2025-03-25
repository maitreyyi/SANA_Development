import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { UserRecord as User } from '../../../backend/types/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { API_URL } from '../api/api';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';

type SignupData = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
};

interface AuthContextProps {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (signupData: SignupData) => Promise<{
      isConfirmed: boolean;
      email: string | undefined;
  }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    supabaseUser: null,
    login: async () => {},
    loginWithGoogle: async () => {},
    signup: async () => ({
      isConfirmed: false,
      email: undefined
    }),
    logout: async () => {},
    isLoading: true,
    authFetch: async () => new Response(),
});

const getSupabaseToken = async () => {
  try {
    const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const storageKey = `sb-${supabaseProjectId}-auth-token`;
    const sessionDataString = localStorage.getItem(storageKey);
    // console.log('Storage key:', storageKey, sessionDataString);
    // console.log('Session data available:', !!sessionDataString);
    
    if (!sessionDataString) return null;
    
    const sessionData = JSON.parse(sessionDataString);
    return sessionData?.access_token || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [user, setUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // const [authError, setAuthError] = useState<Error | null>(null);
    const navigate = useNavigate();

    // Simplified authFetch function using the direct localStorage approach
    const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
      try {
        const token = await getSupabaseToken();
        
        if (!token) {
          throw new Error('No access token available');
        }
        const isFormData = options.body instanceof FormData;
        
        const headers = {
          ...(!isFormData && { 'Content-Type': 'application/json' }),
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        };
        
        const fullUrl = url.startsWith(API_URL) ? url : `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
        
        const response = await fetch(fullUrl, {
          ...options,
          headers,
        });
        
        return response;
      } catch (error) {
        console.error('Auth fetch error:', error);
        throw error;
      }
    }, []);

    // Fetch user profile from backend
    const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
      try {
          const profileResponse = await authFetch(`${API_URL}/api/auth/profile`);
          
          if (profileResponse.status === 404) {
              // Create user if not found
              const createResponse = await authFetch(`${API_URL}/api/auth/register`, {
                  method: 'POST',
                  body: JSON.stringify({
                      email: supabaseUser.email,
                      id: supabaseUser.id,
                      first_name: supabaseUser.user_metadata.first_name,
                      last_name: supabaseUser.user_metadata.last_name,
                  })
              });
              
              if (!createResponse.ok) {
                  throw new Error('Failed to create user profile');
              }
              
              // Fetch the newly created profile
              return fetchUserProfile(supabaseUser);
          }
          
          if (!profileResponse.ok) {
              throw new Error(`Profile fetch failed: ${profileResponse.status}`);
          }
          
          const data = await profileResponse.json();
          if (data.status === 'success') {
              setUser(data.data.user);
          } else {
              throw new Error('Invalid profile data format');
          }
      } catch (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
          throw error;
      }
  }, [authFetch]);

  // Clean login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setSupabaseUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) throw error;

        if (data?.url) {
            window.location.href = data.url;
        }

    } catch (error) {
        console.error('Google login error:', error);
        setUser(null);
        setSupabaseUser(null);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (signupData: SignupData) => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signUp({
            email: signupData.email,
            password: signupData.password,
            options: {
                data: {
                    first_name: signupData.first_name,
                    last_name: signupData.last_name,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`
            },
        });
        
        if (error) throw error;
        if (!data.user) {
            throw new Error('No user data returned from signup');
        }
        
        // Handle email verification
        if (!data.user.confirmed_at) {
            navigate('/verification-pending', { 
                state: { email: data.user.email } 
            });
            return {
                isConfirmed: false,
                email: data.user.email
            };
        }

        // If pre-verified
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchUserProfile(data.user);
            navigate('/dashboard');
        }
        
        return {
            isConfirmed: Boolean(data.user.confirmed_at),
            email: data.user?.email
        };
    } catch (error) {
        console.error('Signup error:', error);
        setUser(null);
        setSupabaseUser(null);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Auth state change listener will clear the user state
      setUser(null);
      setSupabaseUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setSupabaseUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified auth state management
  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check if we have a current session
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          setSupabaseUser(data.session.user);
          try {
            await fetchUserProfile(data.session.user);
          } catch (err) {
            console.error('Error fetching initial profile:', err);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setUser(null);
        setSupabaseUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initialize auth
    initAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change: ${event}`);
      
      if (event === 'SIGNED_IN' && session) {
        setIsLoading(true);
        setSupabaseUser(session.user);
        
        try {
          await fetchUserProfile(session.user);
          navigate('/dashboard');
        } catch (error) {
          console.error('Error fetching profile after sign in:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
        navigate('/login');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, fetchUserProfile]);

  const value = {
    user,
    supabaseUser,
    login,
    loginWithGoogle,
    signup,
    logout,
    isLoading,
    authFetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};