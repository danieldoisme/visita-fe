import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export type MessageType = "text" | "image";

export interface ChatMessage {
    id: string;
    sessionId: string;
    senderId: string;
    senderName: string;
    senderRole: "user" | "staff" | "admin" | "system";
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
    sendMessage: (content: string, type?: MessageType) => Promise<void>;
    closeSession: (sessionId: string) => void;
    // For Staff
    acceptSession: (sessionId: string) => void;
    getStaffSessions: () => ChatSession[];

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
            status: "pending",
            lastMessage: initialMessage || "Bắt đầu cuộc trò chuyện",
            lastMessageTime: new Date().toISOString(),
            unreadCountClient: 0,
            unreadCountStaff: 1, // Staff sees 1 unread
            createdAt: new Date().toISOString(),
        };

        const newSessions = [...sessions, newSession];
        setSessions(newSessions);
        setCurrentSessionId(newSession.id);

        if (initialMessage) {
            await sendMessageInternal(newSession.id, initialMessage, "text");
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

    const sendMessageInternal = async (sessionId: string, content: string, type: MessageType) => {
        if (!user) return;

        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            sessionId,
            senderId: user.userId,
            senderName: user.fullName,
            senderRole: user.role as any,
            content,
            timestamp: new Date().toISOString(),
            type
        };

        setMessages(prev => [...prev, newMessage]);

        // Update session
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                return {
                    ...s,
                    lastMessage: type === "image" ? "[Hình ảnh]" : content,
                    lastMessageTime: new Date().toISOString(),
                    unreadCountStaff: user.role === "user" ? s.unreadCountStaff + 1 : s.unreadCountStaff,
                    unreadCountClient: (user.role === "staff" || user.role === "admin") ? s.unreadCountClient + 1 : s.unreadCountClient
                };
            }
            return s;
        }));

        // Auto-reply simulation if no staff assigned yet (optional)
        // For now, we wait for real staff
    };

    const sendMessage = async (content: string, type: MessageType = "text") => {
        if (!currentSessionId) return;
        await sendMessageInternal(currentSessionId, content, type);
    };

    const closeSession = (sessionId: string) => {
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
                sendMessage,
                closeSession,
                acceptSession,
                getStaffSessions,
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
