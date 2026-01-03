import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PaginationControls, ITEMS_PER_PAGE } from "@/components/admin";
import {
    Search,
    Send,
    User,
    Clock,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Bot,
    ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffChatPage() {
    const { user } = useAuth();
    const {
        sessions,
        currentSession,
        messages,
        joinSession,
        leaveSession,
        sendMessage,
        acceptSession,
        closeSession
    } = useChat();

    // Clear session when navigating away from the page
    useEffect(() => {
        return () => {
            leaveSession();
        };
    }, [leaveSession]);

    // We can't use `sessions` directly because for staff we want ALL sessions or assigned sessions.
    // The context `sessions` might be filtered for user role. 
    // BUT, we updated ChatContext to return relevant sessions based on role?
    // Let's check logic: `sessions: user?.role === "user" ? sessions.filter(...) : sessions`
    // So if staff, we get all sessions. Good.

    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "active">("all");
    const [messageInput, setMessageInput] = useState("");
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredSessions = sessions.filter(session => {
        // Only show sessions that need human attention (mode === "human")
        if (session.mode === "bot") return false;

        const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by tab:
        // - "all" shows all human sessions (including closed for history)
        // - "pending" shows only pending sessions
        // - "active" shows only active sessions assigned to current staff
        let matchesFilter = false;
        if (activeFilter === "all") {
            matchesFilter = true; // Show all including closed
        } else if (activeFilter === "pending") {
            matchesFilter = session.status === "pending";
        } else {
            // "active" tab - only active sessions for this staff
            matchesFilter = session.status === "active" && session.staffId === user?.userId;
        }

        return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredSessions.length / ITEMS_PER_PAGE));
    const paginatedSessions = filteredSessions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page to 1 when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    // Scroll to bottom only when switching to a new session OR when new messages arrive
    const prevMessagesLengthRef = useRef(messages.length);
    useEffect(() => {
        if (currentSession) {
            // Scroll on new messages (received)
            if (messages.length > prevMessagesLengthRef.current) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
            prevMessagesLengthRef.current = messages.length;
        }
    }, [currentSession, messages.length]);

    // Also scroll when switching sessions
    useEffect(() => {
        if (currentSession) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [currentSession?.id]);

    const handleSend = async () => {
        if (!messageInput.trim() || !currentSession) return;

        if (currentSession.status === "pending") {
            acceptSession(currentSession.id);
        }

        await sendMessage(messageInput);
        setMessageInput("");

        // Scroll to bottom after sending
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Handle session selection - show chat panel on mobile
    const handleSelectSession = (sessionId: string) => {
        joinSession(sessionId);
        setShowChatOnMobile(true);
    };

    // Handle back button - return to session list on mobile
    const handleBackToList = () => {
        setShowChatOnMobile(false);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6 relative overflow-hidden">
            {/* Session List */}
            <Card className={`
                md:w-80 w-full flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white
                absolute md:relative inset-0 md:inset-auto
                transition-transform duration-300 ease-in-out
                ${showChatOnMobile ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
                z-10
            `}>
                <div className="p-4 border-b space-y-3">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Chat Sessions
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            id="staff-chat-search"
                            name="staff-chat-search"
                            placeholder="Tìm khách hàng..."
                            className="pl-9 bg-slate-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                        {(["all", "pending", "active"] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "flex-1 text-xs font-medium py-1.5 rounded-md transition-all capitalize",
                                    activeFilter === filter
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {filter === "all" ? "Tất cả" : filter === "pending" ? "Chờ xử lý" : "Đang chat"}
                            </button>
                        ))}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {filteredSessions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                Không tìm thấy cuộc hội thoại nào
                            </div>
                        ) : (
                            paginatedSessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => handleSelectSession(session.id)}
                                    className={cn(
                                        "p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors relative",
                                        currentSession?.id === session.id && "bg-blue-50/50 hover:bg-blue-50/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1 pr-6">
                                        <div className={cn(
                                            "text-sm truncate max-w-[160px]",
                                            session.unreadCountStaff > 0 ? "font-semibold text-slate-900" : "text-slate-600"
                                        )}>
                                            {session.userName}
                                        </div>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                            {format(new Date(session.lastMessageTime), "HH:mm")}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-xs mb-2 line-clamp-1",
                                        session.unreadCountStaff > 0 ? "font-semibold text-slate-900" : "text-slate-500"
                                    )}>
                                        {session.lastMessage}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {session.status === "pending" && (
                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 h-5 px-1.5 text-[10px]">
                                                    Chờ hỗ trợ
                                                </Badge>
                                            )}
                                            {session.status === "active" && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 h-5 px-1.5 text-[10px]">
                                                    Đang hoạt động
                                                </Badge>
                                            )}
                                            {session.status === "closed" && (
                                                <Badge variant="outline" className="text-slate-400 h-5 px-1.5 text-[10px]">
                                                    Đã kết thúc
                                                </Badge>
                                            )}
                                        </div>
                                        {session.unreadCountStaff > 0 && (
                                            <span className="h-5 min-w-[20px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {session.unreadCountStaff}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Pagination Controls */}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </Card>

            {/* Chat Area */}
            <Card className={`
                flex-1 flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white
                absolute md:relative inset-0 md:inset-auto w-full
                transition-transform duration-300 ease-in-out
                ${showChatOnMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                z-20 md:z-auto
            `}>
                {currentSession ? (
                    <>
                        <div className="p-3 md:p-4 border-b flex items-center justify-between bg-white gap-2">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                {/* Back button - visible only on mobile */}
                                <button
                                    onClick={handleBackToList}
                                    className="md:hidden h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                                    aria-label="Quay lại danh sách"
                                >
                                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                                </button>
                                <div className="hidden md:flex h-10 w-10 bg-slate-100 rounded-full flex-shrink-0 items-center justify-center">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate">{currentSession.userName}</h3>
                                    <div className="flex items-center gap-1 md:gap-2 text-xs text-slate-500">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Bắt đầu: {format(new Date(currentSession.createdAt), "dd/MM/yyyy HH:mm")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {currentSession.status === "pending" ? (
                                    <Button
                                        size="sm"
                                        className="bg-primary hover:bg-primary/90"
                                        onClick={() => acceptSession(currentSession.id)}
                                    >
                                        <CheckCircle2 className="h-4 w-4 md:mr-2" />
                                        <span className="hidden md:inline">Tiếp nhận</span>
                                    </Button>
                                ) : currentSession.status === "active" ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => closeSession(currentSession.id)}
                                    >
                                        <AlertCircle className="h-4 w-4 md:mr-2" />
                                        <span className="hidden md:inline">Kết thúc</span>
                                    </Button>
                                ) : (
                                    <span className="text-xs md:text-sm text-slate-500 font-medium px-2 md:px-3 whitespace-nowrap">Đã kết thúc</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-4">
                            {messages.map((msg) => {
                                const isStaff = msg.senderRole === "staff" || msg.senderRole === "admin";
                                const isSystem = msg.senderRole === "system";
                                const isBot = msg.senderRole === "bot";

                                if (isSystem) {
                                    return (
                                        <div key={msg.id} className="flex justify-center my-4">
                                            <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full">
                                                {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full",
                                            isStaff ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                isStaff
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
                                            {!isStaff && !isBot && (
                                                <div className="text-[10px] font-medium text-slate-500 mb-1">
                                                    {msg.senderName}
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            <div
                                                className={cn(
                                                    "text-[10px] mt-1 opacity-70",
                                                    isStaff ? "text-primary-foreground" : "text-slate-400"
                                                )}
                                            >
                                                {format(new Date(msg.timestamp), "HH:mm")}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t">
                            <div className="flex gap-2">
                                <Input
                                    id="staff-chat-input"
                                    name="staff-chat-input"
                                    placeholder={currentSession.status === "closed" ? "Cuộc hội thoại đã kết thúc" : "Nhập tin nhắn..."}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    disabled={currentSession.status === "closed"}
                                    className="bg-slate-50"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || currentSession.status === "closed"}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        {/* Back button for empty state on mobile */}
                        <button
                            onClick={handleBackToList}
                            className="md:hidden absolute top-4 left-4 h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                            aria-label="Quay lại danh sách"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                        <p>Chọn một cuộc hội thoại để bắt đầu</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
