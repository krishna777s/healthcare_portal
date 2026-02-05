import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name?: string;
  emailConfirmed: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Supabase user to our User type
  // Only returns user if email is verified
  const convertSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
    if (!supabaseUser) return null;
    
    // Check if email is confirmed - treat unverified users as unauthenticated
    if (!supabaseUser.email_confirmed_at) {
      return null;
    }
    
    // Fetch user role from profiles table
    let userRole: string | undefined;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', supabaseUser.id)
        .single();
      
      userRole = profile?.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0],
      emailConfirmed: true, // Always true at this point since we checked above
      role: userRole,
    };
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking Supabase session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setLoading(false);
          return;
        }
        
        console.log('Session found:', !!session);
        const convertedUser = await convertSupabaseUser(session?.user || null);
        setUser(convertedUser);
      } catch (error) {
        console.error('Fatal session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Session check timeout - setting loading to false');
      setLoading(false);
    }, 2000); // 2 second timeout - reduced from 5 seconds

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const convertedUser = await convertSupabaseUser(session?.user || null);
      setUser(convertedUser);
    });

    // Clean up timeout and subscription
    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // DEMO MODE: Allow demo accounts to bypass Supabase
      const demoAccounts = {
        'demo.admin@cerevyn.com': { role: 'hospital_admin', name: 'Demo Admin' },
        'demo.doctor@cerevyn.com': { role: 'doctor', name: 'Dr. Demo' },
        'demo.patient@cerevyn.com': { role: 'patient', name: 'Demo Patient' },
      };

      // Check if this is a demo account
      if (email in demoAccounts && password === 'Demo@123') {
        const demoUser = demoAccounts[email as keyof typeof demoAccounts];
        setUser({
          id: `demo-${demoUser.role}`,
          email: email,
          name: demoUser.name,
          emailConfirmed: true,
          role: demoUser.role,
        });
        return; // Skip Supabase authentication
      }

      // Normal Supabase login for non-demo accounts
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        // Sign out the unverified user
        await supabase.auth.signOut();
        setUser(null);
        throw new Error("Please verify your email before signing in. Check your inbox for the verification link.");
      }

      if (data.user) {
        const convertedUser = await convertSupabaseUser(data.user);
        setUser(convertedUser);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Failed to sign in. Please check your credentials.");
    }
  };

  const signup = async (email: string, password: string, name?: string, role?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
            full_name: name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Create profile entry in profiles table
      if (data.user && role) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: name || email.split("@")[0],
            role: role,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw new Error(`Account created but profile setup failed: ${profileError.message}`);
        }
      }

      // Do NOT set user state here - user must verify email first
      // The user will be null until they verify their email and sign in
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(error.message || "Failed to create account. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user even if logout fails
      setUser(null);
    }
  };

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131e3a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
