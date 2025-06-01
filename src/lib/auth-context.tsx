import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

export interface UserProfile {
  name: string;
  email: string;
  height?: string;
  weight?: string;
  age?: number;
  gender?: string;
  medicalConditions?: string[];
  allergies?: string[];
  role?: string; // Add this line
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (user: UserProfile) => void;
  signup: (user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const login = (userData: UserProfile) => {
    // In a real app, this would involve API calls and token storage
    setUser(userData);
    // Store in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const signup = (userData: UserProfile) => {
    // In a real app, this would create a new user via API
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Check for user in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setIsInitialized(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitialized,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// AuthGuard component to protect routes and handle redirects
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Wait for auth initialization before deciding what to render
  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}