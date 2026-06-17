import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Setup axios defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = sessionStorage.getItem("access_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get("/auth/me", { params: { token } });
        const userData = response.data;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.full_name || userData.name,
          emailConfirmed: true,
          role: userData.role,
        });
      } catch (error) {
        console.error('Session check error:', error);
        sessionStorage.removeItem("access_token");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Normal FastAPI login
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user: userData } = response.data;
      
      sessionStorage.setItem("access_token", access_token);
      
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.full_name || userData.name,
        emailConfirmed: true,
        role: userData.role,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.detail || "Failed to sign in. Please check your credentials.");
    }
  };

  const signup = async (email: string, password: string, name?: string, role?: string) => {
    try {
      await api.post("/auth/signup", {
        email,
        password,
        name,
        role
      });
      // Optionally login automatically here, or require login afterwards.
      // For now, we mimic old behavior where user has to login.
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(error.response?.data?.detail || "Failed to create account. Please try again.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#131e3a]" />;
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
