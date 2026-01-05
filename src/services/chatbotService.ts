/**
 * AI Chatbot Service
 * 
 * Placeholder for future AI integration.
 * Replace these functions with actual API calls to your AI backend.
 * 
 * Example integrations:
 * - OpenAI ChatGPT API
 * - Claude API
 * - Custom LLM backend
 * - Dialogflow / Rasa
 */

export interface BotResponse {
    success: boolean;
    message: string;
    confidence: number;
}

// Keywords that trigger escalation to human support
const ESCALATION_KEYWORDS = [
    "nhân viên", "staff", "agent", "người thật", "human",
    "nói chuyện với ai đó", "talk to someone",
    "khiếu nại", "complaint", "phàn nàn",
    "gấp", "urgent", "emergency"
];

/**
 * Check if the message should trigger escalation to human support
 * TODO: Implement with AI sentiment analysis for better detection
 */
export function shouldEscalate(message: string, failCount: number): boolean {
    // Explicit escalation request
    const lowerMessage = message.toLowerCase();
    if (ESCALATION_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
        return true;
    }

    // Too many failed responses - user is frustrated
    if (failCount >= 3) {
        return true;
    }

    return false;
}

/**
 * Get AI bot response for a message
 * 
 * TODO: Replace with actual AI API call
 * Example implementation:
 * ```
 * const response = await fetch('/api/ai/chat', {
 *     method: 'POST',
 *     body: JSON.stringify({ message, context }),
 * });
 * return response.json();
 * ```
 */
export async function getBotResponse(message: string, _failCount: number): Promise<BotResponse> {
    // Placeholder response until AI integration is complete
    console.log('[AI Bot] Received message:', message);

    return {
        success: false,
        message: "Xin lỗi, tính năng trợ lý AI đang được phát triển. Vui lòng liên hệ hotline 1900 1234 hoặc nhấn 'Nói chuyện với nhân viên' để được hỗ trợ.",
        confidence: 0
    };
}

/**
 * Get initial greeting message from bot
 * TODO: Can be personalized based on user history, time of day, etc.
 */
export function getBotGreeting(userName: string): string {
    return `Xin chào ${userName}! 👋

Tôi là trợ lý AI của Visita. Tính năng hỗ trợ tự động đang được phát triển.

Trong lúc chờ đợi, bạn có thể:
• Liên hệ hotline: 1900 1234
• Email: support@visita.vn

Hoặc nhấn "Nói chuyện với nhân viên" để được hỗ trợ trực tiếp!`;
}
