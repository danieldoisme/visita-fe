import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/utils/tokenStorage";
import { getErrorMessage, NETWORK_ERRORS } from "./errorMessages";

/**
 * API Response structure from backend
 */
export interface ApiResponse<T> {
    code: number;
    message?: string;
    result?: T;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(
        public code: number,
        message: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}

/**
 * Configured Axios instance for API calls
 */
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Request interceptor - attach Authorization header
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Flag to prevent multiple refresh attempts
 */
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Response interceptor - handle token refresh and errors
 */
apiClient.interceptors.response.use(
    (response) => {
        // Check if the API response indicates an error via code
        const data = response.data as ApiResponse<unknown>;
        if (data.code && data.code !== 1000) {
            const errorMessage = getErrorMessage(data.code, data.message);
            return Promise.reject(new ApiError(data.code, errorMessage));
        }
        return response;
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Handle network errors
        if (!error.response) {
            if (error.code === "ECONNABORTED") {
                throw new ApiError(0, NETWORK_ERRORS.TIMEOUT, error);
            }
            throw new ApiError(0, NETWORK_ERRORS.NO_CONNECTION, error);
        }

        const { status, data } = error.response;

        // Handle 401 - attempt token refresh
        if (status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = tokenStorage.getRefreshToken();
            if (!refreshToken) {
                // No refresh token, clear tokens and reject
                tokenStorage.clearTokens();
                processQueue(new ApiError(1007, getErrorMessage(1007)));
                isRefreshing = false;
                throw new ApiError(1007, getErrorMessage(1007));
            }

            try {
                const refreshResponse = await axios.post<
                    ApiResponse<{ token: string; refreshToken: string }>
                >(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/auth/refresh`, {
                    token: refreshToken,
                });

                if (refreshResponse.data.code === 1000 && refreshResponse.data.result) {
                    const { token, refreshToken: newRefreshToken } =
                        refreshResponse.data.result;
                    tokenStorage.setAccessToken(token);
                    if (newRefreshToken) {
                        tokenStorage.setRefreshToken(newRefreshToken);
                    }

                    processQueue(null, token);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                tokenStorage.clearTokens();
                processQueue(refreshError);
                throw new ApiError(1007, getErrorMessage(1007), refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        const errorCode = data?.code || status;
        const errorMessage = getErrorMessage(
            errorCode,
            data?.message || NETWORK_ERRORS.SERVER_ERROR
        );
        throw new ApiError(errorCode, errorMessage, error);
    }
);

export default apiClient;
