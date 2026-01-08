import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatusConfig {
  label: string;
  className: string;
}

interface StatusBadgeProps<T extends string> {
  /** Current status value */
  status: T;
  /** Configuration map for status to label/className */
  config: Record<T, StatusConfig>;
  /** Optional variant for the badge */
  variant?: "default" | "secondary" | "destructive" | "outline";
}

/**
 * Reusable status badge component that renders a badge based on status configuration.
 * Reduces repetition of status badge rendering logic across admin pages.
 */
export function StatusBadge<T extends string>({
  status,
  config,
  variant = "outline",
}: StatusBadgeProps<T>) {
  const statusConfig = config[status];

  if (!statusConfig) {
    return (
      <Badge variant={variant} className="whitespace-nowrap">
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant={variant}
      className={cn("whitespace-nowrap", statusConfig.className)}
    >
      {statusConfig.label}
    </Badge>
  );
}

// ============== Pre-configured Status Configs ==============

/** Booking status configuration */
export const bookingStatusConfig: Record<
  "pending" | "confirmed" | "cancelled" | "completed",
  StatusConfig
> = {
  pending: {
    label: "Chờ xác nhận",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
};

/** Promotion status configuration */
export const promotionStatusConfig: Record<
  "active" | "expired" | "disabled" | "scheduled",
  StatusConfig
> = {
  active: {
    label: "Đang hoạt động",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  scheduled: {
    label: "Chưa bắt đầu",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  expired: {
    label: "Hết hạn",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  disabled: {
    label: "Vô hiệu hóa",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

/** Review status configuration */
export const reviewStatusConfig: Record<
  "pending" | "approved" | "hidden",
  StatusConfig
> = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  hidden: {
    label: "Đã ẩn",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

/** Contact status configuration */
export const contactStatusConfig: Record<"new" | "read", StatusConfig> = {
  new: {
    label: "Mới",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  read: {
    label: "Đã đọc",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

/** Tour status configuration */
export const tourStatusConfig: Record<"Hoạt động" | "Đã đóng", StatusConfig> = {
  "Hoạt động": {
    label: "Hoạt động",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  "Đã đóng": {
    label: "Đã đóng",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

/** User status configuration */
export const userStatusConfig: Record<"active" | "locked", StatusConfig> = {
  active: {
    label: "Hoạt động",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  locked: {
    label: "Đã khóa",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};
