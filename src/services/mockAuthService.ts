import type { User, UserRole } from "@/context/AuthContext";

// ============================================================================
// MOCK CREDENTIALS
// ============================================================================
const MOCK_CREDENTIALS = {
    admin: {
        email: "admin@visita.com",
        password: "admin123",
    },
    user: {
        email: "user@visita.com",
        password: "user123",
    },
};

// ============================================================================
// MOCK USER DATA
// ============================================================================
const MOCK_USERS: Record<string, User> = {
    "admin-001": {
        userId: "admin-001",
        email: "admin@visita.com",
        fullName: "Admin Visita",
        role: "admin",
    },
    "user-001": {
        userId: "user-001",
        email: "user@visita.com",
        fullName: "Nguyễn Văn A",
        phone: "0901234567",
        gender: "MALE",
        dob: "1990-01-15",
        address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
        isActive: true,
        role: "user",
    },
};

// Track registered users (in-memory, resets on page refresh)
const registeredUsers: Record<string, User & { password: string }> = {};

// ============================================================================
// MOCK AUTH FUNCTIONS
// ============================================================================

interface AuthResult {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
}

/**
 * Mock authentication - validates credentials and returns user data
 */
export const mockAuthenticate = (
    email: string,
    password: string,
    isAdmin: boolean = false
): AuthResult => {
    // Check admin credentials
    if (isAdmin) {
        if (
            email === MOCK_CREDENTIALS.admin.email &&
            password === MOCK_CREDENTIALS.admin.password
        ) {
            return {
                success: true,
                user: MOCK_USERS["admin-001"],
                token: "mock-admin-token-" + Date.now(),
            };
        }
        return {
            success: false,
            error: "Thông tin đăng nhập quản trị viên không đúng",
        };
    }

    // Check user credentials
    if (
        email === MOCK_CREDENTIALS.user.email &&
        password === MOCK_CREDENTIALS.user.password
    ) {
        return {
            success: true,
            user: MOCK_USERS["user-001"],
            token: "mock-user-token-" + Date.now(),
        };
    }

    // Check registered users
    const registeredUser = Object.values(registeredUsers).find(
        (u) => u.email === email && u.password === password
    );
    if (registeredUser) {
        const { password: _, ...userWithoutPassword } = registeredUser;
        return {
            success: true,
            user: userWithoutPassword,
            token: "mock-user-token-" + Date.now(),
        };
    }

    return {
        success: false,
        error: "Email hoặc mật khẩu không đúng",
    };
};

/**
 * Mock user registration
 */
export const mockRegister = (
    email: string,
    password: string,
    fullName: string
): AuthResult => {
    // Check if email already exists
    if (
        email === MOCK_CREDENTIALS.user.email ||
        email === MOCK_CREDENTIALS.admin.email ||
        Object.values(registeredUsers).some((u) => u.email === email)
    ) {
        return {
            success: false,
            error: "Email đã được sử dụng",
        };
    }

    // Create new user
    const userId = "user-" + Date.now();
    const newUser: User & { password: string } = {
        userId,
        email,
        fullName,
        role: "user" as UserRole,
        isActive: true,
        password,
    };

    registeredUsers[userId] = newUser;

    const { password: _, ...userWithoutPassword } = newUser;
    return {
        success: true,
        user: userWithoutPassword,
        token: "mock-user-token-" + Date.now(),
    };
};

/**
 * Mock get user info by stored user data
 */
export const mockGetUserInfo = (userId: string): User | null => {
    // Check predefined users
    if (MOCK_USERS[userId]) {
        return MOCK_USERS[userId];
    }

    // Check registered users
    if (registeredUsers[userId]) {
        const { password: _, ...userWithoutPassword } = registeredUsers[userId];
        return userWithoutPassword;
    }

    return null;
};
