/**
 * JWT Utilities for decoding tokens and extracting claims
 */

export interface JwtPayload {
    sub: string; // Subject (user ID or email)
    scope?: string; // Space-separated roles (e.g., "ROLE_ADMIN ROLE_STAFF")
    iat?: number; // Issued at
    exp?: number; // Expiration time
    iss?: string; // Issuer
    jti?: string; // JWT ID
}

export type UserRole = "user" | "admin" | "staff";

/**
 * Decode a JWT token without verification (client-side only).
 * For security-critical operations, always validate tokens on the backend.
 */
export const decodeJwt = (token: string): JwtPayload | null => {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        // Handle base64url encoding (replace URL-safe chars)
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
        console.error("Failed to decode JWT");
        return null;
    }
};

/**
 * Extract roles from JWT scope claim.
 * Backend returns roles as space-separated string: "ROLE_ADMIN ROLE_USER"
 */
export const extractRolesFromScope = (scope?: string): UserRole[] => {
    if (!scope) return ["user"];

    const roles: UserRole[] = [];
    const scopeParts = scope.split(" ");

    for (const part of scopeParts) {
        if (part === "ROLE_ADMIN") {
            roles.push("admin");
        } else if (part === "ROLE_STAFF") {
            roles.push("staff");
        } else if (part === "ROLE_USER") {
            roles.push("user");
        }
    }

    return roles.length > 0 ? roles : ["user"];
};

/**
 * Get the primary role (highest privilege) from roles array
 */
export const getPrimaryRole = (roles: UserRole[]): UserRole => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("staff")) return "staff";
    return "user";
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJwt(token);
    if (!payload?.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= payload.exp * 1000;
};
