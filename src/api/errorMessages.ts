/**
 * Vietnamese error messages mapped from backend error codes
 */
export const ERROR_MESSAGES: Record<number, string> = {
  // Success
  1000: "Thành công",

  // User errors (1001-1007)
  1001: "Người dùng đã tồn tại",
  1002: "Người dùng không tồn tại",
  1003: "Vai trò không tồn tại",
  1004: "Tên đăng nhập không hợp lệ - tối thiểu 5 ký tự",
  1005: "Mật khẩu không hợp lệ - tối thiểu 8 ký tự",
  1006: "Bạn không có quyền thực hiện thao tác này",
  1007: "Phiên đăng nhập đã hết hạn",

  // Tour errors (1008)
  1008: "Tour không tồn tại",

  // Promotion errors (1009-1010, 1015-1017, 1019)
  1009: "Mã khuyến mãi đã tồn tại",
  1010: "Mã khuyến mãi không tồn tại",
  1015: "Mã khuyến mãi đã hết hạn hoặc chưa bắt đầu",
  1016: "Mã khuyến mãi đã hết lượt sử dụng",
  1017: "Mã khuyến mãi không hoạt động",
  1019: "Mã khuyến mãi không khả dụng",

  // Validation errors (1011-1014)
  1011: "Ngày kết thúc phải sau ngày bắt đầu",
  1012: "ID nhân viên phụ trách là bắt buộc",
  1013: "Tên đăng nhập phải có tối thiểu 3 ký tự",
  1014: "Hình ảnh không tồn tại",

  // Availability errors (1018)
  1018: "Tour không còn chỗ trống",

  // Concurrent update (1020)
  1020: "Dữ liệu đã được thay đổi bởi người dùng khác. Vui lòng thử lại.",

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
