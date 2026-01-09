import {
  listStaffs,
  createStaff,
  updateUser1,
  updateUserStatus,
  deleteUser,
} from "@/api/generated/sdk.gen";
import type {
  UserResponse,
  PageObject,
  UserCreateRequest,
} from "@/api/generated/types.gen";

// ============================================================================
// TYPES
// ============================================================================

export interface Staff {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dob?: string;
  address?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffCreateData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dob?: string;
  address?: string;
}

export interface StaffUpdateData {
  fullName?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dob?: string;
  address?: string;
}

export interface PaginatedStaffs {
  staffs: Staff[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ============================================================================
// MAPPERS
// ============================================================================

const mapGender = (
  gender?: string
): "male" | "female" | "other" | undefined => {
  if (!gender) return undefined;
  const lower = gender.toLowerCase();
  if (lower === "male") return "male";
  if (lower === "female") return "female";
  return "other";
};

const mapStaffResponse = (user: UserResponse): Staff => ({
  id: user.userId ?? "",
  username: user.username ?? "",
  email: user.email ?? "",
  fullName: user.fullName ?? "",
  phone: user.phone,
  gender: mapGender(user.gender),
  dob: user.dob,
  address: user.address,
  isActive: user.isActive ?? true,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ============================================================================
// ADMIN: LIST STAFFS (PAGINATED)
// ============================================================================

export const fetchStaffs = async (
  page: number = 1,
  size: number = 10
): Promise<PaginatedStaffs> => {
  const response = await listStaffs({
    query: { page, size },
  });

  if (response.data?.result) {
    const pageData = response.data.result as PageObject & {
      content?: UserResponse[];
    };
    const staffs = (pageData.content ?? []).map(mapStaffResponse);

    return {
      staffs,
      totalElements: pageData.totalElements ?? 0,
      totalPages: pageData.totalPages ?? 1,
      currentPage: page,
      pageSize: size,
    };
  }

  throw new Error("Failed to fetch staffs");
};

// ============================================================================
// ADMIN: FETCH ALL STAFFS (FOR CLIENT-SIDE PAGINATION)
// ============================================================================

export const fetchAllStaffs = async (): Promise<Staff[]> => {
  // Fetch all staffs with a large page size
  const response = await listStaffs({
    query: { page: 1, size: 1000 },
  });

  if (response.data?.result) {
    const pageData = response.data.result as PageObject & {
      content?: UserResponse[];
    };
    return (pageData.content ?? []).map(mapStaffResponse);
  }

  throw new Error("Failed to fetch staffs");
};

// ============================================================================
// ADMIN: CREATE STAFF
// ============================================================================

export const createStaffApi = async (data: StaffCreateData): Promise<Staff> => {
  const body: UserCreateRequest = {
    username: data.username,
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    phone: data.phone,
    gender: data.gender?.toUpperCase() as
      | "MALE"
      | "FEMALE"
      | "OTHER"
      | undefined,
    dob: data.dob,
    address: data.address,
  };

  const response = await createStaff({
    body,
  });

  if (response.data?.result) {
    return mapStaffResponse(response.data.result);
  }

  throw new Error("Failed to create staff");
};

// ============================================================================
// ADMIN: UPDATE STAFF BY ID
// ============================================================================

export const updateStaffById = async (
  id: string,
  data: StaffUpdateData
): Promise<Staff> => {
  const response = await updateUser1({
    path: { id },
    body: {
      fullName: data.fullName,
      phone: data.phone,
      gender: data.gender?.toUpperCase() as
        | "MALE"
        | "FEMALE"
        | "OTHER"
        | undefined,
      dob: data.dob,
      address: data.address,
    },
  });

  if (response.data?.result) {
    return mapStaffResponse(response.data.result);
  }

  throw new Error("Failed to update staff");
};

// ============================================================================
// ADMIN: UPDATE STAFF STATUS (LOCK/UNLOCK)
// ============================================================================

export const updateStaffStatusApi = async (
  id: string,
  isActive: boolean
): Promise<void> => {
  const response = await updateUserStatus({
    path: { id },
    query: { isActive },
  });

  if (response.error) {
    throw new Error("Failed to update staff status");
  }
};

// ============================================================================
// ADMIN: DELETE STAFF
// ============================================================================

export const deleteStaffApi = async (id: string): Promise<void> => {
  const response = await deleteUser({
    path: { id },
  });

  if (response.error) {
    throw new Error("Failed to delete staff");
  }
};
