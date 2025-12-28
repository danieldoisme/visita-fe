/**
 * Mock AI Bot Service
 * Provides FAQ-based auto-replies and escalation detection for the chat system.
 */

export interface BotResponse {
    success: boolean;
    message: string;
    confidence: number;
}

// FAQ patterns for tour booking domain
const FAQ_PATTERNS: Array<{ pattern: RegExp; response: string; confidence: number }> = [
    // Pricing
    {
        pattern: /giá|price|cost|bao nhiêu tiền|chi phí/i,
        response: "Giá tour phụ thuộc vào số người tham gia và thời gian đặt. Bạn có thể xem chi tiết giá trên trang từng tour. Nếu cần tư vấn cụ thể, hãy cho tôi biết tour bạn quan tâm nhé!",
        confidence: 0.9
    },
    // Booking
    {
        pattern: /đặt.*tour|book|đăng ký|đặt chỗ/i,
        response: "Để đặt tour, bạn chọn tour mong muốn → Nhấn 'Đặt ngay' → Điền thông tin → Xác nhận thanh toán. Bạn cần đăng nhập trước khi đặt nhé!",
        confidence: 0.9
    },
    // Cancel
    {
        pattern: /hủy|cancel|hoàn tiền|refund/i,
        response: "Để hủy tour hoặc yêu cầu hoàn tiền, vui lòng vào Trang cá nhân → Đặt chỗ của tôi → Chọn booking cần hủy. Chính sách hoàn tiền phụ thuộc vào thời gian hủy trước ngày khởi hành.",
        confidence: 0.85
    },
    // Payment
    {
        pattern: /thanh toán|payment|trả tiền|chuyển khoản/i,
        response: "Chúng tôi chấp nhận thanh toán qua: Thẻ tín dụng/ghi nợ, Chuyển khoản ngân hàng, Ví điện tử (MoMo, ZaloPay, VNPay). Bạn sẽ được hướng dẫn chi tiết khi đặt tour.",
        confidence: 0.9
    },
    // Duration
    {
        pattern: /bao lâu|mấy ngày|thời gian|duration/i,
        response: "Thời gian tour thường từ 1-14 ngày tùy lịch trình. Bạn có thể lọc theo thời gian trên trang Tour. Tour nào bạn đang quan tâm?",
        confidence: 0.8
    },
    // Location
    {
        pattern: /địa điểm|location|ở đâu|đi đâu|điểm đến/i,
        response: "Chúng tôi có tour khám phá khắp Việt Nam: Hà Nội, Sapa, Hạ Long, Đà Nẵng, Hội An, Nha Trang, Đà Lạt, Phú Quốc, Sài Gòn... Bạn muốn đi vùng nào?",
        confidence: 0.85
    },
    // Group/Family
    {
        pattern: /nhóm|group|gia đình|family|bao nhiêu người/i,
        response: "Mỗi tour có giới hạn số người khác nhau. Tour riêng có thể đặt từ 2 người trở lên. Bạn đi mấy người để tôi tư vấn tour phù hợp nhé!",
        confidence: 0.8
    },
    // Reviews
    {
        pattern: /đánh giá|review|tốt không|có hay không/i,
        response: "Bạn có thể xem đánh giá từ khách hàng trước trên trang chi tiết từng tour. Chúng tôi tự hào có rating trung bình 4.5+ sao!",
        confidence: 0.85
    },
    // Greeting
    {
        pattern: /xin chào|hello|hi|chào|hey/i,
        response: "Xin chào! Tôi là trợ lý AI của Visita. Tôi có thể giúp bạn tìm tour, giải đáp thắc mắc về đặt chỗ, thanh toán. Bạn cần hỗ trợ gì ạ?",
        confidence: 0.95
    },
    // Thanks
    {
        pattern: /cảm ơn|thank|thanks/i,
        response: "Không có gì ạ! Nếu bạn cần thêm thông tin gì, cứ hỏi tôi nhé. Chúc bạn có chuyến đi vui vẻ! 🌟",
        confidence: 0.95
    },
    // Promo/Discount
    {
        pattern: /khuyến mãi|promo|discount|giảm giá|mã giảm/i,
        response: "Bạn có thể nhập mã giảm giá khi đặt tour. Hãy theo dõi trang chủ để cập nhật các chương trình khuyến mãi mới nhất nhé!",
        confidence: 0.85
    },
    // Contact
    {
        pattern: /liên hệ|contact|hotline|điện thoại|số máy/i,
        response: "Bạn có thể liên hệ hotline: 1900 1234 (8h-22h hàng ngày) hoặc email: support@visita.vn. Hoặc nếu cần nói chuyện với nhân viên ngay, hãy nhấn 'Nói chuyện với nhân viên' nhé!",
        confidence: 0.9
    },
];

// Keywords that trigger escalation to human
const ESCALATION_TRIGGERS: RegExp[] = [
    /nhân viên|staff|agent|người thật|human|real person/i,
    /nói chuyện với ai đó|talk to someone/i,
    /không hiểu|không giúp được|doesn't help/i,
    /cần hỗ trợ khẩn|urgent|emergency|gấp/i,
    /khiếu nại|complaint|phàn nàn/i,
    /manager|quản lý/i,
];

// Default fallback responses when no pattern matches
const FALLBACK_RESPONSES = [
    "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể diễn đạt lại được không ạ?",
    "Hmm, câu hỏi này hơi khó với tôi. Bạn muốn tôi chuyển cho nhân viên hỗ trợ không?",
    "Tôi không chắc về câu trả lời. Để được hỗ trợ tốt hơn, bạn có thể nhấn 'Nói chuyện với nhân viên' nhé!",
];

/**
 * Check if the message should trigger escalation to human
 */
export function shouldEscalate(message: string, failCount: number): boolean {
    // Explicit escalation request
    if (ESCALATION_TRIGGERS.some(pattern => pattern.test(message))) {
        return true;
    }

    // Too many failed responses
    if (failCount >= 3) {
        return true;
    }

    return false;
}

/**
 * Get AI bot response for a message
 */
export function getBotResponse(message: string, failCount: number): BotResponse {
    // Try to match FAQ patterns
    for (const { pattern, response, confidence } of FAQ_PATTERNS) {
        if (pattern.test(message)) {
            return {
                success: true,
                message: response,
                confidence
            };
        }
    }

    // No match - return fallback
    const fallbackIndex = Math.min(failCount, FALLBACK_RESPONSES.length - 1);
    return {
        success: false,
        message: FALLBACK_RESPONSES[fallbackIndex],
        confidence: 0.3
    };
}

/**
 * Get initial greeting message from bot
 */
export function getBotGreeting(userName: string): string {
    return `Xin chào ${userName}! 👋 Tôi là trợ lý AI của Visita. Tôi có thể giúp bạn:\n\n• Tìm tour phù hợp\n• Giải đáp về đặt chỗ & thanh toán\n• Thông tin về chính sách hủy/hoàn tiền\n\nBạn cần hỗ trợ gì ạ?`;
}
