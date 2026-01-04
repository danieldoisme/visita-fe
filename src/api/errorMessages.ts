/**
 * Vietnamese error messages mapped from backend error codes
 */
export const ERROR_MESSAGES: Record<number, string> = {
  // Success
  1000: "Thành công",

  // Authentication errors (1001-1010)
  1001: "Người dùng không tồn tại",
  1002: "Người dùng đã tồn tại",
  1003: "Mật khẩu không đúng",
  1004: "Token không hợp lệ",
  1005: "Token đã hết hạn",
  1006: "Không có quyền truy cập",
  1007: "Phiên đăng nhập đã hết hạn",

  // Validation errors (1011-1020)
  1011: "Dữ liệu không hợp lệ",
  1012: "Thiếu thông tin bắt buộc",

  // Resource errors (1021-1030)
  1021: "Tour không tồn tại",
  1022: "Đặt chỗ không tồn tại",
  1023: "Mã khuyến mãi không tồn tại",

  // Business logic errors (1031-1040)
  1031: "Tour đã hết chỗ",
  1032: "Mã khuyến mãi đã hết hạn",
  1033: "Mã khuyến mãi đã được sử dụng hết",

  // System errors
  9999: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
};

/**
 * Get Vietnamese error message from backend error code
 */
export const getErrorMessage = (code: number, fallback?: string): string => {
  return ERROR_MESSAGES[code] || fallback || ERROR_MESSAGES[9999];
};

/**
 * Network/connection error messages
 */
export const NETWORK_ERRORS = {
  NO_CONNECTION: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
  TIMEOUT: "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.",
  SERVER_ERROR: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
};
