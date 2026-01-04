import apiClient, { type ApiResponse } from "./apiClient";
import type { UserResponse } from "./generated/types.gen";

/**
 * Staff member for display
 */
export interface StaffMember {
    userId: string;
    fullName: string;
    email?: string;
}

/**
 * Page data structure from backend
 */
interface PageData<T> {
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
    size?: number;
    content?: T[];
    number?: number;
}

/**
 * Fetch staff members (admin endpoint)
 * GET /admins/staffs
 */
export const fetchStaffMembers = async (): Promise<StaffMember[]> => {
    const response = await apiClient.get<ApiResponse<PageData<UserResponse>>>(
        "/admins/staffs",
        {
            params: {
                page: 1,
                size: 100, // Get all staff in one request
            },
        }
    );

    const pageData = response.data.result;
    const staffList: StaffMember[] = (pageData?.content || []).map((user) => ({
        userId: user.userId || "",
        fullName: user.fullName || user.username || "",
        email: user.email,
    }));

    return staffList;
};
