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

export const userService = {
    createUser,
};

export default userService;
