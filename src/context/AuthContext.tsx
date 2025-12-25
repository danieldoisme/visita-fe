import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authenticate, createUser, getMyInfo, getMyInfo1 } from "../api/generated/sdk.gen";
import { tokenStorage } from "../utils/tokenStorage";
import "../api/apiClient"; // Initialize API client interceptors
import type { UserResponse, AdminResponse } from "../api/generated/types.gen";

export type UserRole = "user" | "admin";

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
  loading: boolean;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = "visita_auth_user";

// Convert API response to User interface
const mapUserResponseToUser = (response: UserResponse): User => ({
  userId: response.userId || "",
  email: response.email || "",
  fullName: response.fullName || "",
  phone: response.phone,
  gender: response.gender,
  dob: response.dob,
  address: response.address,
  isActive: response.isActive,
  role: "user",
});

// Convert Admin API response to User interface
const mapAdminResponseToUser = (response: AdminResponse): User => ({
  userId: response.adminId || "",
  email: response.email || "",
  fullName: response.fullName || response.username || "",
  role: "admin",
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage and validate token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const hasToken = tokenStorage.hasTokens();

      if (storedUser && hasToken) {
        try {
          // Try to validate as user first
          const response = await getMyInfo();
          if (response.data?.result) {
            const freshUser = mapUserResponseToUser(response.data.result);
            setUser(freshUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(freshUser));
          } else {
            throw new Error("No user data");
          }
        } catch {
          // User endpoint failed, try admin endpoint
          try {
            const adminResponse = await getMyInfo1();
            if (adminResponse.data?.result) {
              const freshAdmin = mapAdminResponseToUser(adminResponse.data.result);
              setUser(freshAdmin);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(freshAdmin));
            } else {
              throw new Error("No admin data");
            }
          } catch {
            // Both endpoints failed, clear everything
            tokenStorage.clearTokens();
            localStorage.removeItem(AUTH_USER_KEY);
          }
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
    try {
      // Call authenticate API
      // Backend uses 'email' for users and 'username' for admins
      const authResponse = await authenticate({
        body: isAdmin
          ? { username: email, password }  // Admin: only username
          : { email, password }             // User: only email
      });

      if (authResponse.data?.result?.authenticated && authResponse.data.result.token) {
        // Store tokens
        tokenStorage.setAccessToken(authResponse.data.result.token);
        if (authResponse.data.result.refreshToken) {
          tokenStorage.setRefreshToken(authResponse.data.result.refreshToken);
        }

        // Fetch user/admin info based on login type
        if (isAdmin) {
          // Admin login - fetch admin info
          const adminResponse = await getMyInfo1();
          if (adminResponse.data?.result) {
            const loggedInAdmin = mapAdminResponseToUser(adminResponse.data.result);
            setUser(loggedInAdmin);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedInAdmin));
            return { success: true };
          }
        } else {
          // User login - fetch user info
          const userResponse = await getMyInfo();
          if (userResponse.data?.result) {
            const loggedInUser = mapUserResponseToUser(userResponse.data.result);
            setUser(loggedInUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedInUser));
            return { success: true };
          }
        }

        // Failed to get info
        tokenStorage.clearTokens();
        return { success: false, error: "Không thể lấy thông tin người dùng" };
      }

      return { success: false, error: authResponse.data?.message || "Đăng nhập thất bại" };
    } catch (error: unknown) {
      console.error("Login error:", error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.message || "Email hoặc mật khẩu không đúng"
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call create user API
      const createResponse = await createUser({
        body: {
          email,
          password,
          fullName: name
        }
      });

      if (createResponse.data?.result) {
        // Auto-login after successful registration
        return await login(email, password);
      }

      return { success: false, error: createResponse.data?.message || "Đăng ký thất bại" };
    } catch (error: unknown) {
      console.error("Register error:", error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.message || "Email đã được sử dụng"
      };
    }
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
