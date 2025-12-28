import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useReview } from "@/context/ReviewContext";
import { useAuth } from "@/context/AuthContext";
import { Booking } from "@/context/BookingContext";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
    rating: z.number().min(1, "Vui lòng chọn đánh giá").max(5),
    comment: z
        .string()
        .min(10, "Nhận xét phải có ít nhất 10 ký tự")
        .max(500, "Nhận xét không được vượt quá 500 ký tự"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking;
}

export function ReviewModal({ isOpen, onClose, booking }: ReviewModalProps) {
    const { user } = useAuth();
    const { addReview } = useReview();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
        },
    });

    const currentRating = watch("rating");

    const onSubmit = async (data: ReviewFormData) => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            await addReview({
                bookingId: booking.id,
                tourId: booking.tourId,
                tourTitle: booking.tourTitle,
                userId: user.userId,
                userName: user.fullName,
                rating: data.rating,
                comment: data.comment,
            });

            toast.success("Đánh giá của bạn đã được gửi và đang chờ phê duyệt!");
            reset();
            onClose();
        } catch {
            toast.error("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const ratingLabels = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Viết đánh giá"
            className="max-w-md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Tour Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">{booking.tourTitle}</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {format(new Date(booking.selectedDate), "dd/MM/yyyy", {
                                    locale: vi,
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>Đã hoàn thành</span>
                        </div>
                    </div>
                </div>

                {/* Rating Stars */}
                <div className="space-y-2">
                    <span className="text-sm font-medium leading-none">Đánh giá của bạn *</span>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setValue("rating", star, { shouldValidate: true })}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                    aria-label={`Đánh giá ${star} sao - ${ratingLabels[star]}`}
                                >
                                    <Star
                                        className={cn(
                                            "h-8 w-8 transition-colors",
                                            star <= (hoverRating || currentRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        {(hoverRating || currentRating) > 0 && (
                            <span className="text-sm font-medium text-gray-600">
                                {ratingLabels[hoverRating || currentRating]}
                            </span>
                        )}
                    </div>
                    {errors.rating && (
                        <p className="text-sm text-red-500">{errors.rating.message}</p>
                    )}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                    <Label htmlFor="review-comment">Nhận xét của bạn *</Label>
                    <Textarea
                        id="review-comment"
                        placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi..."
                        rows={4}
                        {...register("comment")}
                        className={cn(errors.comment && "border-red-500")}
                    />
                    <div className="flex justify-between text-sm">
                        {errors.comment ? (
                            <p className="text-red-500">{errors.comment.message}</p>
                        ) : (
                            <p className="text-gray-500">Tối thiểu 10 ký tự</p>
                        )}
                        <span className="text-gray-400">
                            {watch("comment")?.length || 0}/500
                        </span>
                    </div>
                </div>

                {/* Notice */}
                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    💡 Đánh giá của bạn sẽ được xem xét trước khi hiển thị công khai.
                    Sau khi gửi, bạn sẽ không thể chỉnh sửa hoặc xóa đánh giá này.
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            "Gửi đánh giá"
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
