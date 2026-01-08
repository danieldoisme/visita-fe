/**
 * AI Chatbot Service
 * 
 * Integrates with Flask + Gemini 2.5 Flash backend.
 * API: POST /api/chatbot/chat
 */

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5050';

export interface ChatHistoryItem {
    role: 'user' | 'assistant';
    content: string;
}

export interface BotResponse {
    success: boolean;
    message: string;
    confidence: number;
}

/**
 * Send message to AI chatbot and get response
 */
export async function getBotResponse(
    message: string,
    history: ChatHistoryItem[] = []
): Promise<BotResponse> {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/api/chatbot/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                history
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI Bot] API error:', response.status, errorText);
            return {
                success: false,
                message: 'Xin lỗi, không thể kết nối đến trợ lý AI. Vui lòng thử lại sau.',
                confidence: 0
            };
        }

        const data = await response.json();

        return {
            success: true,
            message: data.response || 'Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn không?',
            confidence: 1
        };
    } catch (error) {
        console.error('[AI Bot] Network error:', error);
        return {
            success: false,
            message: 'Xin lỗi, không thể kết nối đến trợ lý AI. Vui lòng kiểm tra kết nối mạng.',
            confidence: 0
        };
    }
}

/**
 * Get initial greeting message from bot
 */
export function getBotGreeting(userName: string): string {
    return `Xin chào ${userName}! 👋

Tôi là trợ lý AI của Visita. Tôi có thể giúp bạn:
• Tìm kiếm tour du lịch
• Kiểm tra thông tin đặt chỗ
• Giải đáp thắc mắc về thanh toán

Hãy hỏi tôi bất cứ điều gì nhé!`;
}
