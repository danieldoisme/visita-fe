import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

// Mock Data
const TOURS = [
  {
    id: 1,
    title: "Khám phá Sơn Đoòng",
    location: "Quảng Bình",
    price: "65.000.000đ",
    status: "Hoạt động",
    bookings: 24,
  },
  {
    id: 2,
    title: "Vịnh Hạ Long Du thuyền",
    location: "Quảng Ninh",
    price: "3.500.000đ",
    status: "Hoạt động",
    bookings: 18,
  },
  {
    id: 3,
    title: "Phố cổ Hội An",
    location: "Quảng Nam",
    price: "1.200.000đ",
    status: "Nháp",
    bookings: 0,
  },
  {
    id: 4,
    title: "Đà Lạt Mộng Mơ",
    location: "Lâm Đồng",
    price: "2.500.000đ",
    status: "Hoạt động",
    bookings: 45,
  },
  {
    id: 5,
    title: "Sapa Trekking",
    location: "Lào Cai",
    price: "1.800.000đ",
    status: "Ngưng hoạt động",
    bookings: 12,
  },
];

export default function ToursManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Danh sách Tour</h2>
          <p className="text-muted-foreground">
            Quản lý các gói tour và danh sách hiển thị.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm Tour mới
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Tìm kiếm tour..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Tour</TableHead>
              <TableHead>Địa điểm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Đã đặt</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TOURS.map((tour) => (
              <TableRow key={tour.id}>
                <TableCell className="font-medium">{tour.title}</TableCell>
                <TableCell>{tour.location}</TableCell>
                <TableCell>{tour.price}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tour.status === "Hoạt động"
                        ? "default"
                        : tour.status === "Nháp"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {tour.status}
                  </Badge>
                </TableCell>
                <TableCell>{tour.bookings}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
