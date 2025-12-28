import { useState, useEffect, useMemo } from "react";
import { Users, DollarSign, ShoppingBag, Activity, LayoutDashboard, Download, FileSpreadsheet, TrendingUp, ChevronDown, UserPlus, CalendarCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExcelExport } from "@/hooks/useExcelExport";
import {
  type ViewMode,
  type DayRange,
  monthlyRevenueData,
  dailyRevenueData,
  monthlyNewUsersData,
  dailyNewUsersData,
  monthlyBookedToursData,
  dailyBookedToursData,
  filterDailyData,
  topSellingToursData,
  customerListData,
} from "@/data/dashboardMockData";

// ============================================================================
// HELPERS
// ============================================================================

const formatVND = (value: number) => {
  return value.toLocaleString("vi-VN") + "đ";
};

const CustomTooltip = ({ active, payload, label, valueFormatter, valueSuffix = "" }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = valueFormatter ? valueFormatter(value) : value.toLocaleString("vi-VN");
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-primary font-semibold">
          {formattedValue}{valueSuffix}
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================================
// CHART CONTROLS COMPONENT
// ============================================================================

interface ChartControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  dayRange: DayRange;
  onDayRangeChange: (range: DayRange) => void;
}

function ChartControls({ viewMode, onViewModeChange, dayRange, onDayRangeChange }: ChartControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* View Mode Toggle */}
      <div className="flex rounded-lg border bg-muted p-0.5">
        <button
          onClick={() => onViewModeChange('daily')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'daily'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Ngày
        </button>
        <button
          onClick={() => onViewModeChange('monthly')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'monthly'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Tháng
        </button>
      </div>

      {/* Day Range Selector - only visible in daily mode */}
      {viewMode === 'daily' && (
        <Select value={String(dayRange)} onValueChange={(v) => onDayRangeChange(Number(v) as DayRange)}>
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 ngày</SelectItem>
            <SelectItem value="14">14 ngày</SelectItem>
            <SelectItem value="30">30 ngày</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { exportToExcel, isExporting } = useExcelExport();

  // Revenue chart state
  const [revenueViewMode, setRevenueViewMode] = useState<ViewMode>('monthly');
  const [revenueDayRange, setRevenueDayRange] = useState<DayRange>(7);

  // New Users chart state
  const [usersViewMode, setUsersViewMode] = useState<ViewMode>('monthly');
  const [usersDayRange, setUsersDayRange] = useState<DayRange>(7);

  // Booked Tours chart state
  const [toursViewMode, setToursViewMode] = useState<ViewMode>('monthly');
  const [toursDayRange, setToursDayRange] = useState<DayRange>(7);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Computed chart data
  const revenueChartData = useMemo(() => {
    if (revenueViewMode === 'monthly') return monthlyRevenueData;
    return filterDailyData(dailyRevenueData, revenueDayRange);
  }, [revenueViewMode, revenueDayRange]);

  const usersChartData = useMemo(() => {
    if (usersViewMode === 'monthly') return monthlyNewUsersData;
    return filterDailyData(dailyNewUsersData, usersDayRange);
  }, [usersViewMode, usersDayRange]);

  const toursChartData = useMemo(() => {
    if (toursViewMode === 'monthly') return monthlyBookedToursData;
    return filterDailyData(dailyBookedToursData, toursDayRange);
  }, [toursViewMode, toursDayRange]);

  // Export handlers
  const handleExportRevenue = () => {
    exportToExcel(monthlyRevenueData.map(d => ({ month: d.label, revenue: d.revenue })), "doanh_thu_theo_thang", {
      columns: [
        { header: "Tháng", key: "month" },
        { header: "Doanh thu (VNĐ)", key: "revenue", formatter: (v) => formatVND(v as number) },
      ],
      sheetName: "Doanh Thu",
    });
  };

  const handleExportTopTours = () => {
    exportToExcel(topSellingToursData, "tour_ban_chay", {
      columns: [
        { header: "Tên Tour", key: "tourName" },
        { header: "Số lượt đặt", key: "bookings" },
        { header: "Tổng doanh thu (VNĐ)", key: "totalRevenue", formatter: (v) => formatVND(v as number) },
      ],
      sheetName: "Tour Bán Chạy",
    });
  };

  const handleExportCustomers = () => {
    exportToExcel(customerListData, "danh_sach_khach_hang", {
      columns: [
        { header: "Họ và Tên", key: "name" },
        { header: "Email", key: "email" },
        { header: "Số điện thoại", key: "phone" },
        { header: "Số lần đặt tour", key: "bookingCount" },
      ],
      sheetName: "Khách Hàng",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header with Export Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Tổng quan hệ thống quản trị
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Xuất Dữ Liệu
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Báo Cáo & Thống Kê</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportRevenue}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Doanh Thu Theo Tháng
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportTopTours}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Tour Bán Chạy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCustomers}>
              <Users className="mr-2 h-4 w-4" />
              Danh Sách Khách Hàng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Tổng doanh thu"
          value="1.250.000.000đ"
          icon={DollarSign}
          description="+20.1% so với tháng trước"
        />
        <Card
          title="Đăng ký mới"
          value="+2350"
          icon={Users}
          description="+180.1% so với tháng trước"
        />
        <Card
          title="Doanh số"
          value="+12,234"
          icon={ShoppingBag}
          description="+19% so với tháng trước"
        />
        <Card
          title="Đang hoạt động"
          value="+573"
          icon={Activity}
          description="+201 so với giờ trước"
        />
      </div>

      {/* Revenue Chart + Recent Transactions */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500 shrink-0" />
              Doanh thu
            </h3>
            <ChartControls
              viewMode={revenueViewMode}
              onViewModeChange={setRevenueViewMode}
              dayRange={revenueDayRange}
              onDayRangeChange={setRevenueDayRange}
            />
          </div>
          <div className="w-full min-w-0">
            {mounted && (
              <ResponsiveContainer width="100%" height={300} debounce={100}>
                <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1000000)}M`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip valueFormatter={formatVND} />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="lg:col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
          <h3 className="font-semibold leading-none tracking-tight mb-4">
            Giao dịch gần đây
          </h3>
          <div className="space-y-6">
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {sale.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate hidden sm:block">{sale.email}</p>
                </div>
                <div className="font-medium text-sm shrink-0">{sale.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Users + Booked Tours Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* New Users Line Chart */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-500 shrink-0" />
              Người dùng mới
            </h3>
            <ChartControls
              viewMode={usersViewMode}
              onViewModeChange={setUsersViewMode}
              dayRange={usersDayRange}
              onDayRangeChange={setUsersDayRange}
            />
          </div>
          <div className="w-full min-w-0">
            {mounted && (
              <ResponsiveContainer width="100%" height={250} debounce={100}>
                <LineChart data={usersChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip valueSuffix=" người" />} cursor={{ strokeDasharray: '3 3' }} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 0, r: 3 }}
                    activeDot={{ fill: "#10B981", strokeWidth: 0, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Booked Tours Bar Chart */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-violet-500 shrink-0" />
              Tour đã đặt
            </h3>
            <ChartControls
              viewMode={toursViewMode}
              onViewModeChange={setToursViewMode}
              dayRange={toursDayRange}
              onDayRangeChange={setToursDayRange}
            />
          </div>
          <div className="w-full min-w-0">
            {mounted && (
              <ResponsiveContainer width="100%" height={250} debounce={100}>
                <BarChart data={toursChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip valueSuffix=" đặt tour" />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                  <Bar
                    dataKey="bookings"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const recentSales = [
  {
    name: "Nguyễn Văn An",
    email: "nguyen.an@email.com",
    amount: "+50.000.000đ",
  },
  {
    name: "Trần Thị Bình",
    email: "tran.binh@email.com",
    amount: "+1.000.000đ",
  },
  {
    name: "Lê Hoàng Cường",
    email: "le.cuong@email.com",
    amount: "+7.500.000đ",
  },
  {
    name: "Phạm Minh Duy",
    email: "pham.duy@email.com",
    amount: "+2.500.000đ",
  },
  {
    name: "Hoàng Thị Em",
    email: "hoang.em@email.com",
    amount: "+1.000.000đ",
  },
];

function Card({ title, value, icon: Icon, description }: any) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
