import { useState, useMemo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { BulkActionBar, EmptyState, type BulkAction } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Star,
    Check,
    EyeOff,
    Trash,
    CheckCircle,
    MessageSquare,
    Mail,
    Search,
    ChevronLeft,
    ChevronRight,
    Send,
    ArrowUpDown,
    Eye,
    ArrowLeft,
    MailOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============== Types ==============
type ReviewStatus = "pending" | "approved" | "hidden";
type ContactStatus = "new" | "read";
type TabType = "reviews" | "contacts";
type SortDirection = "asc" | "desc";

interface Review {
    id: number;
    userName: string;
    tourName: string;
    rating: number;
    comment: string;
    date: string;
    status: ReviewStatus;
}

interface ContactReply {
    id: number;
    message: string;
    date: string;
    isAdmin: boolean;
}

interface Contact {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    status: ContactStatus;
    replies: ContactReply[];
}

// ============== Mock Data ==============
const INITIAL_REVIEWS: Review[] = [
    {
        id: 1,
        userName: "Nguyễn Văn A",
        tourName: "Khám phá Đà Lạt 3N2Đ",
        rating: 5,
        comment: "Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý. Sẽ quay lại lần sau. Đặc biệt ấn tượng với cảnh đẹp ở Đồi Mộng Mơ và thác Datanla. Đồ ăn trong tour cũng rất ngon, đậm chất Đà Lạt.",
        date: "2024-12-20T10:30:00",
        status: "pending",
    },
    {
        id: 2,
        userName: "Trần Thị B",
        tourName: "Phú Quốc Paradise 4N3Đ",
        rating: 4,
        comment: "Cảnh đẹp, đồ ăn ngon. Chỉ tiếc là thời tiết không được tốt lắm. Resort rất sang trọng, nhân viên phục vụ chu đáo. Sẽ giới thiệu cho bạn bè.",
        date: "2024-12-18T14:15:00",
        status: "approved",
    },
    {
        id: 3,
        userName: "Lê Hoàng C",
        tourName: "Sapa Mây Trắng 2N1Đ",
        rating: 2,
        comment: "Dịch vụ tệ, không đúng như quảng cáo. Xe đón trễ 2 tiếng, khách sạn không giống hình. Rất thất vọng với chuyến đi này. Yêu cầu hoàn tiền.",
        date: "2024-12-15T09:00:00",
        status: "hidden",
    },
    {
        id: 4,
        userName: "Phạm Minh D",
        tourName: "Hội An Cổ Kính 2N1Đ",
        rating: 5,
        comment: "Trải nghiệm tuyệt vời! Phố cổ rất đẹp vào ban đêm. Được thả đèn hoa đăng trên sông rất lãng mạn. Tour guide am hiểu lịch sử, kể chuyện hay.",
        date: "2024-12-22T16:45:00",
        status: "pending",
    },
    {
        id: 5,
        userName: "Hoàng Thị E",
        tourName: "Nha Trang Biển Xanh 3N2Đ",
        rating: 4,
        comment: "Biển đẹp, resort sang trọng. Đáng giá tiền. Hoạt động lặn ngắm san hô rất thú vị.",
        date: "2024-12-21T11:20:00",
        status: "approved",
    },
    {
        id: 6,
        userName: "Vũ Đức F",
        tourName: "Đà Nẵng - Bà Nà Hills 2N1Đ",
        rating: 3,
        comment: "Bà Nà đông quá, chờ cáp treo hơi lâu. Còn lại thì ổn. Cầu Vàng rất đẹp để chụp hình.",
        date: "2024-12-19T08:30:00",
        status: "pending",
    },
];

const INITIAL_CONTACTS: Contact[] = [
    {
        id: 1,
        name: "Nguyễn Minh Tuấn",
        email: "tuan.nm@gmail.com",
        subject: "Hỏi về tour Đà Lạt",
        message: "Xin chào,\n\nTôi muốn hỏi về tour Đà Lạt 3N2Đ có được đón tại sân bay không? Và có thể đặt tour cho nhóm 10 người được không?\n\nNgoài ra, tôi muốn biết thêm về lịch trình chi tiết và các điểm đến trong tour.\n\nCảm ơn!",
        date: "2024-12-23T09:15:00",
        status: "new",
        replies: [],
    },
    {
        id: 2,
        name: "Lê Thị Hương",
        email: "huong.lt@yahoo.com",
        subject: "Yêu cầu hỗ trợ đặt tour",
        message: "Tôi đã đặt tour nhưng chưa nhận được email xác nhận. Mã booking là #000123. Nhờ hỗ trợ kiểm tra giúp.\n\nTôi đã thanh toán qua chuyển khoản ngày 20/12.",
        date: "2024-12-22T15:30:00",
        status: "read",
        replies: [
            {
                id: 1,
                message: "Chào chị Hương,\n\nChúng tôi đã kiểm tra và xác nhận booking #000123 của chị. Email xác nhận đã được gửi lại.\n\nNếu cần hỗ trợ thêm, vui lòng liên hệ hotline: 1900-xxxx.\n\nTrân trọng!",
                date: "2024-12-22T16:00:00",
                isAdmin: true,
            },
        ],
    },
    {
        id: 3,
        name: "Trần Văn Bình",
        email: "binh.tv@outlook.com",
        subject: "Hợp tác kinh doanh",
        message: "Kính gửi ban quản lý Visita,\n\nChúng tôi là công ty XYZ Travel, muốn đề xuất hợp tác với quý công ty về mảng tour du lịch outbound.\n\nVui lòng liên hệ lại để chúng tôi có thể trao đổi chi tiết hơn.\n\nTrân trọng,\nTrần Văn Bình\nGiám đốc Kinh doanh\nXYZ Travel",
        date: "2024-12-21T10:00:00",
        status: "new",
        replies: [],
    },
    {
        id: 4,
        name: "Phạm Thị Lan",
        email: "lan.pt@gmail.com",
        subject: "Góp ý về dịch vụ",
        message: "Tôi muốn góp ý về tour Phú Quốc vừa rồi.\n\nXe đón trễ 30 phút và không có thông báo trước. Khách sạn cũng khác so với hình ảnh quảng cáo.\n\nMong công ty cải thiện để phục vụ khách hàng tốt hơn.",
        date: "2024-12-20T14:45:00",
        status: "read",
        replies: [],
    },
    {
        id: 5,
        name: "Đỗ Quang Hải",
        email: "hai.dq@company.vn",
        subject: "Đặt tour cho công ty",
        message: "Công ty chúng tôi muốn đặt tour team building cho 50 nhân viên vào tháng 1/2025.\n\nXin báo giá và chương trình phù hợp cho nhóm đông.\n\nLiên hệ: 0909-xxx-xxx",
        date: "2024-12-23T11:30:00",
        status: "new",
        replies: [],
    },
];

// ============== Status Badge Configs ==============
const reviewStatusConfig: Record<ReviewStatus, { label: string; className: string }> = {
    pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    approved: { label: "Đã duyệt", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    hidden: { label: "Đã ẩn", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
};

const contactStatusConfig: Record<ContactStatus, { label: string; className: string }> = {
    new: { label: "Mới", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    read: { label: "Đã đọc", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
};

// ============== Helper Functions ==============
const getReviewStatusBadge = (status: ReviewStatus) => (
    <Badge variant="outline" className={reviewStatusConfig[status].className}>
        {reviewStatusConfig[status].label}
    </Badge>
);

const getContactStatusBadge = (status: ContactStatus) => (
    <Badge variant="outline" className={contactStatusConfig[status].className}>
        {contactStatusConfig[status].label}
    </Badge>
);

const renderStars = (rating: number, size: "sm" | "md" = "sm") => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={cn(
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
                    size === "sm" ? "h-4 w-4" : "h-5 w-5"
                )}
            />
        ))}
    </div>
);

const formatDateTime = (dateStr: string) => format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi });
const formatDate = (dateStr: string) => format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });

// ============== Confirmation Dialog Keys ==============
const DELETE_REVIEW_KEY = "delete_review";
const DELETE_CONTACT_KEY = "delete_contact";
const BULK_DELETE_REVIEW_KEY = "bulk_delete_review";
const BULK_DELETE_CONTACT_KEY = "bulk_delete_contact";

// ============== Pagination Constants ==============
const ITEMS_PER_PAGE = 5;

export default function InteractionManagementPage() {
    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>("reviews");

    // Data state
    const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
    const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

    // Search state
    const [reviewSearchTerm, setReviewSearchTerm] = useState("");
    const [contactSearchTerm, setContactSearchTerm] = useState("");

    // Sort state
    const [reviewSort, setReviewSort] = useState<{ key: string; direction: SortDirection }>({ key: "date", direction: "desc" });
    const [contactSort, setContactSort] = useState<{ key: string; direction: SortDirection }>({ key: "date", direction: "desc" });

    // Pagination state
    const [reviewPage, setReviewPage] = useState(1);
    const [contactPage, setContactPage] = useState(1);

    // Selection state for bulk actions
    const [selectedReviews, setSelectedReviews] = useState<Set<number>>(new Set());
    const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());

    // Detail view state
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [replyText, setReplyText] = useState("");

    // Confirmation dialog
    const { shouldShowConfirmation, setDontShowAgain } = useConfirmationPreferences();
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: "delete_review" | "delete_contact" | "bulk_delete_review" | "bulk_delete_contact";
        itemId: number | null;
    }>({
        isOpen: false,
        type: "delete_review",
        itemId: null,
    });

    // ============== Sorting Helper ==============
    const toggleSort = (key: string, currentSort: { key: string; direction: SortDirection }, setSort: (sort: { key: string; direction: SortDirection }) => void) => {
        if (currentSort.key === key) {
            setSort({ key, direction: currentSort.direction === "asc" ? "desc" : "asc" });
        } else {
            setSort({ key, direction: "desc" });
        }
    };

    // ============== Filtered, Sorted & Paginated Data ==============
    const filteredReviews = useMemo(() => {
        const search = reviewSearchTerm.toLowerCase();
        let result = reviews.filter(
            (r) =>
                r.userName.toLowerCase().includes(search) ||
                r.tourName.toLowerCase().includes(search) ||
                r.comment.toLowerCase().includes(search)
        );

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            if (reviewSort.key === "date") {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (reviewSort.key === "rating") {
                comparison = a.rating - b.rating;
            } else if (reviewSort.key === "status") {
                comparison = a.status.localeCompare(b.status);
            }
            return reviewSort.direction === "asc" ? comparison : -comparison;
        });

        return result;
    }, [reviews, reviewSearchTerm, reviewSort]);

    const filteredContacts = useMemo(() => {
        const search = contactSearchTerm.toLowerCase();
        let result = contacts.filter(
            (c) =>
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search) ||
                c.subject.toLowerCase().includes(search)
        );

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            if (contactSort.key === "date") {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (contactSort.key === "status") {
                comparison = a.status.localeCompare(b.status);
            }
            return contactSort.direction === "asc" ? comparison : -comparison;
        });

        return result;
    }, [contacts, contactSearchTerm, contactSort]);

    const totalReviewPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
    const totalContactPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);

    const paginatedReviews = useMemo(() => {
        const start = (reviewPage - 1) * ITEMS_PER_PAGE;
        return filteredReviews.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredReviews, reviewPage]);

    const paginatedContacts = useMemo(() => {
        const start = (contactPage - 1) * ITEMS_PER_PAGE;
        return filteredContacts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredContacts, contactPage]);

    // ============== Selection Handlers ==============
    const toggleReviewSelection = (id: number) => {
        setSelectedReviews((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleAllReviews = () => {
        if (selectedReviews.size === paginatedReviews.length) {
            setSelectedReviews(new Set());
        } else {
            setSelectedReviews(new Set(paginatedReviews.map((r) => r.id)));
        }
    };

    const toggleContactSelection = (id: number) => {
        setSelectedContacts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleAllContacts = () => {
        if (selectedContacts.size === paginatedContacts.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(paginatedContacts.map((c) => c.id)));
        }
    };

    // ============== Review Actions ==============
    const handleApproveReview = (id: number) => {
        setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "approved" as ReviewStatus } : r))
        );
        // Update selectedReview if it's the one being approved
        if (selectedReview?.id === id) {
            setSelectedReview((prev) => prev ? { ...prev, status: "approved" as ReviewStatus } : null);
        }
        toast.success("Đã duyệt đánh giá!");
    };

    const handleHideReview = (id: number) => {
        setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "hidden" as ReviewStatus } : r))
        );
        // Update selectedReview if it's the one being hidden
        if (selectedReview?.id === id) {
            setSelectedReview((prev) => prev ? { ...prev, status: "hidden" as ReviewStatus } : null);
        }
        toast.success("Đã ẩn đánh giá!");
    };

    const executeDeleteReview = (id: number) => {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setSelectedReviews((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        // Close detail modal if the deleted review was being viewed
        if (selectedReview?.id === id) {
            setSelectedReview(null);
        }
        toast.success("Đã xóa đánh giá!");
    };

    const handleDeleteReviewClick = (id: number) => {
        if (shouldShowConfirmation(DELETE_REVIEW_KEY)) {
            setConfirmDialog({ isOpen: true, type: "delete_review", itemId: id });
        } else {
            executeDeleteReview(id);
        }
    };

    // Bulk review actions
    const handleBulkApproveReviews = () => {
        setReviews((prev) =>
            prev.map((r) => (selectedReviews.has(r.id) ? { ...r, status: "approved" as ReviewStatus } : r))
        );
        setSelectedReviews(new Set());
        toast.success(`Đã duyệt ${selectedReviews.size} đánh giá!`);
    };

    const handleBulkHideReviews = () => {
        setReviews((prev) =>
            prev.map((r) => (selectedReviews.has(r.id) ? { ...r, status: "hidden" as ReviewStatus } : r))
        );
        setSelectedReviews(new Set());
        toast.success(`Đã ẩn ${selectedReviews.size} đánh giá!`);
    };

    const executeBulkDeleteReviews = () => {
        setReviews((prev) => prev.filter((r) => !selectedReviews.has(r.id)));
        setSelectedReviews(new Set());
        toast.success(`Đã xóa ${selectedReviews.size} đánh giá!`);
    };

    const handleBulkDeleteReviewsClick = () => {
        if (shouldShowConfirmation(BULK_DELETE_REVIEW_KEY)) {
            setConfirmDialog({ isOpen: true, type: "bulk_delete_review", itemId: null });
        } else {
            executeBulkDeleteReviews();
        }
    };

    // ============== Contact Actions ==============
    const handleMarkAsRead = (id: number) => {
        setContacts((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: "read" as ContactStatus } : c))
        );
        toast.success("Đã đánh dấu đã đọc!");
    };

    const handleMarkAsUnread = (id: number) => {
        setContacts((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: "new" as ContactStatus } : c))
        );
        // Also update selectedContact if it's the one being marked
        if (selectedContact?.id === id) {
            setSelectedContact((prev) => prev ? { ...prev, status: "new" as ContactStatus } : null);
        }
        toast.success("Đã đánh dấu chưa đọc!");
    };

    const executeDeleteContact = (id: number) => {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        setSelectedContacts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        if (selectedContact?.id === id) {
            setSelectedContact(null);
        }
        toast.success("Đã xóa tin nhắn!");
    };

    const handleDeleteContactClick = (id: number) => {
        if (shouldShowConfirmation(DELETE_CONTACT_KEY)) {
            setConfirmDialog({ isOpen: true, type: "delete_contact", itemId: id });
        } else {
            executeDeleteContact(id);
        }
    };

    // Bulk contact actions
    const handleBulkMarkAsRead = () => {
        setContacts((prev) =>
            prev.map((c) => (selectedContacts.has(c.id) ? { ...c, status: "read" as ContactStatus } : c))
        );
        setSelectedContacts(new Set());
        toast.success(`Đã đánh dấu ${selectedContacts.size} liên hệ đã đọc!`);
    };

    const handleBulkMarkAsUnread = () => {
        setContacts((prev) =>
            prev.map((c) => (selectedContacts.has(c.id) ? { ...c, status: "new" as ContactStatus } : c))
        );
        setSelectedContacts(new Set());
        toast.success(`Đã đánh dấu ${selectedContacts.size} liên hệ chưa đọc!`);
    };

    const executeBulkDeleteContacts = () => {
        setContacts((prev) => prev.filter((c) => !selectedContacts.has(c.id)));
        if (selectedContact && selectedContacts.has(selectedContact.id)) {
            setSelectedContact(null);
        }
        setSelectedContacts(new Set());
        toast.success(`Đã xóa ${selectedContacts.size} liên hệ!`);
    };

    const handleBulkDeleteContactsClick = () => {
        if (shouldShowConfirmation(BULK_DELETE_CONTACT_KEY)) {
            setConfirmDialog({ isOpen: true, type: "bulk_delete_contact", itemId: null });
        } else {
            executeBulkDeleteContacts();
        }
    };

    // Open contact detail and auto-mark as read
    const handleOpenContact = (contact: Contact) => {
        setSelectedContact(contact);
        if (contact.status === "new") {
            setContacts((prev) =>
                prev.map((c) => (c.id === contact.id ? { ...c, status: "read" as ContactStatus } : c))
            );
        }
    };

    // Send reply
    const handleSendReply = () => {
        if (!selectedContact || !replyText.trim()) return;

        const newReply: ContactReply = {
            id: Date.now(),
            message: replyText,
            date: new Date().toISOString(),
            isAdmin: true,
        };

        setContacts((prev) =>
            prev.map((c) =>
                c.id === selectedContact.id
                    ? { ...c, replies: [...c.replies, newReply] }
                    : c
            )
        );

        // Update selected contact to show the new reply
        setSelectedContact((prev) =>
            prev ? { ...prev, replies: [...prev.replies, newReply] } : null
        );

        setReplyText("");
        toast.success("Đã gửi phản hồi!");
    };

    // ============== Dialog Handlers ==============
    const handleDialogConfirm = () => {
        if (confirmDialog.type === "delete_review" && confirmDialog.itemId) {
            executeDeleteReview(confirmDialog.itemId);
        } else if (confirmDialog.type === "delete_contact" && confirmDialog.itemId) {
            executeDeleteContact(confirmDialog.itemId);
        } else if (confirmDialog.type === "bulk_delete_review") {
            executeBulkDeleteReviews();
        } else if (confirmDialog.type === "bulk_delete_contact") {
            executeBulkDeleteContacts();
        }

        setConfirmDialog({ isOpen: false, type: "delete_review", itemId: null });
    };

    const handleDialogCancel = () => {
        setConfirmDialog({ isOpen: false, type: "delete_review", itemId: null });
    };

    const handleDontShowAgain = () => {
        const keyMap = {
            delete_review: DELETE_REVIEW_KEY,
            delete_contact: DELETE_CONTACT_KEY,
            bulk_delete_review: BULK_DELETE_REVIEW_KEY,
            bulk_delete_contact: BULK_DELETE_CONTACT_KEY,
        };
        setDontShowAgain(keyMap[confirmDialog.type]);
    };

    // ============== Pagination Controls ==============
    const PaginationControls = ({
        currentPage,
        totalPages,
        onPageChange,
    }: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    }) => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                </p>
                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    // ============== Sortable Header ==============
    const SortableHeader = ({
        children,
        sortKey,
        currentSort,
        onSort,
    }: {
        children: React.ReactNode;
        sortKey: string;
        currentSort: { key: string; direction: SortDirection };
        onSort: () => void;
    }) => (
        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={onSort}>
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown
                    className={cn(
                        "h-3 w-3",
                        currentSort.key === sortKey ? "text-primary" : "text-muted-foreground"
                    )}
                />
            </div>
        </TableHead>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Quản lý Tương tác</h2>
                <p className="text-muted-foreground">
                    Xem và kiểm duyệt đánh giá khách hàng, quản lý liên hệ.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab("reviews")}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "reviews"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Đánh giá
                            {reviews.filter((r) => r.status === "pending").length > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {reviews.filter((r) => r.status === "pending").length}
                                </Badge>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("contacts")}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "contacts"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Liên hệ
                            {contacts.filter((c) => c.status === "new").length > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {contacts.filter((c) => c.status === "new").length}
                                </Badge>
                            )}
                        </div>
                    </button>
                </nav>
            </div>

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
                <div className="space-y-4">
                    {/* Search & Bulk Actions */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="review-search"
                                name="review-search"
                                placeholder="Tìm theo tên, tour hoặc nội dung..."
                                className="pl-8"
                                aria-label="Tìm kiếm đánh giá"
                                value={reviewSearchTerm}
                                onChange={(e) => {
                                    setReviewSearchTerm(e.target.value);
                                    setReviewPage(1);
                                }}
                            />
                        </div>
                        {selectedReviews.size > 0 && (
                            <BulkActionBar
                                selectedCount={selectedReviews.size}
                                actions={[
                                    {
                                        label: "Duyệt tất cả",
                                        icon: <Check className="h-4 w-4 mr-1" />,
                                        onClick: handleBulkApproveReviews,
                                    },
                                    {
                                        label: "Ẩn tất cả",
                                        icon: <EyeOff className="h-4 w-4 mr-1" />,
                                        onClick: handleBulkHideReviews,
                                    },
                                    {
                                        label: "Xóa tất cả",
                                        icon: <Trash className="h-4 w-4 mr-1" />,
                                        onClick: handleBulkDeleteReviewsClick,
                                        variant: "destructive",
                                    },
                                ] as BulkAction[]}
                                onClearSelection={() => setSelectedReviews(new Set())}
                            />
                        )}
                    </div>

                    {/* Table */}
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input
                                            id="select-all-reviews"
                                            name="select-all-reviews"
                                            type="checkbox"
                                            checked={paginatedReviews.length > 0 && selectedReviews.size === paginatedReviews.length}
                                            onChange={toggleAllReviews}
                                            className="h-4 w-4 rounded border-gray-300"
                                            aria-label="Chọn tất cả đánh giá"
                                        />
                                    </TableHead>
                                    <TableHead>Người dùng</TableHead>
                                    <TableHead>Tour</TableHead>
                                    <SortableHeader
                                        sortKey="rating"
                                        currentSort={reviewSort}
                                        onSort={() => toggleSort("rating", reviewSort, setReviewSort)}
                                    >
                                        Đánh giá
                                    </SortableHeader>
                                    <TableHead className="max-w-[200px]">Bình luận</TableHead>
                                    <SortableHeader
                                        sortKey="date"
                                        currentSort={reviewSort}
                                        onSort={() => toggleSort("date", reviewSort, setReviewSort)}
                                    >
                                        Ngày
                                    </SortableHeader>
                                    <SortableHeader
                                        sortKey="status"
                                        currentSort={reviewSort}
                                        onSort={() => toggleSort("status", reviewSort, setReviewSort)}
                                    >
                                        Trạng thái
                                    </SortableHeader>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedReviews.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="p-0">
                                            <EmptyState
                                                message={reviewSearchTerm ? "Không tìm thấy đánh giá nào" : "Chưa có đánh giá nào"}
                                                showClearFilters={!!reviewSearchTerm}
                                                onClearFilters={() => setReviewSearchTerm("")}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedReviews.map((review) => (
                                        <TableRow key={review.id} className={selectedReviews.has(review.id) ? "bg-muted/50" : ""}>
                                            <TableCell>
                                                <input
                                                    id={`review-checkbox-${review.id}`}
                                                    name={`review-checkbox-${review.id}`}
                                                    type="checkbox"
                                                    checked={selectedReviews.has(review.id)}
                                                    onChange={() => toggleReviewSelection(review.id)}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                    aria-label={`Chọn đánh giá của ${review.userName}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{review.userName}</TableCell>
                                            <TableCell>{review.tourName}</TableCell>
                                            <TableCell>{renderStars(review.rating)}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={review.comment}>
                                                {review.comment}
                                            </TableCell>
                                            <TableCell>{formatDate(review.date)}</TableCell>
                                            <TableCell>{getReviewStatusBadge(review.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Xem chi tiết"
                                                        onClick={() => setSelectedReview(review)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {review.status !== "approved" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            title="Duyệt"
                                                            onClick={() => handleApproveReview(review.id)}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {review.status !== "hidden" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                                            title="Ẩn"
                                                            onClick={() => handleHideReview(review.id)}
                                                        >
                                                            <EyeOff className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Xóa"
                                                        onClick={() => handleDeleteReviewClick(review.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <PaginationControls
                            currentPage={reviewPage}
                            totalPages={totalReviewPages}
                            onPageChange={setReviewPage}
                        />
                    </div>
                </div>
            )}

            {/* Contacts Tab */}
            {activeTab === "contacts" && (
                <>
                    {/* Contact List View */}
                    {!selectedContact && (
                        <div className="space-y-4">
                            {/* Search & Bulk Actions */}
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="contact-search"
                                        name="contact-search"
                                        placeholder="Tìm theo tên, email hoặc chủ đề..."
                                        className="pl-8"
                                        aria-label="Tìm kiếm liên hệ"
                                        value={contactSearchTerm}
                                        onChange={(e) => {
                                            setContactSearchTerm(e.target.value);
                                            setContactPage(1);
                                        }}
                                    />
                                </div>
                                {selectedContacts.size > 0 && (
                                    <BulkActionBar
                                        selectedCount={selectedContacts.size}
                                        actions={[
                                            {
                                                label: "Đánh dấu đã đọc",
                                                icon: <CheckCircle className="h-4 w-4 mr-1" />,
                                                onClick: handleBulkMarkAsRead,
                                            },
                                            {
                                                label: "Đánh dấu chưa đọc",
                                                icon: <MailOpen className="h-4 w-4 mr-1" />,
                                                onClick: handleBulkMarkAsUnread,
                                            },
                                            {
                                                label: "Xóa tất cả",
                                                icon: <Trash className="h-4 w-4 mr-1" />,
                                                onClick: handleBulkDeleteContactsClick,
                                                variant: "destructive",
                                            },
                                        ] as BulkAction[]}
                                        onClearSelection={() => setSelectedContacts(new Set())}
                                    />
                                )}
                            </div>

                            {/* Table */}
                            <div className="rounded-md border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <input
                                                    id="select-all-contacts"
                                                    name="select-all-contacts"
                                                    type="checkbox"
                                                    checked={paginatedContacts.length > 0 && selectedContacts.size === paginatedContacts.length}
                                                    onChange={toggleAllContacts}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                    aria-label="Chọn tất cả liên hệ"
                                                />
                                            </TableHead>
                                            <TableHead>Người gửi</TableHead>
                                            <TableHead>Chủ đề</TableHead>
                                            <SortableHeader
                                                sortKey="date"
                                                currentSort={contactSort}
                                                onSort={() => toggleSort("date", contactSort, setContactSort)}
                                            >
                                                Ngày
                                            </SortableHeader>
                                            <SortableHeader
                                                sortKey="status"
                                                currentSort={contactSort}
                                                onSort={() => toggleSort("status", contactSort, setContactSort)}
                                            >
                                                Trạng thái
                                            </SortableHeader>
                                            <TableHead className="text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedContacts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="p-0">
                                                    <EmptyState
                                                        message={contactSearchTerm ? "Không tìm thấy liên hệ nào" : "Chưa có liên hệ nào"}
                                                        showClearFilters={!!contactSearchTerm}
                                                        onClearFilters={() => setContactSearchTerm("")}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedContacts.map((contact) => (
                                                <TableRow
                                                    key={contact.id}
                                                    className={cn(
                                                        "cursor-pointer hover:bg-muted/50",
                                                        selectedContacts.has(contact.id) && "bg-muted/50",
                                                        contact.status === "new" && "font-medium"
                                                    )}
                                                    onClick={() => handleOpenContact(contact)}
                                                >
                                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            id={`contact-checkbox-${contact.id}`}
                                                            name={`contact-checkbox-${contact.id}`}
                                                            type="checkbox"
                                                            checked={selectedContacts.has(contact.id)}
                                                            onChange={() => toggleContactSelection(contact.id)}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                            aria-label={`Chọn liên hệ từ ${contact.name}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className={contact.status === "new" ? "font-semibold" : ""}>{contact.name}</p>
                                                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={contact.status === "new" ? "font-semibold" : ""}>
                                                        {contact.subject}
                                                        {contact.replies.length > 0 && (
                                                            <Badge variant="outline" className="ml-2 text-xs">
                                                                {contact.replies.length} phản hồi
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{formatDate(contact.date)}</TableCell>
                                                    <TableCell>{getContactStatusBadge(contact.status)}</TableCell>
                                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-1">
                                                            {contact.status === "new" ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    title="Đánh dấu đã đọc"
                                                                    onClick={() => handleMarkAsRead(contact.id)}
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                    title="Đánh dấu chưa đọc"
                                                                    onClick={() => handleMarkAsUnread(contact.id)}
                                                                >
                                                                    <MailOpen className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                title="Xóa"
                                                                onClick={() => handleDeleteContactClick(contact.id)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                                <PaginationControls
                                    currentPage={contactPage}
                                    totalPages={totalContactPages}
                                    onPageChange={setContactPage}
                                />
                            </div>
                        </div>
                    )}

                    {/* Contact Detail View (Gmail-style full width) */}
                    {selectedContact && (
                        <div className="space-y-4">
                            {/* Back Button & Actions Header */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedContact(null)}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Quay lại danh sách
                                </Button>
                                <div className="flex items-center gap-2">
                                    {selectedContact.status === "read" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                            onClick={() => handleMarkAsUnread(selectedContact.id)}
                                        >
                                            <MailOpen className="h-4 w-4 mr-1" />
                                            Đánh dấu chưa đọc
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            handleDeleteContactClick(selectedContact.id);
                                        }}
                                    >
                                        <Trash className="h-4 w-4 mr-1" />
                                        Xóa
                                    </Button>
                                </div>
                            </div>

                            {/* Email Detail Card */}
                            <div className="rounded-lg border bg-card">
                                {/* Email Header */}
                                <div className="p-6 border-b">
                                    <div className="flex items-start justify-between mb-4">
                                        <h2 className="text-xl font-semibold">{selectedContact.subject}</h2>
                                        {getContactStatusBadge(selectedContact.status)}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                            {selectedContact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{selectedContact.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground ml-auto">
                                            {formatDateTime(selectedContact.date)}
                                        </p>
                                    </div>
                                </div>

                                {/* Conversation Thread */}
                                <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
                                    {/* Original Message */}
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                                    </div>

                                    {/* Replies */}
                                    {selectedContact.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className={cn(
                                                "rounded-lg p-4",
                                                reply.isAdmin ? "bg-primary/5 border-l-4 border-primary ml-6" : "bg-muted/30"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                                                        reply.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"
                                                    )}>
                                                        {reply.isAdmin ? "A" : selectedContact.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-sm">
                                                        {reply.isAdmin ? "Visita Admin" : selectedContact.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDateTime(reply.date)}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Input */}
                                <div className="p-6 border-t bg-muted/20">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-muted-foreground">Phản hồi:</p>
                                        <textarea
                                            id="contact-reply"
                                            name="contact-reply"
                                            className="w-full min-h-[120px] p-4 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                            placeholder="Nhập nội dung phản hồi..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            aria-label="Nhập nội dung phản hồi"
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                                                <Send className="h-4 w-4 mr-2" />
                                                Gửi phản hồi
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Review Detail Modal */}
            <Modal
                isOpen={!!selectedReview}
                onClose={() => setSelectedReview(null)}
                title="Chi tiết đánh giá"
                className="max-w-lg"
            >
                {selectedReview && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{selectedReview.userName}</p>
                                <p className="text-sm text-muted-foreground">{formatDateTime(selectedReview.date)}</p>
                            </div>
                            {getReviewStatusBadge(selectedReview.status)}
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Tour</p>
                            <p className="font-medium">{selectedReview.tourName}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Đánh giá</p>
                            <div className="flex items-center gap-2">
                                {renderStars(selectedReview.rating, "md")}
                                <span className="text-sm">({selectedReview.rating}/5)</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Bình luận</p>
                            <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                                {selectedReview.comment}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            {selectedReview.status !== "approved" && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleApproveReview(selectedReview.id)}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Duyệt
                                </Button>
                            )}
                            {selectedReview.status !== "hidden" && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleHideReview(selectedReview.id)}
                                >
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Ẩn
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                onClick={() => handleDeleteReviewClick(selectedReview.id)}
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Xóa
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                title={
                    confirmDialog.type.includes("review") ? "Xóa đánh giá" : "Xóa liên hệ"
                }
                message={
                    confirmDialog.type.includes("bulk")
                        ? `Bạn có chắc chắn muốn xóa ${confirmDialog.type === "bulk_delete_review" ? selectedReviews.size : selectedContacts.size} mục đã chọn không? Hành động này không thể hoàn tác.`
                        : confirmDialog.type === "delete_review"
                            ? "Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác."
                            : "Bạn có chắc chắn muốn xóa liên hệ này không? Hành động này không thể hoàn tác."
                }
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                showDontShowAgain
                onDontShowAgainChange={handleDontShowAgain}
            />
        </div>
    );
}
