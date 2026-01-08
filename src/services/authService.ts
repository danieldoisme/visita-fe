import { apiClient, ApiResponse, ApiError } from "@/api/apiClient";
import { getErrorMessage, NETWORK_ERRORS } from "@/api/errorMessages";

// ============================================================================
// Request/Response Types
// ============================================================================

export interface LoginRequest {
    email?: string;
    username?: string;
    password: string;
}

export interface AuthenticationResponse {
    authenticated: boolean;
    token: string;
    refreshToken: string;
}

export interface RefreshRequest {
    token: string;
}

export interface LogoutRequest {
    token: string;
}

export interface IntrospectRequest {
    token: string;
}

export interface IntrospectResponse {
    valid: boolean;
}

interface ApiIntrospectResponse {
    valid?: string;
}

// ============================================================================
// Auth Service
// ============================================================================

/**
 * Login with email/username and password
 */
export const login = async (
    request: LoginRequest
): Promise<AuthenticationResponse> => {
    try {
        const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
            "/auth/login",
            request
        );

        if (response.data.code === 1000 && response.data.result) {
            return response.data.result;
        }

        throw new ApiError(
            response.data.code,
            getErrorMessage(response.data.code, response.data.message)
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(9999, NETWORK_ERRORS.SERVER_ERROR, error);
    }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
    request: RefreshRequest
): Promise<AuthenticationResponse> => {
    try {
        const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
            "/auth/refresh",
            request
        );

        if (response.data.code === 1000 && response.data.result) {
            return response.data.result;
        }

        throw new ApiError(
            response.data.code,
            getErrorMessage(response.data.code, response.data.message)
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(9999, NETWORK_ERRORS.SERVER_ERROR, error);
    }
};

/**
 * Logout and invalidate tokens
 */
export const logout = async (request: LogoutRequest): Promise<void> => {
    try {
        await apiClient.post<ApiResponse<void>>("/auth/logout", request);
    } catch (error) {
        // Logout should not fail silently for the user, but we still clear tokens locally
        console.error("Logout API call failed:", error);
    }
};

/**
 * Introspect/validate a token.
 * Note: API returns `valid` as a string, this function converts it to boolean.
 */
export const introspect = async (
    request: IntrospectRequest
): Promise<IntrospectResponse> => {
    try {
        const response = await apiClient.post<ApiResponse<ApiIntrospectResponse>>(
            "/auth/introspect",
            request
        );

        if (response.data.code === 1000 && response.data.result) {
            // API returns valid as string ("true"/"false"), convert to boolean
            return { valid: response.data.result.valid === "true" };
        }

        return { valid: false };
    } catch {
        return { valid: false };
    }
};

/**
 * Exchange Google access token for app tokens (Google OAuth login)
 */
export const outboundAuthenticate = async (
    googleAccessToken: string
): Promise<AuthenticationResponse> => {
    try {
        const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
            "/auth/outbound/authentication",
            { token: googleAccessToken }
        );

        if (response.data.code === 1000 && response.data.result) {
            return response.data.result;
        }

        throw new ApiError(
            response.data.code,
            getErrorMessage(response.data.code, response.data.message)
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(9999, NETWORK_ERRORS.SERVER_ERROR, error);
    }
};

export const authService = {
    login,
    refreshToken,
    logout,
    introspect,
    outboundAuthenticate,
};

export default authService;
