import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Send,
    User,
    Clock,
    MessageSquare,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffChatPage() {
    const { user } = useAuth();
    const {
        sessions,
        currentSession,
        messages,
        joinSession,
        sendMessage,
        acceptSession,
        closeSession
    } = useChat();

    // We can't use `sessions` directly because for staff we want ALL sessions or assigned sessions.
    // The context `sessions` might be filtered for user role. 
    // BUT, we updated ChatContext to return relevant sessions based on role?
    // Let's check logic: `sessions: user?.role === "user" ? sessions.filter(...) : sessions`
    // So if staff, we get all sessions. Good.

    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "active">("all");
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === "all"
            ? true
            : activeFilter === "pending"
                ? session.status === "pending"
                : session.status === "active" && session.staffId === user?.userId;

        return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!messageInput.trim() || !currentSession) return;

        // If session is pending and I reply, should I auto-accept?
        // ChatContext doesn't auto-accept in sendMessage, so let's check.
        if (currentSession.status === "pending") {
            acceptSession(currentSession.id);
        }

        await sendMessage(messageInput);
        setMessageInput("");
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Session List */}
            <Card className="w-80 flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white">
                <div className="p-4 border-b space-y-3">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Chat Sessions
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
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
                            filteredSessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => joinSession(session.id)}
                                    className={cn(
                                        "p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors relative",
                                        currentSession?.id === session.id && "bg-blue-50/50 hover:bg-blue-50/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-semibold text-sm truncate pr-2 max-w-[140px]">
                                            {session.userName}
                                        </div>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {format(new Date(session.lastMessageTime), "HH:mm")}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-xs truncate mb-2",
                                        session.unreadCountStaff > 0 ? "font-semibold text-slate-900" : "text-slate-500"
                                    )}>
                                        {session.lastMessage}
                                    </p>
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
                                        <span className="absolute top-4 right-4 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {session.unreadCountStaff}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white">
                {currentSession ? (
                    <>
                        <div className="p-4 border-b flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{currentSession.userName}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        <span>Bắt đầu: {format(new Date(currentSession.createdAt), "dd/MM/yyyy HH:mm")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {currentSession.status === "pending" ? (
                                    <Button
                                        size="sm"
                                        className="bg-primary hover:bg-primary/90"
                                        onClick={() => acceptSession(currentSession.id)}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Tiếp nhận
                                    </Button>
                                ) : currentSession.status === "active" ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => closeSession(currentSession.id)}
                                    >
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        Kết thúc
                                    </Button>
                                ) : (
                                    <span className="text-sm text-slate-500 font-medium px-3">Đã kết thúc</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-4">
                            {messages.map((msg) => {
                                const isStaff = msg.senderRole === "staff" || msg.senderRole === "admin";
                                const isSystem = msg.senderRole === "system";

                                if (isSystem) {
                                    return (
                                        <div key={msg.id} className="flex justify-center my-4">
                                            <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
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
                                        <div className={cn("flex flex-col max-w-[70%]", isStaff ? "items-end" : "items-start")}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-slate-600">
                                                    {msg.senderName}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {format(new Date(msg.timestamp), "HH:mm")}
                                                </span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "px-4 py-3 text-sm shadow-sm",
                                                    isStaff
                                                        ? "bg-primary text-white rounded-2xl rounded-tr-none"
                                                        : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none"
                                                )}
                                            >
                                                {msg.content}
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
                        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                        <p>Chọn một cuộc hội thoại để bắt đầu</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
