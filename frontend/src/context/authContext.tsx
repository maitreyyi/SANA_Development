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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [user, setUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

      // Helper function to make authenticated requests
      const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        
        if (!token) {
            throw new Error('No access token available');
        }
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };
    
    
        return fetch(url, {
            ...options,
            headers,
        });
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) {
              console.error('No access token available');
              setUser(null);
              return;
          }
  
          // Try to fetch the profile first
          try {
              const profileResponse = await authFetch(`${API_URL}/api/auth/profile`);

              // If profile doesn't exist, create it
              if (profileResponse.status === 404) {
                  console.log('User not found in backend, creating...');
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
                      console.error('Failed to create user in backend');
                      return;
                  }

                  // Retry fetching profile after creation
                  return await fetchUserProfile(supabaseUser);
              }
              if (!profileResponse.ok) {
                  console.error('Failed to fetch profile:', await profileResponse.text());
                  setUser(null);
                  return;
              }
  
              const data = await profileResponse.json();
              if (data.status === 'success') {
                  setUser(data.data.user);
              } else {
                  setUser(null);
              }
          } catch (error) {
              console.error('Error fetching/creating profile:', error);
              setUser(null);
          }
      } catch (error) {
          console.error('Error in fetchUserProfile:', error);
          setUser(null);
      }
  }, [setUser, authFetch]);
  

  
      
  
      
    useEffect(() => {
      const initializeAuth = async () => {
      try {
          const { data, error } = await supabase.auth.getSession();
                      
          if (error) {
            console.error('Session fetch error:', error); // Add this
            throw error;
          }
        
          
          if (data.session) {
              setSupabaseUser(data.session.user);
              await fetchUserProfile(data.session.user);
            } else {
              setSupabaseUser(null);
              setUser(null);
          }
      } catch (error) {
          console.error('Auth initialization error:', error);
          setSupabaseUser(null);
          setUser(null);
      } finally {
          setIsLoading(false);
      }
  };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true); 
      try{
        if (session?.user) {
          setSupabaseUser(session.user);
          if (event === 'SIGNED_IN') {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const isNewRegistration = session.user.app_metadata.provider === 'google';
              await fetchUserProfile(session.user);
              // await fetchUserProfile(session.user, isNewRegistration);
              navigate('/dashboard');
          } else if (event === 'TOKEN_REFRESHED') {
              await fetchUserProfile(session.user);
              // await fetchUserProfile(session.user, false);
          }
        } else {
            setSupabaseUser(null);
            setUser(null);
        }
      }catch (error) {
          console.error('Auth state change error:', error);
          setSupabaseUser(null);
          setUser(null);
      } finally {
          setIsLoading(false); 
      }
  });

    return () => {
        authListener.subscription.unsubscribe();
    };
}, [navigate, fetchUserProfile]);

  // Helper function to make authenticated requests
  // const authFetch = async (url: string, options: RequestInit = {}) => {
  //   const token = await supabase.auth.getSession().then(({ data }) => 
  //     data.session?.access_token
  //   );
    
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     ...(token && { Authorization: `Bearer ${token}` }),
  //     ...options.headers,
  //   };

  //   return fetch(url, {
  //     ...options,
  //     headers,
  //   });
  // };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setSupabaseUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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

const signup = async (signupData: SignupData) => {
  setIsLoading(true);
  try {
      console.log('Starting signup process');
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
      
      
      // nav to verification page
      if (!data.user.confirmed_at) {
          console.log('User needs email verification');
          navigate('/verification-pending', { 
              state: { email: data.user.email } 
          });
          return {
              isConfirmed: false,
              email: data.user.email
          };
      }

      console.log('User is pre-verified, checking session');
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
          console.log('Session available, creating user in backend');
          // await fetchUserProfile(data.user, true);
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

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Auth state change listener will clear the user state
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setSupabaseUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    supabaseUser,
    login,
    loginWithGoogle,
    signup,
    logout,
    isLoading,
    authFetch,
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