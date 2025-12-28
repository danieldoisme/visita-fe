import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { tokenStorage } from "../utils/tokenStorage";
import { mockAuthenticate, mockRegister, mockGetUserInfo } from "../services/mockAuthService";

export type UserRole = "user" | "admin" | "staff";

export interface User {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  isActive?: boolean;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = "visita_auth_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const hasToken = tokenStorage.hasTokens();

      if (storedUser && hasToken) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          // Validate stored user exists in mock data
          const validUser = mockGetUserInfo(parsedUser.userId);
          if (validUser) {
            setUser(validUser);
          } else {
            // Fallback to stored user if not found (e.g., registered user)
            setUser(parsedUser);
          }
        } catch {
          // Invalid stored data, clear everything
          tokenStorage.clearTokens();
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    isAdmin: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    const result = mockAuthenticate(email, password, isAdmin);

    if (result.success && result.user && result.token) {
      // Store token and user
      tokenStorage.setAccessToken(result.token);
      setUser(result.user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
      return { success: true };
    }

    return { success: false, error: result.error };
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = mockRegister(email, password, name);

    if (result.success && result.user && result.token) {
      // Store token and user (auto-login after registration)
      tokenStorage.setAccessToken(result.token);
      setUser(result.user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
      return { success: true };
    }

    return { success: false, error: result.error };
  };

  const logout = () => {
    setUser(null);
    tokenStorage.clearTokens();
    localStorage.removeItem(AUTH_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStaff: user?.role === "staff",
        loading,
        login,
        register,
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
