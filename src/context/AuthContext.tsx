import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { tokenStorage } from "../utils/tokenStorage";
import {
  decodeJwt,
  extractRolesFromScope,
  getPrimaryRole,
  isTokenExpired,
  type UserRole,
} from "../utils/jwtUtils";
import authService from "../services/authService";
import userService from "../services/userService";
import { ApiError } from "../api/apiClient";
import { clearTourIdMap } from "../api/mappers/tourMapper";
import { clearBookingIdMap } from "../api/mappers/bookingMapper";

export type { UserRole };

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

export interface UserProfileUpdate {
  fullName?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  login: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (
    googleAccessToken: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: UserProfileUpdate) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = "visita_auth_user";

/**
 * Extract user from JWT token
 */
const getUserFromToken = (token: string): User | null => {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const roles = extractRolesFromScope(payload.scope);
  const primaryRole = getPrimaryRole(roles);

  // The JWT 'sub' claim contains the user identifier (email or username)
  return {
    userId: payload.jti || payload.sub,
    email: payload.sub,
    fullName: payload.sub, // Will be updated from stored user data if available
    role: primaryRole,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize auth state from stored tokens
   */
  const initializeAuth = useCallback(async () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    if (!accessToken && !refreshToken) {
      setLoading(false);
      return;
    }

    // Try to use access token if valid
    if (accessToken && !isTokenExpired(accessToken)) {
      const tokenUser = getUserFromToken(accessToken);
      if (tokenUser) {
        // Restore additional user data from localStorage if available
        const storedUser = localStorage.getItem(AUTH_USER_KEY);
        if (storedUser) {
          try {
            const parsedUser: User = JSON.parse(storedUser);
            setUser({ ...tokenUser, ...parsedUser, role: tokenUser.role });
          } catch {
            setUser(tokenUser);
          }
        } else {
          setUser(tokenUser);
        }
        setLoading(false);
        return;
      }
    }

    // Access token expired, try refresh
    if (refreshToken) {
      try {
        const response = await authService.refreshToken({ token: refreshToken });
        tokenStorage.setAccessToken(response.token);
        tokenStorage.setRefreshToken(response.refreshToken);

        const tokenUser = getUserFromToken(response.token);
        if (tokenUser) {
          const storedUser = localStorage.getItem(AUTH_USER_KEY);
          if (storedUser) {
            try {
              const parsedUser: User = JSON.parse(storedUser);
              setUser({ ...tokenUser, ...parsedUser, role: tokenUser.role });
            } catch {
              setUser(tokenUser);
            }
          } else {
            setUser(tokenUser);
          }
        }
      } catch {
        // Refresh failed, clear everything
        tokenStorage.clearTokens();
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Determine if identifier is email or username
      const isEmail = identifier.includes("@");
      const request = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await authService.login(request);

      if (response.authenticated && response.token) {
        tokenStorage.setAccessToken(response.token);
        tokenStorage.setRefreshToken(response.refreshToken);

        const tokenUser = getUserFromToken(response.token);
        if (tokenUser) {
          // Fetch full user profile to get correct fullName and userId
          try {
            const userProfile = await userService.getMyInfo();
            const fullUser: User = {
              ...tokenUser,
              userId: userProfile.userId,
              email: userProfile.email || tokenUser.email,
              fullName: userProfile.fullName || tokenUser.fullName,
              phone: userProfile.phone,
              gender: userProfile.gender,
              dob: userProfile.dob,
              address: userProfile.address,
              isActive: userProfile.isActive,
            };
            setUser(fullUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fullUser));
          } catch {
            // Fallback to token user if profile fetch fails
            setUser(tokenUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(tokenUser));
          }
        }

        return { success: true };
      }

      return { success: false, error: "Đăng nhập không thành công" };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Đã xảy ra lỗi. Vui lòng thử lại." };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await userService.createUser({
        email,
        password,
        fullName: name,
      });

      // Registration successful - user should now log in
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Đã xảy ra lỗi. Vui lòng thử lại." };
    }
  };

  const loginWithGoogle = async (
    googleAccessToken: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.outboundAuthenticate(googleAccessToken);

      if (response.authenticated && response.token) {
        tokenStorage.setAccessToken(response.token);
        tokenStorage.setRefreshToken(response.refreshToken);

        const tokenUser = getUserFromToken(response.token);
        if (tokenUser) {
          // Fetch full user profile to get correct fullName
          try {
            const userProfile = await userService.getMyInfo();
            const fullUser: User = {
              ...tokenUser,
              userId: userProfile.userId,
              email: userProfile.email || tokenUser.email,
              fullName: userProfile.fullName || tokenUser.fullName,
              phone: userProfile.phone,
              gender: userProfile.gender,
              dob: userProfile.dob,
              address: userProfile.address,
              isActive: userProfile.isActive,
            };
            setUser(fullUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fullUser));
          } catch {
            // Fallback to token user if profile fetch fails
            setUser(tokenUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(tokenUser));
          }
        }

        return { success: true };
      }

      return { success: false, error: "Đăng nhập với Google không thành công" };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Đã xảy ra lỗi. Vui lòng thử lại." };
    }
  };

  const logout = async () => {
    const accessToken = tokenStorage.getAccessToken();

    // Call logout API to invalidate token on server
    if (accessToken) {
      await authService.logout({ token: accessToken });
    }

    // Clear local state
    setUser(null);
    tokenStorage.clearTokens();
    localStorage.removeItem(AUTH_USER_KEY);

    // Clear ID mappings to prevent memory leak
    clearTourIdMap();
    clearBookingIdMap();
  };

  /**
   * Update current user's profile
   */
  const updateProfile = async (
    updates: UserProfileUpdate
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    try {
      const response = await userService.updateUserProfile(user.userId, {
        fullName: updates.fullName,
        phone: updates.phone,
        gender: updates.gender?.toUpperCase() as "MALE" | "FEMALE" | "OTHER" | undefined,
        dob: updates.dob,
        address: updates.address,
      });

      const updatedUser: User = {
        ...user,
        fullName: response.fullName || user.fullName,
        phone: response.phone,
        gender: response.gender,
        dob: response.dob,
        address: response.address,
      };

      setUser(updatedUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Không thể cập nhật thông tin. Vui lòng thử lại." };
    }
  };

  /**
   * Refresh user data from API
   */
  const refreshUser = async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await userService.getMyInfo();

      const updatedUser: User = {
        userId: response.userId,
        email: response.email || user.email,
        fullName: response.fullName || user.fullName,
        phone: response.phone,
        gender: response.gender,
        dob: response.dob,
        address: response.address,
        isActive: response.isActive,
        role: user.role, // Keep role from token
      };

      setUser(updatedUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
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
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        refreshUser,
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
