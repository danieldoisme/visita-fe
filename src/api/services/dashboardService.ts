import {
    getStats,
    getChartData,
    getUserChartData,
    getBookingChartData,
    getRecentTransactions,
} from "@/api/generated/sdk.gen";
import { apiClient } from "@/api/apiClient";
import {
    type DashboardStats,
    type RevenueDataPoint,
    type UsersDataPoint,
    type BookingsDataPoint,
    type RecentTransaction,
    type Granularity,
    mapStatsResponse,
    mapChartDataToRevenue,
    mapChartDataToUsers,
    mapChartDataToBookings,
    mapTransactionsToRecentSales,
} from "@/api/mappers/dashboardMapper";

// ============================================================================
// STATS
// ============================================================================

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const response = await getStats();
    if (response.data?.result) {
        return mapStatsResponse(response.data.result);
    }
    throw new Error("Failed to fetch dashboard stats");
};

// ============================================================================
// CHART DATA
// ============================================================================

interface ChartFetchParams {
    startDate: string;
    endDate: string;
    granularity: Granularity;
}

export const fetchRevenueChart = async (
    params: ChartFetchParams
): Promise<RevenueDataPoint[]> => {
    const response = await getChartData({
        query: {
            startDate: params.startDate,
            endDate: params.endDate,
            granularity: params.granularity,
        },
    });
    if (response.data?.result) {
        return mapChartDataToRevenue(response.data.result, params.granularity);
    }
    return [];
};

export const fetchUsersChart = async (
    params: ChartFetchParams
): Promise<UsersDataPoint[]> => {
    const response = await getUserChartData({
        query: {
            startDate: params.startDate,
            endDate: params.endDate,
            granularity: params.granularity,
        },
    });
    if (response.data?.result) {
        return mapChartDataToUsers(response.data.result, params.granularity);
    }
    return [];
};

export const fetchBookingsChart = async (
    params: ChartFetchParams
): Promise<BookingsDataPoint[]> => {
    const response = await getBookingChartData({
        query: {
            startDate: params.startDate,
            endDate: params.endDate,
            granularity: params.granularity,
        },
    });
    if (response.data?.result) {
        return mapChartDataToBookings(response.data.result, params.granularity);
    }
    return [];
};

// ============================================================================
// TRANSACTIONS
// ============================================================================

export const fetchRecentTransactions = async (): Promise<RecentTransaction[]> => {
    const response = await getRecentTransactions();
    if (response.data?.result) {
        return mapTransactionsToRecentSales(response.data.result);
    }
    return [];
};

// ============================================================================
// EXPORT
// ============================================================================

export const downloadDashboardExport = async (): Promise<void> => {
    // Use apiClient directly with responseType: 'blob' for file downloads
    const response = await apiClient.get("/admins/dashboard/export", {
        responseType: "blob",
    });

    const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard_export_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
