import apiClient, { ApiError } from "../api/apiClient";
import { getErrorMessage, NETWORK_ERRORS } from "../api/errorMessages";

interface ApiResponse<T> {
    code: number;
    message?: string;
    result?: T;
}

export interface UserCreateRequest {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dob?: string;
    address?: string;
}

export interface UserResponse {
    userId: string;
    username?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    address?: string;
    isActive?: boolean;
    roles?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface UserUpdateRequest {
    fullName?: string;
    phone?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dob?: string;
    address?: string;
}

export interface AdminResponse {
    adminId: string;
    username?: string;
    fullName?: string;
    email?: string;
    createdAt?: string;
}

/**
 * Create a new user account (public registration)
 */
export const createUser = async (
    request: UserCreateRequest
): Promise<UserResponse> => {
    try {
        const response = await apiClient.post<ApiResponse<UserResponse>>(
            "/users/create",
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
 * Get current authenticated user's profile
 * GET /users/myInfo
 */
export const getMyInfo = async (): Promise<UserResponse> => {
    try {
        const response = await apiClient.get<ApiResponse<UserResponse>>(
            "/users/myInfo"
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
 * Update current user's profile
 * PUT /users/update/{id}
 */
export const updateUserProfile = async (
    userId: string,
    update: UserUpdateRequest
): Promise<UserResponse> => {
    try {
        const response = await apiClient.put<ApiResponse<UserResponse>>(
            `/users/update/${userId}`,
            update
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
 * Get current authenticated admin's profile
 * GET /admins/myInfo
 */
export const getAdminMyInfo = async (): Promise<AdminResponse> => {
    try {
        const response = await apiClient.get<ApiResponse<AdminResponse>>(
            "/admins/myInfo"
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

export const userService = {
    createUser,
    getMyInfo,
    getAdminMyInfo,
    updateUserProfile,
};

export default userService;

