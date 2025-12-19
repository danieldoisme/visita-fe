import { useState } from "react";
import { useTour, Tour } from "@/context/TourContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export default function ToursManagementPage() {
  const { tours, loading, addTour, updateTour, deleteTour } = useTour();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState<Partial<Tour>>({});

  const handleOpenModal = (tour?: Tour) => {
    if (tour) {
      setEditingTour(tour);
      setFormData(tour);
    } else {
      setEditingTour(null);
      setFormData({
        title: "",
        location: "",
        price: 0,
        duration: "",
        image: "",
        category: "",
        status: "Nháp",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTour(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTour) {
      await updateTour(editingTour.id, formData);
    } else {
      await addTour(formData as Tour);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tour này không?")) {
      await deleteTour(id);
    }
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Danh sách Tour</h2>
          <p className="text-muted-foreground">
            Quản lý các gói tour và danh sách hiển thị.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Thêm Tour mới
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            name="search"
            placeholder="Tìm kiếm tour..."
            className="pl-8"
            aria-label="Tìm kiếm tour"
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
            {tours.map((tour) => (
              <TableRow key={tour.id}>
                <TableCell className="font-medium">{tour.title}</TableCell>
                <TableCell>{tour.location}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(tour.price)}
                </TableCell>
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
                <TableCell>{tour.bookings || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(tour)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tour.id)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTour ? "Chỉnh sửa Tour" : "Thêm Tour mới"}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Tên Tour
              </label>
              <Input
                id="title"
                name="title"
                required
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nhập tên tour"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Địa điểm
              </label>
              <Input
                id="location"
                name="location"
                required
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Nhập địa điểm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Giá (VNĐ)
              </label>
              <Input
                id="price"
                name="price"
                required
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                placeholder="Nhập giá"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Thời lượng
              </label>
              <Input
                id="duration"
                name="duration"
                required
                value={formData.duration || ""}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="Ví dụ: 3 Ngày 2 Đêm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Danh mục
              </label>
              <Input
                id="category"
                name="category"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Ví dụ: Biển, Núi, Văn hóa"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status || "Nháp"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Nháp">Nháp</option>
                <option value="Đã đóng">Đã đóng</option>
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Hình ảnh (URL)
              </label>
              <Input
                id="image"
                name="image"
                value={formData.image || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Mô tả
              </label>
              <RichTextEditor
                value={formData.description || ""}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Mô tả chi tiết về tour..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">
              {editingTour ? "Lưu thay đổi" : "Tạo Tour"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
