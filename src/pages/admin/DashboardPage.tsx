import { Users, DollarSign, ShoppingBag, Activity } from "lucide-react";

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
          <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
            Biểu đồ doanh thu
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
