// ============================================================================
// DASHBOARD CHART MOCK DATA
// Centralized mock data for dashboard charts - replace with API calls later
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type ViewMode = 'daily' | 'monthly';
export type DayRange = 7 | 14 | 30;

export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

export interface NewUsersDataPoint {
  label: string;
  users: number;
}

export interface BookedToursDataPoint {
  label: string;
  bookings: number;
}

// ============================================================================
// REVENUE DATA
// ============================================================================

export const monthlyRevenueData: RevenueDataPoint[] = [
  { label: "Tháng 1", revenue: 180000000 },
  { label: "Tháng 2", revenue: 220000000 },
  { label: "Tháng 3", revenue: 195000000 },
  { label: "Tháng 4", revenue: 280000000 },
  { label: "Tháng 5", revenue: 310000000 },
  { label: "Tháng 6", revenue: 250000000 },
  { label: "Tháng 7", revenue: 290000000 },
  { label: "Tháng 8", revenue: 340000000 },
  { label: "Tháng 9", revenue: 275000000 },
  { label: "Tháng 10", revenue: 320000000 },
  { label: "Tháng 11", revenue: 380000000 },
  { label: "Tháng 12", revenue: 420000000 },
];

// Generate 30 days of daily revenue data
const generateDailyRevenueData = (): RevenueDataPoint[] => {
  const data: RevenueDataPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const day = date.getDate();
    const month = date.getMonth() + 1;

    // Generate realistic revenue between 5M - 20M VND
    const baseRevenue = 8000000 + Math.random() * 12000000;
    // Weekend boost
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const revenue = Math.round(baseRevenue * (isWeekend ? 1.4 : 1));

    data.push({
      label: `${day}/${month}`,
      revenue,
    });
  }
  return data;
};

export const dailyRevenueData: RevenueDataPoint[] = generateDailyRevenueData();

// ============================================================================
// NEW USERS DATA
// ============================================================================

export const monthlyNewUsersData: NewUsersDataPoint[] = [
  { label: "Tháng 1", users: 120 },
  { label: "Tháng 2", users: 145 },
  { label: "Tháng 3", users: 180 },
  { label: "Tháng 4", users: 210 },
  { label: "Tháng 5", users: 195 },
  { label: "Tháng 6", users: 240 },
  { label: "Tháng 7", users: 280 },
  { label: "Tháng 8", users: 320 },
  { label: "Tháng 9", users: 290 },
  { label: "Tháng 10", users: 350 },
  { label: "Tháng 11", users: 410 },
  { label: "Tháng 12", users: 480 },
];

// Generate 30 days of daily new users data
const generateDailyNewUsersData = (): NewUsersDataPoint[] => {
  const data: NewUsersDataPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const day = date.getDate();
    const month = date.getMonth() + 1;

    // Generate realistic users between 5 - 25 per day
    const users = Math.round(8 + Math.random() * 17);

    data.push({
      label: `${day}/${month}`,
      users,
    });
  }
  return data;
};

export const dailyNewUsersData: NewUsersDataPoint[] = generateDailyNewUsersData();

// ============================================================================
// BOOKED TOURS DATA
// ============================================================================

export const monthlyBookedToursData: BookedToursDataPoint[] = [
  { label: "Tháng 1", bookings: 85 },
  { label: "Tháng 2", bookings: 102 },
  { label: "Tháng 3", bookings: 95 },
  { label: "Tháng 4", bookings: 140 },
  { label: "Tháng 5", bookings: 168 },
  { label: "Tháng 6", bookings: 155 },
  { label: "Tháng 7", bookings: 180 },
  { label: "Tháng 8", bookings: 210 },
  { label: "Tháng 9", bookings: 175 },
  { label: "Tháng 10", bookings: 195 },
  { label: "Tháng 11", bookings: 230 },
  { label: "Tháng 12", bookings: 280 },
];

// Generate 30 days of daily booked tours data
const generateDailyBookedToursData = (): BookedToursDataPoint[] => {
  const data: BookedToursDataPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const day = date.getDate();
    const month = date.getMonth() + 1;

    // Generate realistic bookings between 3 - 15 per day
    const baseBookings = 5 + Math.random() * 10;
    // Weekend boost
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const bookings = Math.round(baseBookings * (isWeekend ? 1.3 : 1));

    data.push({
      label: `${day}/${month}`,
      bookings,
    });
  }
  return data;
};

export const dailyBookedToursData: BookedToursDataPoint[] = generateDailyBookedToursData();

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Filter daily data to return only the last N days
 */
export function filterDailyData<T>(data: T[], days: DayRange): T[] {
  return data.slice(-days);
}

// ============================================================================
// EXISTING DATA (moved from DashboardPage for export functionality)
// ============================================================================

export interface TopSellingTour {
  tourName: string;
  bookings: number;
  totalRevenue: number;
}

export interface CustomerExport {
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
}

export const topSellingToursData: TopSellingTour[] = [
  { tourName: "Phú Quốc 4N3Đ", bookings: 156, totalRevenue: 780000000 },
  { tourName: "Đà Nẵng - Hội An 3N2Đ", bookings: 134, totalRevenue: 402000000 },
  { tourName: "Sapa Mùa Hoa 2N1Đ", bookings: 98, totalRevenue: 196000000 },
  { tourName: "Nha Trang Biển Xanh 3N2Đ", bookings: 87, totalRevenue: 261000000 },
  { tourName: "Hạ Long Bay Cruise 2N1Đ", bookings: 76, totalRevenue: 228000000 },
];

export const customerListData: CustomerExport[] = [
  { name: "Nguyễn Văn An", email: "nguyen.an@email.com", phone: "0901234567", bookingCount: 5 },
  { name: "Trần Thị Bình", email: "tran.binh@email.com", phone: "0912345678", bookingCount: 3 },
  { name: "Lê Hoàng Cường", email: "le.cuong@email.com", phone: "0923456789", bookingCount: 7 },
  { name: "Phạm Minh Duy", email: "pham.duy@email.com", phone: "0934567890", bookingCount: 2 },
  { name: "Hoàng Thị Em", email: "hoang.em@email.com", phone: "0945678901", bookingCount: 4 },
  { name: "Võ Văn Phong", email: "vo.phong@email.com", phone: "0956789012", bookingCount: 1 },
  { name: "Đặng Thị Giang", email: "dang.giang@email.com", phone: "0967890123", bookingCount: 6 },
  { name: "Bùi Văn Hải", email: "bui.hai@email.com", phone: "0978901234", bookingCount: 2 },
];
