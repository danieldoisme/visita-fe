
import {
    listUsers,
    getUserById,
    updateUserStatus,
    updateUser1,
    deleteUser,
} from "@/api/generated/sdk.gen";
import type { UserResponse, PageObject } from "@/api/generated/types.gen";

// ============================================================================
// TYPES
// ============================================================================

export interface User {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    gender?: "male" | "female" | "other";
    dob?: string;
    address?: string;
    role: "admin" | "staff" | "user";
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserUpdateData {
    fullName?: string;
    phone?: string;
    gender?: "male" | "female" | "other";
    dob?: string;
    address?: string;
}

export interface PaginatedUsers {
    users: User[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// ============================================================================
// MAPPERS
// ============================================================================

const mapGender = (gender?: string): "male" | "female" | "other" | undefined => {
    if (!gender) return undefined;
    const lower = gender.toLowerCase();
    if (lower === "male") return "male";
    if (lower === "female") return "female";
    return "other";
};

const mapRole = (roles?: string[]): "admin" | "staff" | "user" => {
    if (!roles || roles.length === 0) return "user";
    const rolesLower = roles.map((r) => r.toLowerCase());
    if (rolesLower.includes("admin")) return "admin";
    if (rolesLower.includes("staff")) return "staff";
    return "user";
};

const mapUserResponse = (user: UserResponse): User => ({
    id: user.userId ?? "",
    email: user.email ?? "",
    fullName: user.fullName ?? "",
    phone: user.phone,
    gender: mapGender(user.gender),
    dob: user.dob,
    address: user.address,
    role: mapRole(user.roles),
    isActive: user.isActive ?? true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// ============================================================================
// ADMIN: LIST USERS (PAGINATED)
// ============================================================================

export const fetchUsers = async (
    page: number = 1,
    size: number = 10
): Promise<PaginatedUsers> => {
    // Backend uses 1-indexed pages
    const response = await listUsers({
        query: { page, size },
    });

    if (response.data?.result) {
        const pageData = response.data.result as PageObject & { content?: UserResponse[] };
        const users = (pageData.content ?? []).map(mapUserResponse);

        return {
            users,
            totalElements: pageData.totalElements ?? 0,
            totalPages: pageData.totalPages ?? 1,
            currentPage: page,
            pageSize: size,
        };
    }

    throw new Error("Failed to fetch users");
};

// ============================================================================
// ADMIN: GET USER BY ID
// ============================================================================

export const fetchUserById = async (id: string): Promise<User> => {
    const response = await getUserById({
        path: { id },
    });

    if (response.data?.result) {
        return mapUserResponse(response.data.result);
    }

    throw new Error("Failed to fetch user");
};

// ============================================================================
// ADMIN: UPDATE USER STATUS (LOCK/UNLOCK)
// ============================================================================

export const updateUserStatusApi = async (
    id: string,
    isActive: boolean
): Promise<void> => {
    const response = await updateUserStatus({
        path: { id },
        query: { isActive },
    });

    if (response.error) {
        throw new Error("Failed to update user status");
    }
};

// ============================================================================
// ADMIN: UPDATE USER BY ID
// ============================================================================

export const updateUserById = async (
    id: string,
    data: UserUpdateData
): Promise<User> => {
    const response = await updateUser1({
        path: { id },
        body: {
            fullName: data.fullName,
            phone: data.phone,
            gender: data.gender?.toUpperCase() as "MALE" | "FEMALE" | "OTHER" | undefined,
            dob: data.dob,
            address: data.address,
        },
    });

    if (response.data?.result) {
        return mapUserResponse(response.data.result);
    }

    throw new Error("Failed to update user");
};
// ============================================================================
// ADMIN: DELETE USER (SOFT DELETE)
// ============================================================================

export const deleteUserApi = async (id: string): Promise<void> => {
    const response = await deleteUser({
        path: { id },
    });

    if (response.error) {
        throw new Error("Failed to delete user");
    }
};
