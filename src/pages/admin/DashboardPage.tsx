import { useState, useEffect } from "react";
import { Users, DollarSign, ShoppingBag, Activity, LayoutDashboard, Download, FileSpreadsheet, TrendingUp, ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
import { useExcelExport } from "@/hooks/useExcelExport";

// ============================================================================
// TYPES - Structured to mirror future API responses
// ============================================================================

interface RevenueData {
  month: string;
  revenue: number;
}

interface TopSellingTour {
  tourName: string;
  bookings: number;
  totalRevenue: number;
}

interface CustomerExport {
  name: string;
  email: string;
  phone: string;
  bookingCount: number;
}

// ============================================================================
// MOCK DATA - Replace with API calls later
// ============================================================================

// Revenue data for the last 6 months (Jan to June)
const revenueData: RevenueData[] = [
  { month: "Tháng 1", revenue: 180000000 },
  { month: "Tháng 2", revenue: 220000000 },
  { month: "Tháng 3", revenue: 195000000 },
  { month: "Tháng 4", revenue: 280000000 },
  { month: "Tháng 5", revenue: 310000000 },
  { month: "Tháng 6", revenue: 250000000 },
];

// Top selling tours data
const topSellingToursData: TopSellingTour[] = [
  { tourName: "Phú Quốc 4N3Đ", bookings: 156, totalRevenue: 780000000 },
  { tourName: "Đà Nẵng - Hội An 3N2Đ", bookings: 134, totalRevenue: 402000000 },
  { tourName: "Sapa Mùa Hoa 2N1Đ", bookings: 98, totalRevenue: 196000000 },
  { tourName: "Nha Trang Biển Xanh 3N2Đ", bookings: 87, totalRevenue: 261000000 },
  { tourName: "Hạ Long Bay Cruise 2N1Đ", bookings: 76, totalRevenue: 228000000 },
];

// Customer list data
const customerListData: CustomerExport[] = [
  { name: "Nguyễn Văn An", email: "nguyen.an@email.com", phone: "0901234567", bookingCount: 5 },
  { name: "Trần Thị Bình", email: "tran.binh@email.com", phone: "0912345678", bookingCount: 3 },
  { name: "Lê Hoàng Cường", email: "le.cuong@email.com", phone: "0923456789", bookingCount: 7 },
  { name: "Phạm Minh Duy", email: "pham.duy@email.com", phone: "0934567890", bookingCount: 2 },
  { name: "Hoàng Thị Em", email: "hoang.em@email.com", phone: "0945678901", bookingCount: 4 },
  { name: "Võ Văn Phong", email: "vo.phong@email.com", phone: "0956789012", bookingCount: 1 },
  { name: "Đặng Thị Giang", email: "dang.giang@email.com", phone: "0967890123", bookingCount: 6 },
  { name: "Bùi Văn Hải", email: "bui.hai@email.com", phone: "0978901234", bookingCount: 2 },
];

// ============================================================================
// HELPERS
// ============================================================================

// Custom tooltip formatter for VND currency
const formatVND = (value: number) => {
  return value.toLocaleString("vi-VN") + "đ";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-primary font-semibold">
          {formatVND(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { exportToExcel, isExporting } = useExcelExport();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Export handlers
  const handleExportRevenue = () => {
    exportToExcel(revenueData, "doanh_thu_theo_thang", {
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
      <div className="flex items-center justify-between">
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
            <Button variant="outline" disabled={isExporting}>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-w-0">
          <h3 className="font-semibold leading-none tracking-tight mb-4">
            Tổng quan
          </h3>
          <div className="w-full min-w-0">
            {mounted && (
              <ResponsiveContainer width="100%" height={300} debounce={100}>
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
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
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
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
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">
            Giao dịch gần đây
          </h3>
          <div className="space-y-8">
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {sale.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{sale.email}</p>
                </div>
                <div className="ml-auto font-medium">{sale.amount}</div>
              </div>
            ))}
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
