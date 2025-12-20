import { Users, DollarSign, ShoppingBag, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Mock revenue data for the last 6 months (Jan to June)
const revenueData = [
  { month: "Tháng 1", revenue: 180000000 },
  { month: "Tháng 2", revenue: 220000000 },
  { month: "Tháng 3", revenue: 195000000 },
  { month: "Tháng 4", revenue: 280000000 },
  { month: "Tháng 5", revenue: 310000000 },
  { month: "Tháng 6", revenue: 250000000 },
];

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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
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
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">
            Tổng quan
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
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
