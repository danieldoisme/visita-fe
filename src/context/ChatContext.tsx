import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { getBotResponse, shouldEscalate, getBotGreeting } from "@/services/mockBotService";

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
    staffId?: string; // Assigned staff
    status: "active" | "closed" | "pending";
    mode: "bot" | "human"; // NEW: tracks if bot or human is handling
    botFailCount: number; // NEW: tracks failed bot responses
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
    // For Staff
    acceptSession: (sessionId: string) => void;
    getStaffSessions: () => ChatSession[];

    // Bot escalation
    requestHuman: () => void;
    // UI State
    isWidgetOpen: boolean;
    setWidgetOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = "visita_chat_data";

interface StorageData {
    sessions: ChatSession[];
    messages: ChatMessage[];
}

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isWidgetOpen, setWidgetOpen] = useState(false);

    // Load data from localStorage
    useEffect(() => {
        const loadData = () => {
            const stored = localStorage.getItem(CHAT_STORAGE_KEY);
            if (stored) {
                const data: StorageData = JSON.parse(stored);
                setSessions(data.sessions);
                setMessages(data.messages);
            }
            setLoading(false);
        };
        loadData();

        // Simulate real-time updates (polling for now since no backend)
        const interval = setInterval(loadData, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ sessions, messages }));
        }
    }, [sessions, messages, loading]);

    const currentSession = sessions.find(s => s.id === currentSessionId) || null;
    const currentMessages = messages.filter(m => m.sessionId === currentSessionId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const createSession = async (initialMessage?: string): Promise<string> => {
        if (!user) throw new Error("Must be logged in");

        const newSession: ChatSession = {
            id: `session_${Date.now()}`,
            userId: user.userId,
            userName: user.fullName,
            status: "active",
            mode: "bot", // Start with bot handling
            botFailCount: 0,
            lastMessage: initialMessage || "Bắt đầu cuộc trò chuyện",
            lastMessageTime: new Date().toISOString(),
            unreadCountClient: 0,
            unreadCountStaff: 0,
            createdAt: new Date().toISOString(),
        };

        const newSessions = [...sessions, newSession];
        setSessions(newSessions);
        setCurrentSessionId(newSession.id);

        // Add bot greeting
        const greetingMsg: ChatMessage = {
            id: `msg_${Date.now()}_greeting`,
            sessionId: newSession.id,
            senderId: "bot",
            senderName: "Trợ lý AI",
            senderRole: "bot",
            content: getBotGreeting(user.fullName),
            timestamp: new Date().toISOString(),
            type: "text"
        };
        setMessages(prev => [...prev, greetingMsg]);

        if (initialMessage) {
            await sendMessageInternal(newSession.id, initialMessage, "text", newSessions);
        }

        return newSession.id;
    };

    const joinSession = (sessionId: string) => {
        setCurrentSessionId(sessionId);
        // Reset unread count based on role
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                if (user?.role === "staff" || user?.role === "admin") {
                    return { ...s, unreadCountStaff: 0 };
                } else {
                    return { ...s, unreadCountClient: 0 };
                }
            }
            return s;
        }));
    };

    const leaveSession = useCallback(() => {
        setCurrentSessionId(null);
    }, []);

    const sendMessageInternal = async (sessionId: string, content: string, type: MessageType, currentSessions?: ChatSession[]) => {
        if (!user) return;

        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            sessionId,
            senderId: user.userId,
            senderName: user.fullName,
            senderRole: user.role as "user" | "staff" | "admin",
            content,
            timestamp: new Date().toISOString(),
            type
        };

        setMessages(prev => [...prev, newMessage]);

        // Get session from param or state
        const sessionsToCheck = currentSessions || sessions;
        const session = sessionsToCheck.find(s => s.id === sessionId);

        // Update session (only if not closed)
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                // Don't update unread counts for closed sessions
                if (s.status === "closed") {
                    return s;
                }
                return {
                    ...s,
                    lastMessage: type === "image" ? "[Hình ảnh]" : content,
                    lastMessageTime: new Date().toISOString(),
                    // Increment unread for the other party, reset for sender
                    unreadCountStaff: user.role === "user" ? s.unreadCountStaff + 1 : 0,
                    unreadCountClient: (user.role === "staff" || user.role === "admin") ? s.unreadCountClient + 1 : 0
                };
            }
            return s;
        }));

        // Bot auto-reply (if session in bot mode and user is sending)
        if (session?.mode === "bot" && user.role === "user") {
            // Check escalation triggers
            if (shouldEscalate(content, session.botFailCount)) {
                escalateToHuman(sessionId);
                return;
            }

            // Simulate typing delay then respond
            setTimeout(() => {
                const botReply = getBotResponse(content, session.botFailCount);
                addBotMessage(sessionId, botReply.message, botReply.success);
            }, 800 + Math.random() * 800);
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

        // Update session (increment fail count if not successful)
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
            content: "Đang chuyển bạn đến nhân viên hỗ trợ. Vui lòng chờ trong giây lát...",
            timestamp: new Date().toISOString(),
            type: "text"
        };
        setMessages(prev => [...prev, systemMsg]);

        // Update session to human mode and pending status
        setSessions(prev => prev.map(s =>
            s.id === sessionId
                ? { ...s, mode: "human" as const, status: "pending" as const, unreadCountStaff: s.unreadCountStaff + 1 }
                : s
        ));
    };

    const requestHuman = () => {
        if (currentSessionId) {
            escalateToHuman(currentSessionId);
        }
    };

    const sendMessage = async (content: string, type: MessageType = "text") => {
        if (!currentSessionId) return;
        await sendMessageInternal(currentSessionId, content, type);
    };

    const closeSession = (sessionId: string) => {
        // Add system message to notify the session is closed
        const systemMsg: ChatMessage = {
            id: `msg_${Date.now()}_close`,
            sessionId,
            senderId: "system",
            senderName: "Hệ thống",
            senderRole: "system",
            content: "Cuộc hội thoại đã được kết thúc bởi nhân viên hỗ trợ.",
            timestamp: new Date().toISOString(),
            type: "text"
        };
        setMessages(prev => [...prev, systemMsg]);

        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: "closed" } : s));
    };

    const acceptSession = (sessionId: string) => {
        if (!user || (user.role !== "staff" && user.role !== "admin")) return;

        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: "active", staffId: user.userId } : s));
        setCurrentSessionId(sessionId);
    };

    const getStaffSessions = () => {
        return sessions.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
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
