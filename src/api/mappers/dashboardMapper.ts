import type {
    ChartDataResponse,
    DashboardStatsResponse,
    TransactionResponse,
} from "../generated/types.gen";

// ============================================================================
// TYPES
// ============================================================================

export type ViewMode = "daily" | "monthly";
export type DayRange = 7 | 14 | 30;
export type Granularity = "DAY" | "MONTH";

export interface RevenueDataPoint {
    label: string;
    revenue: number;
}

export interface UsersDataPoint {
    label: string;
    users: number;
}

export interface BookingsDataPoint {
    label: string;
    bookings: number;
}

export interface DashboardStats {
    totalRevenue: number;
    revenueGrowth: number;
    newUsers: number;
    userGrowth: number;
    totalBookings: number;
    bookingGrowth: number;
    activeUsers: number;
}

export interface RecentTransaction {
    name: string;
    email: string;
    amount: string;
}

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Calculate date range based on day range selection
 */
export const calculateDateRange = (
    dayRange: DayRange
): { startDate: string; endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayRange);

    return {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
    };
};

/**
 * Format date as YYYY-MM-DD for API
 */
const formatDateForApi = (date: Date): string => {
    return date.toISOString().split("T")[0];
};

/**
 * Calculate 12-month range for monthly view
 */
export const calculateMonthlyRange = (): { startDate: string; endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);

    return {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
    };
};

// ============================================================================
// CHART LABEL FORMATTERS
// ============================================================================

/**
 * Format backend label to Vietnamese display label
 * Backend daily format: "2025-12-29" → "29/12"
 * Backend monthly format: "01/2026" → "Tháng 1"
 */
export const formatChartLabel = (label: string, granularity: Granularity): string => {
    if (granularity === "DAY") {
        // Format: "2025-12-29" → "29/12"
        const parts = label.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}`;
        }
        return label;
    } else {
        // Format: "01/2026" → "Tháng 1"
        const parts = label.split("/");
        if (parts.length === 2) {
            const month = parseInt(parts[0], 10);
            return `Tháng ${month}`;
        }
        return label;
    }
};

// ============================================================================
// CHART DATA MAPPERS
// ============================================================================

/**
 * Map ChartDataResponse[] to revenue chart format
 */
export const mapChartDataToRevenue = (
    data: ChartDataResponse[],
    granularity: Granularity
): RevenueDataPoint[] => {
    return data.map((item) => ({
        label: formatChartLabel(item.label || "", granularity),
        revenue: item.value || 0,
    }));
};

/**
 * Map ChartDataResponse[] to users chart format
 */
export const mapChartDataToUsers = (
    data: ChartDataResponse[],
    granularity: Granularity
): UsersDataPoint[] => {
    return data.map((item) => ({
        label: formatChartLabel(item.label || "", granularity),
        users: item.value || 0,
    }));
};

/**
 * Map ChartDataResponse[] to bookings chart format
 */
export const mapChartDataToBookings = (
    data: ChartDataResponse[],
    granularity: Granularity
): BookingsDataPoint[] => {
    return data.map((item) => ({
        label: formatChartLabel(item.label || "", granularity),
        bookings: item.value || 0,
    }));
};

// ============================================================================
// STATS MAPPER
// ============================================================================

/**
 * Map DashboardStatsResponse to frontend stats format
 */
export const mapStatsResponse = (
    response: DashboardStatsResponse
): DashboardStats => {
    return {
        totalRevenue: response.totalRevenue || 0,
        revenueGrowth: response.revenueGrowth || 0,
        newUsers: response.newUsers || 0,
        userGrowth: response.userGrowth || 0,
        totalBookings: response.totalBookings || 0,
        bookingGrowth: response.bookingGrowth || 0,
        activeUsers: response.activeUsers || 0,
    };
};

// ============================================================================
// TRANSACTIONS MAPPER
// ============================================================================

/**
 * Format VND currency
 */
export const formatVND = (value: number): string => {
    return value.toLocaleString("vi-VN") + "đ";
};

/**
 * Map TransactionResponse[] to recent sales format
 */
export const mapTransactionsToRecentSales = (
    transactions: TransactionResponse[]
): RecentTransaction[] => {
    return transactions.slice(0, 5).map((tx) => ({
        name: tx.userName || "Khách hàng",
        email: tx.userEmail || "",
        amount: `+${formatVND(tx.amount || 0)}`,
    }));
};

// ============================================================================
// GRANULARITY HELPER
// ============================================================================

/**
 * Convert ViewMode to API granularity
 */
export const viewModeToGranularity = (mode: ViewMode): Granularity => {
    return mode === "daily" ? "DAY" : "MONTH";
};
