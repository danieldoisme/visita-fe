import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Booking } from "@/context/BookingContext";
import { editBookingSchema, EditBookingFormData } from "@/lib/validation";
import { formatCurrency } from "@/lib/formatters";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CalendarDays, Users, Plus, Minus, Loader2 } from "lucide-react";

interface EditBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    onSave: (id: number, data: Partial<Booking>) => Promise<void>;
}

const STATUS_OPTIONS = [
    { value: "pending", label: "Đang chờ" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "completed", label: "Hoàn thành" },
] as const;

export function EditBookingModal({ isOpen, onClose, booking, onSave }: EditBookingModalProps) {
    const form = useForm<EditBookingFormData>({
        resolver: zodResolver(editBookingSchema),
        defaultValues: {
            selectedDate: new Date(),
            adults: 1,
            children: 0,
            fullName: "",
            email: "",
            phone: "",
            status: "pending",
        },
    });

    const { watch, setValue, formState: { isSubmitting } } = form;
    const adults = watch("adults");
    const children = watch("children");

    // Calculate total price based on tour price
    const totalPrice = useMemo(() => {
        if (!booking) return 0;
        return booking.tourPrice * adults + booking.tourPrice * 0.5 * children;
    }, [booking, adults, children]);

    // Reset form when booking changes or modal opens
    useEffect(() => {
        if (isOpen && booking) {
            form.reset({
                selectedDate: new Date(booking.selectedDate),
                adults: booking.adults,
                children: booking.children,
                fullName: booking.contactInfo.fullName,
                email: booking.contactInfo.email,
                phone: booking.contactInfo.phone,
                status: booking.status,
            });
        }
    }, [isOpen, booking, form]);

    const onSubmit = async (data: EditBookingFormData) => {
        if (!booking) return;

        await onSave(booking.id, {
            selectedDate: data.selectedDate,
            adults: data.adults,
            children: data.children,
            contactInfo: {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
            },
            status: data.status,
            totalPrice,
        });
        onClose();
    };

    if (!booking) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa Booking" className="max-w-2xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Tour Info Summary */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
                        <h3 className="font-semibold text-lg">{booking.tourTitle}</h3>
                        <p className="text-sm text-gray-600">
                            Giá gốc: {formatCurrency(booking.tourPrice)} / người
                        </p>
                    </div>

                    {/* Date Selection */}
                    <FormField
                        control={form.control}
                        name="selectedDate"
                        render={({ field }) => (
                            <FormItem>
                                <p className="flex items-center gap-2 text-sm font-medium mb-2">
                                    <CalendarDays className="w-4 h-4" />
                                    Ngày khởi hành
                                </p>
                                <div className="border rounded-lg p-2 flex justify-center">
                                    <FormControl>
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            className="rounded-md"
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Guest Selection */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium mb-3">
                            <Users className="w-4 h-4" />
                            Số lượng khách
                        </p>
                        <div className="space-y-3">
                            {/* Adults */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div>
                                    <p className="font-medium" id="adults-label">Người lớn</p>
                                    <p className="text-sm text-gray-500">Từ 12 tuổi trở lên</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        id="adults-decrease"
                                        name="adults-decrease"
                                        type="button"
                                        aria-label="Giảm số người lớn"
                                        onClick={() => setValue("adults", Math.max(1, adults - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                        disabled={adults <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-semibold" aria-labelledby="adults-label">{adults}</span>
                                    <button
                                        id="adults-increase"
                                        name="adults-increase"
                                        type="button"
                                        aria-label="Tăng số người lớn"
                                        onClick={() => setValue("adults", Math.min(10, adults + 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                        disabled={adults >= 10}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {/* Children */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div>
                                    <p className="font-medium" id="children-label">Trẻ em</p>
                                    <p className="text-sm text-gray-500">Từ 2-11 tuổi (giảm 50%)</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        id="children-decrease"
                                        name="children-decrease"
                                        type="button"
                                        aria-label="Giảm số trẻ em"
                                        onClick={() => setValue("children", Math.max(0, children - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                        disabled={children <= 0}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-semibold" aria-labelledby="children-label">{children}</span>
                                    <button
                                        id="children-increase"
                                        name="children-increase"
                                        type="button"
                                        aria-label="Tăng số trẻ em"
                                        onClick={() => setValue("children", Math.min(10, children + 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                        disabled={children >= 10}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium">Thông tin liên hệ</p>
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="edit-fullName">Họ và tên</FormLabel>
                                    <FormControl>
                                        <Input id="edit-fullName" autoComplete="name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="edit-email">Email</FormLabel>
                                    <FormControl>
                                        <Input id="edit-email" type="email" autoComplete="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="edit-phone">Số điện thoại</FormLabel>
                                    <FormControl>
                                        <Input id="edit-phone" type="tel" autoComplete="tel" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Status Selection */}
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="edit-status">Trạng thái</FormLabel>
                                <Select name="status" onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger id="edit-status">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Price Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>{adults} người lớn × {formatCurrency(booking.tourPrice)}</span>
                            <span>{formatCurrency(booking.tourPrice * adults)}</span>
                        </div>
                        {children > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>{children} trẻ em × {formatCurrency(booking.tourPrice * 0.5)}</span>
                                <span>{formatCurrency(booking.tourPrice * 0.5 * children)}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Tổng cộng</span>
                            <span className="text-primary text-lg">{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu thay đổi"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
}
