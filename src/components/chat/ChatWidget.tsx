import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageCircle, Minus, Paperclip, Headset } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ChatWidgetProps {
    isOpen?: boolean;
    onClose?: () => void;
    defaultOpen?: boolean;
}

export function ChatWidget({ isOpen: externalIsOpen, onClose: externalOnClose, defaultOpen = false }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { user, isAuthenticated } = useAuth();
    const {
        currentSession,
        messages,
        createSession,
        sendMessage,
        joinSession,
        sessions
    } = useChat();
    const [messageInput, setMessageInput] = useState("");
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync with external control if provided
    useEffect(() => {
        if (externalIsOpen !== undefined) {
            setIsOpen(externalIsOpen);
            if (externalIsOpen) setIsMinimized(false);
        }
    }, [externalIsOpen]);

    // Internal toggle connection
    const handleToggle = () => {
        if (externalOnClose && isOpen) {
            externalOnClose();
        } else {
            setIsOpen(!isOpen);
            setIsMinimized(false);
        }
    };

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Check if user has an existing active session on open
    useEffect(() => {
        if (isOpen && isAuthenticated && !currentSession && sessions.length > 0) {
            // Find most recent active or pending session
            const recentSession = [...sessions].sort((a, b) =>
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
            )[0];

            if (recentSession) {
                joinSession(recentSession.id);
            }
        }
    }, [isOpen, isAuthenticated, sessions, currentSession, joinSession]);


    const handleSend = async () => {
        if (!messageInput.trim()) return;

        if (!currentSession) {
            await createSession(messageInput);
        } else {
            await sendMessage(messageInput);
        }

        setMessageInput("");
    };

    if (!user || user.role !== "user") return null; // Only for normal users

    return (
        <>
            {/* Floating Toggle Button (only if not controlled externally) */}
            {!externalIsOpen && externalIsOpen === undefined && (
                <Button
                    onClick={handleToggle}
                    className={cn(
                        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 z-50 transition-transform hover:scale-110",
                        isOpen && !isMinimized ? "scale-0 opacity-0" : "scale-100 opacity-100"
                    )}
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                    {/* Unread badge logic could go here */}
                </Button>
            )}

            {/* Chat Window */}
            {(isOpen || (externalIsOpen)) && (
                <div
                    className={cn(
                        "fixed bottom-6 right-6 w-full max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
                        isMinimized ? "h-[70px]" : "h-[600px] max-h-[80vh]",
                        externalIsOpen ? "relative bottom-auto right-auto w-full max-w-full h-full shadow-none border-0" : ""
                    )}
                >
                    {/* Header */}
                    <div
                        className="p-4 bg-primary text-white flex items-center justify-between cursor-pointer"
                        onClick={() => !externalIsOpen && setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Headset className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Hỗ trợ trực tuyến</h3>
                                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                    Sẵn sàng hỗ trợ
                                </p>
                            </div>
                        </div>

                        {!externalIsOpen && (
                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMinimized(!isMinimized);
                                    }}
                                >
                                    <Minus className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                    }}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
                                {!currentSession && messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6">
                                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-4xl">
                                            👋
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Xin chào, {user.fullName}!</h4>
                                            <p className="text-sm text-slate-500 mt-2">
                                                Bạn cần tư vấn về tour nào? Hãy nhắn tin cho chúng tôi nhé!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMyMessage = msg.senderId === user.userId;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex w-full",
                                                    isMyMessage ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                        isMyMessage
                                                            ? "bg-primary text-white rounded-tr-none"
                                                            : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                                                    )}
                                                >
                                                    <p>{msg.content}</p>
                                                    <div
                                                        className={cn(
                                                            "text-[10px] mt-1 opacity-70",
                                                            isMyMessage ? "text-primary-foreground" : "text-slate-400"
                                                        )}
                                                    >
                                                        {format(new Date(msg.timestamp), "HH:mm", { locale: vi })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-slate-600">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Input
                                        id="chat-input"
                                        name="chat-input"
                                        autoFocus
                                        placeholder="Nhập tin nhắn..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        className="flex-1 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!messageInput.trim()}
                                        className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
