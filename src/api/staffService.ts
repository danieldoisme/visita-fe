import apiClient, { type ApiResponse } from "./apiClient";
import type { UserResponse } from "./generated/types.gen";
import type { Tour } from "@/context/TourContext";
import type { PaginatedResult, PaginationParams } from "./tourService";
import {
    type StaffToursPageResponse,
    mapTourResponsesToTours,
} from "./mappers/staffTourMapper";

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

/**
 * Fetch tours assigned to a specific staff member
 * GET /staffs/{id}/tours
 */
export const fetchStaffTours = async (
    staffId: string,
    params?: PaginationParams
): Promise<PaginatedResult<Tour>> => {
    const response = await apiClient.get<ApiResponse<StaffToursPageResponse>>(
        `/staffs/${staffId}/tours`,
        {
            params: {
                page: params?.page ?? 0,
                size: params?.size ?? 20,
            },
        }
    );

    const pageData = response.data.result;
    const pageInfo = pageData?.page;
    const tours = mapTourResponsesToTours(pageData?.content || []);

    return {
        content: tours,
        totalElements: pageInfo?.totalElements || 0,
        totalPages: pageInfo?.totalPages || 0,
        currentPage: pageInfo?.number || 0,
        pageSize: pageInfo?.size || 20,
        isFirst: (pageInfo?.number || 0) === 0,
        isLast: (pageInfo?.number || 0) >= (pageInfo?.totalPages || 1) - 1,
    };
};

/**
 * Customer data for staff to create a new customer
 */
export interface CreateCustomerRequest {
    username?: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dob?: string;
    address?: string;
}

/**
 * Customer result after creation
 */
export interface CustomerResult {
    userId: string;
    username?: string;
    fullName: string;
    email: string;
    phone?: string;
    gender?: string;
    dob?: string;
    address?: string;
    isActive?: boolean;
}

/**
 * Create a new customer account (staff endpoint)
 * POST /staffs/customers
 */
export const createCustomerForStaff = async (
    data: CreateCustomerRequest
): Promise<CustomerResult> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
        "/staffs/customers",
        data
    );

    const result = response.data.result;
    if (!result) {
        throw new Error("Không thể tạo tài khoản khách hàng");
    }

    return {
        userId: result.userId || "",
        username: result.username,
        fullName: result.fullName || "",
        email: result.email || "",
        phone: result.phone,
        gender: result.gender,
        dob: result.dob,
        address: result.address,
        isActive: result.isActive,
    };
};
