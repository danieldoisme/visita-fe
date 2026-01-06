import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { getBotResponse, getBotGreeting, ChatHistoryItem } from "@/services/chatbotService";

// Keywords that trigger escalation to human support
const ESCALATION_KEYWORDS = [
    "nhân viên", "staff", "agent", "người thật", "human",
    "nói chuyện với ai đó", "talk to someone",
    "khiếu nại", "complaint", "phàn nàn",
    "gấp", "urgent", "emergency"
];

function shouldEscalate(message: string, failCount: number): boolean {
    const lowerMessage = message.toLowerCase();
    if (ESCALATION_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
        return true;
    }
    return failCount >= 3;
}

export type MessageType = "text" | "image";

export interface ChatMessage {
    id: string;
    sessionId: string;
    senderId: string;
    senderName: string;
    senderRole: "user" | "staff" | "admin" | "system" | "bot";
    content: string;
    timestamp: string;
    type: MessageType;
}

export interface ChatSession {
    id: string;
    userId: string;
    userName: string;
    staffId?: string;
    status: "active" | "closed" | "pending";
    mode: "bot" | "human";
    botFailCount: number;
    lastMessage?: string;
    lastMessageTime: string;
    unreadCountClient: number;
    unreadCountStaff: number;
    createdAt: string;
}

interface ChatContextType {
    sessions: ChatSession[];
    currentSession: ChatSession | null;
    messages: ChatMessage[];
    loading: boolean;
    createSession: (initialMessage?: string) => Promise<string>;
    joinSession: (sessionId: string) => void;
    leaveSession: () => void;
    sendMessage: (content: string, type?: MessageType) => Promise<void>;
    closeSession: (sessionId: string) => void;
    // For Staff (stub - backend not implemented)
    acceptSession: (sessionId: string) => void;
    getStaffSessions: () => ChatSession[];
    // Bot escalation
    requestHuman: () => void;
    // UI State
    isWidgetOpen: boolean;
    setWidgetOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    // In-memory state only (no persistence until backend is ready)
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isWidgetOpen, setWidgetOpen] = useState(false);

    // Generate or retrieve guest ID for anonymous users
    const getGuestId = (): string => {
        let guestId = sessionStorage.getItem('chat_guest_id');
        if (!guestId) {
            guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem('chat_guest_id', guestId);
        }
        return guestId;
    };

    // Get current user info (logged in or guest)
    const getCurrentUserInfo = () => {
        if (user) {
            return { id: user.userId, name: user.fullName };
        }
        return { id: getGuestId(), name: 'Khách' };
    };

    const currentSession = sessions.find(s => s.id === currentSessionId) || null;
    const currentMessages = messages
        .filter(m => m.sessionId === currentSessionId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const createSession = async (initialMessage?: string): Promise<string> => {
        const { id: userId, name: userName } = getCurrentUserInfo();

        const newSession: ChatSession = {
            id: `session_${Date.now()}`,
            userId,
            userName,
            status: "active",
            mode: "bot", // AI bot mode by default
            botFailCount: 0,
            lastMessage: initialMessage || "Bắt đầu cuộc trò chuyện",
            lastMessageTime: new Date().toISOString(),
            unreadCountClient: 0,
            unreadCountStaff: 0,
            createdAt: new Date().toISOString(),
        };

        setSessions(prev => [...prev, newSession]);
        setCurrentSessionId(newSession.id);

        // Add bot greeting
        const greetingMsg: ChatMessage = {
            id: `msg_${Date.now()}_greeting`,
            sessionId: newSession.id,
            senderId: "bot",
            senderName: "Trợ lý AI",
            senderRole: "bot",
            content: getBotGreeting(userName),
            timestamp: new Date().toISOString(),
            type: "text"
        };
        setMessages(prev => [...prev, greetingMsg]);

        if (initialMessage) {
            // Send user's initial message after session creation
            // Pass the session directly to avoid stale closure
            setTimeout(() => {
                sendMessageToBot(newSession.id, initialMessage, newSession);
            }, 100);
        }

        return newSession.id;
    };

    /**
     * Send message and get bot response (AI chatbot integration point)
     * @param sessionToUse - Optional session object to avoid stale closure issues
     */
    const sendMessageToBot = async (sessionId: string, content: string, sessionToUse?: ChatSession) => {
        const { id: userId, name: userName } = getCurrentUserInfo();

        // Add user message
        const userMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            sessionId,
            senderId: userId,
            senderName: userName,
            senderRole: "user",
            content,
            timestamp: new Date().toISOString(),
            type: "text"
        };
        setMessages(prev => [...prev, userMsg]);

        // Update session
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId && s.status !== "closed") {
                return {
                    ...s,
                    lastMessage: content,
                    lastMessageTime: new Date().toISOString(),
                };
            }
            return s;
        }));

        // Use provided session or find from state
        const session = sessionToUse || sessions.find(s => s.id === sessionId);
        if (!session || session.mode !== "bot") return;

        // Check if should escalate to human
        if (shouldEscalate(content, session.botFailCount)) {
            escalateToHuman(sessionId);
            return;
        }

        // Build conversation history for AI context
        const sessionMessages = messages.filter(m => m.sessionId === sessionId);
        const history: ChatHistoryItem[] = sessionMessages
            .filter(m => m.senderRole === "user" || m.senderRole === "bot")
            .map(m => ({
                role: m.senderRole === "user" ? "user" as const : "assistant" as const,
                content: m.content
            }));

        // Call AI service
        setLoading(true);
        try {
            const botReply = await getBotResponse(content, history);
            addBotMessage(sessionId, botReply.message, botReply.success);
        } finally {
            setLoading(false);
        }
    };

    const addBotMessage = (sessionId: string, content: string, success: boolean) => {
        const botMsg: ChatMessage = {
            id: `msg_${Date.now()}_bot`,
            sessionId,
            senderId: "bot",
            senderName: "Trợ lý AI",
            senderRole: "bot",
            content,
            timestamp: new Date().toISOString(),
            type: "text"
        };
        setMessages(prev => [...prev, botMsg]);

        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                return {
                    ...s,
                    lastMessage: content,
                    lastMessageTime: new Date().toISOString(),
                    unreadCountClient: s.unreadCountClient + 1,
                    botFailCount: success ? s.botFailCount : s.botFailCount + 1
                };
            }
            return s;
        }));
    };

    const escalateToHuman = (sessionId: string) => {
        // Add system message
        const systemMsg: ChatMessage = {
            id: `msg_${Date.now()}_system`,
            sessionId,
            senderId: "system",
            senderName: "Hệ thống",
            senderRole: "system",
            content: "Tính năng chat với nhân viên đang được phát triển. Vui lòng liên hệ hotline: 1900 1234 hoặc email: support@visita.vn để được hỗ trợ.",
            timestamp: new Date().toISOString(),
            type: "text"
        };
        setMessages(prev => [...prev, systemMsg]);

        // Update session to human mode (pending backend implementation)
        setSessions(prev => prev.map(s =>
            s.id === sessionId
                ? { ...s, mode: "human" as const, status: "pending" as const }
                : s
        ));
    };

    const requestHuman = () => {
        if (currentSessionId) {
            escalateToHuman(currentSessionId);
        }
    };

    const joinSession = (sessionId: string) => {
        setCurrentSessionId(sessionId);
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                return { ...s, unreadCountClient: 0 };
            }
            return s;
        }));
    };

    const leaveSession = useCallback(() => {
        setCurrentSessionId(null);
    }, []);

    const sendMessage = async (content: string, type: MessageType = "text") => {
        if (!currentSessionId) return;

        const { id: userId, name: userName } = getCurrentUserInfo();
        const session = currentSession; // Capture current session to avoid stale closure

        if (type === "image") {
            // Handle image message
            const imageMsg: ChatMessage = {
                id: `msg_${Date.now()}`,
                sessionId: currentSessionId,
                senderId: userId,
                senderName: userName,
                senderRole: "user",
                content,
                timestamp: new Date().toISOString(),
                type: "image"
            };
            setMessages(prev => [...prev, imageMsg]);
            return;
        }

        // Text message - send to bot (pass session to avoid stale closure)
        await sendMessageToBot(currentSessionId, content, session || undefined);
    };

    const closeSession = (sessionId: string) => {
        const systemMsg: ChatMessage = {
            id: `msg_${Date.now()}_close`,
            sessionId,
            senderId: "system",
            senderName: "Hệ thống",
            senderRole: "system",
            content: "Cuộc hội thoại đã kết thúc. Cảm ơn bạn đã sử dụng dịch vụ!",
            timestamp: new Date().toISOString(),
            type: "text"
        };
        setMessages(prev => [...prev, systemMsg]);
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: "closed" } : s));
    };

    // Staff functions - stubs for future backend integration
    const acceptSession = (_sessionId: string) => {
        // TODO: Implement when backend WebSocket is ready
        console.warn("Staff chat not implemented - backend WebSocket required");
    };

    const getStaffSessions = () => {
        // TODO: Implement when backend WebSocket is ready
        return [];
    };

    return (
        <ChatContext.Provider
            value={{
                sessions: user?.role === "user" ? sessions.filter(s => s.userId === user.userId) : sessions,
                currentSession,
                messages: currentMessages,
                loading,
                createSession,
                joinSession,
                leaveSession,
                sendMessage,
                closeSession,
                acceptSession,
                getStaffSessions,
                requestHuman,
                isWidgetOpen,
                setWidgetOpen
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
