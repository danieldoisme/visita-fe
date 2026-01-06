import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageCircle, Minus, Paperclip, Headset, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ChatWidgetProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function ChatWidget({ isOpen: externalIsOpen, onClose: externalOnClose }: ChatWidgetProps) {
    const { user } = useAuth();
    const {
        currentSession,
        messages,
        createSession,
        sendMessage,
        sessions,
        joinSession,
        isWidgetOpen,
        setWidgetOpen,
        requestHuman,
        loading
    } = useChat();

    // Use context state for floating widget, or external for embedded mode
    const isEmbedded = externalIsOpen !== undefined;
    const isOpen = isEmbedded ? externalIsOpen : isWidgetOpen;

    const [messageInput, setMessageInput] = useState("");
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef(messages.length);

    // When opened via context, ensure not minimized
    useEffect(() => {
        if (isWidgetOpen) {
            setIsMinimized(false);
        }
    }, [isWidgetOpen]);

    // Internal toggle
    const handleToggle = () => {
        if (isEmbedded && externalOnClose && isOpen) {
            externalOnClose();
        } else {
            setWidgetOpen(!isWidgetOpen);
            setIsMinimized(false);
        }
    };

    // Scroll to bottom when new messages arrive (received)
    useEffect(() => {
        if (isOpen && messages.length > prevMessagesLengthRef.current) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
        prevMessagesLengthRef.current = messages.length;
    }, [isOpen, messages.length]);

    // Scroll to bottom when chat opens or expands from minimized
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [isOpen, isMinimized]);

    // Auto-rejoin active/pending session when widget opens
    useEffect(() => {
        if (isOpen && !currentSession && sessions.length > 0) {
            // Find most recent active or pending session (not closed)
            const activeSession = [...sessions]
                .filter(s => s.status !== "closed")
                .sort((a, b) =>
                    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
                )[0];

            if (activeSession) {
                joinSession(activeSession.id);
            }
        }
    }, [isOpen, sessions, currentSession, joinSession]);


    const handleSend = async () => {
        if (!messageInput.trim()) return;

        const message = messageInput;
        setMessageInput(""); // Clear input immediately (optimistic UI)

        // Scroll to bottom after sending
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        if (!currentSession) {
            await createSession(message);
        } else {
            await sendMessage(message);
        }
    };

    // Hide for staff/admin (they have their own dashboard), but allow guests and regular users
    if (user && user.role !== "user") return null;

    return (
        <>
            {/* Floating Toggle Button (only if not controlled externally) */}
            {!externalIsOpen && externalIsOpen === undefined && (
                <Button
                    onClick={handleToggle}
                    className={cn(
                        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 z-50 transition-transform hover:scale-110",
                        isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
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
                        // Base styles
                        "fixed bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
                        // Mobile-first responsive positioning: base -> xs -> sm+
                        "bottom-2 right-2 xs:bottom-3 xs:right-3 sm:bottom-6 sm:right-6",
                        // Mobile-first responsive width: base -> xs -> sm+
                        "w-[calc(100%-16px)] xs:w-[calc(100%-24px)] sm:w-full sm:max-w-[380px]",
                        // Mobile-first responsive height
                        isMinimized
                            ? "h-[70px]"
                            : "h-[calc(100dvh-80px)] xs:h-[calc(100dvh-100px)] sm:h-[600px] sm:max-h-[80vh]",
                        // External/embedded mode overrides
                        externalIsOpen ? "relative bottom-auto right-auto w-full max-w-full h-full shadow-none border-0" : ""
                    )}
                >
                    {/* Header - Default to AI mode styling */}
                    <div
                        className={cn(
                            "p-4 text-white flex items-center justify-between cursor-pointer",
                            currentSession?.mode === "human" ? "bg-primary" : "bg-gradient-to-r from-violet-600 to-indigo-600"
                        )}
                        onClick={() => !externalIsOpen && setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                {currentSession?.mode === "human" ? (
                                    <Headset className="h-5 w-5 text-white" />
                                ) : (
                                    <Bot className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">
                                    {currentSession?.mode === "human" ? "Hỗ trợ trực tuyến" : "Trợ lý AI"}
                                </h3>
                                <p className="text-xs text-white/80 flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                    {currentSession?.mode === "human" ? "Sẵn sàng hỗ trợ" : "Trả lời tức thì"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Talk to Human button (only in bot mode and when session exists) */}
                            {currentSession && currentSession.mode === "bot" && !isMinimized && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-xs text-white hover:bg-white/20 rounded-full px-3"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        requestHuman();
                                    }}
                                >
                                    <User className="h-3 w-3 mr-1" />
                                    Nhân viên
                                </Button>
                            )}
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
                                        setWidgetOpen(false);
                                    }}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    {!isMinimized && (
                        <>
                            <div className={cn(
                                "flex-1 bg-slate-50 p-4 space-y-4",
                                messages.length > 0 ? "overflow-y-auto" : "overflow-hidden"
                            )}>
                                {!currentSession && messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6">
                                        <div className="h-16 w-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
                                            <Bot className="h-8 w-8 text-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Xin chào{user ? `, ${user.fullName}` : ''}! 👋</h4>
                                            <p className="text-sm text-slate-500 mt-2">
                                                Tôi là trợ lý AI của Visita. Hãy hỏi tôi về tour, đặt chỗ, hoặc thanh toán nhé!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMyMessage = currentSession ? msg.senderId === currentSession.userId : false;
                                        const isBot = msg.senderRole === "bot";
                                        const isSystem = msg.senderRole === "system";

                                        // System messages (centered)
                                        if (isSystem) {
                                            return (
                                                <div key={msg.id} className="flex justify-center">
                                                    <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        }

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
                                                            : isBot
                                                                ? "bg-gradient-to-br from-violet-100 to-indigo-100 text-slate-800 border border-violet-200 rounded-tl-none"
                                                                : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                                                    )}
                                                >
                                                    {isBot && (
                                                        <div className="text-[10px] font-medium text-violet-600 mb-1 flex items-center gap-1">
                                                            <Bot className="h-3 w-3" />
                                                            Trợ lý AI
                                                        </div>
                                                    )}
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
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
                                {loading && (
                                    <div className="flex justify-start w-full">
                                        <div className="bg-gradient-to-br from-violet-100 to-indigo-100 text-slate-800 border border-violet-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-slate-400 hover:text-slate-600"
                                        disabled={currentSession?.status === "closed"}
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Input
                                        id="chat-input"
                                        name="chat-input"
                                        autoFocus
                                        placeholder={currentSession?.status === "closed" ? "Cuộc hội thoại đã kết thúc" : "Nhập tin nhắn..."}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        disabled={currentSession?.status === "closed"}
                                        className="flex-1 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!messageInput.trim() || currentSession?.status === "closed"}
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
