import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useConfirmationPreferences } from "@/hooks/useConfirmationPreferences";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  BulkActionBar,
  EmptyState,
  StatusBadge,
  SortableHeader,
  reviewStatusConfig,
  contactStatusConfig,
  PaginationControls,
  ITEMS_PER_PAGE,
  type BulkAction,
  type SortState,
} from "@/components/admin";
import { formatDate, formatDateTime } from "@/lib/formatters";
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
  Trash2,
  CheckCircle,
  MessageSquare,
  Mail,
  Search,
  Send,
  Eye,
  ArrowLeft,
  MailOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============== Types ==============
import {
  useReview,
  type Review,
  type ReviewStatus,
} from "@/context/ReviewContext";

type ContactStatus = "new" | "read";
type TabType = "reviews" | "contacts";

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

// ============== Placeholder Data ==============
// TODO: Integrate with backend contacts API when available
const INITIAL_CONTACTS: Contact[] = [];

// ============== Helper Functions ==============
const getReviewStatusBadge = (status: ReviewStatus) => (
  <StatusBadge status={status} config={reviewStatusConfig} />
);

const getContactStatusBadge = (status: ContactStatus) => (
  <StatusBadge status={status} config={contactStatusConfig} />
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

// ============== Confirmation Dialog Keys ==============
const DELETE_CONTACT_KEY = "delete_contact";
const BULK_DELETE_CONTACT_KEY = "bulk_delete_contact";

export default function InteractionManagementPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("reviews");

  // Context
  const {
    reviews,
    isLoading,
    error,
    pagination,
    loadAllReviews,
    setVisibility,
  } = useReview();

  // Load reviews on mount
  useEffect(() => {
    loadAllReviews();
  }, [loadAllReviews]);

  // Data state
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  // Search state
  const [reviewSearchTerm, setReviewSearchTerm] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  // Sort state
  const [reviewSort, setReviewSort] = useState<SortState>({
    key: "date",
    direction: "desc",
  });
  const [contactSort, setContactSort] = useState<SortState>({
    key: "date",
    direction: "desc",
  });

  // Pagination state is now handled by context
  const [contactPage, setContactPage] = useState(1);

  // Selection state for bulk actions
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(
    new Set()
  );
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(
    new Set()
  );

  // Detail view state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState("");

  // Confirmation dialog
  const { shouldShowConfirmation, setDontShowAgain } =
    useConfirmationPreferences();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "delete_contact" | "bulk_delete_contact";
    itemId: number | null;
  }>({
    isOpen: false,
    type: "delete_contact",
    itemId: null,
  });

  // ============== Sorting Helper ==============
  const toggleReviewSort = (key: string) => {
    setReviewSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  const toggleContactSort = (key: string) => {
    setContactSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  // ============== Filtered, Sorted & Paginated Data ==============
  const filteredReviews = useMemo(() => {
    const search = reviewSearchTerm.toLowerCase();
    let result = reviews.filter(
      (r) =>
        r.userName.toLowerCase().includes(search) ||
        (r.tourTitle || "").toLowerCase().includes(search) ||
        r.comment.toLowerCase().includes(search)
    );

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (reviewSort.key === "date") {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  const totalContactPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);

  // For server-side pagination, filteredReviews are already the current page
  const paginatedReviews = filteredReviews;

  const paginatedContacts = useMemo(() => {
    const start = (contactPage - 1) * ITEMS_PER_PAGE;
    return filteredContacts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredContacts, contactPage]);

  // ============== Selected Items By Status (for disabled bulk actions) ==============
  const selectedReviewsWithStatus = useMemo(() => {
    const selected = reviews.filter((r) => selectedReviews.has(r.id));
    return {
      approved: selected.filter((r) => r.status === "approved").length,
      hidden: selected.filter((r) => r.status === "hidden").length,
      total: selected.length,
    };
  }, [reviews, selectedReviews]);

  const selectedContactsWithStatus = useMemo(() => {
    const selected = contacts.filter((c) => selectedContacts.has(c.id));
    return {
      new: selected.filter((c) => c.status === "new").length,
      read: selected.filter((c) => c.status === "read").length,
      total: selected.length,
    };
  }, [contacts, selectedContacts]);

  // ============== Selection Handlers ==============
  const toggleReviewSelection = (id: string) => {
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
  const handleApproveReview = async (id: string) => {
    await setVisibility(id, true);
    // Update selectedReview if it's the one being approved
    if (selectedReview?.id === id) {
      setSelectedReview((prev) =>
        prev ? { ...prev, status: "approved" } : null
      );
    }
    toast.success("Đã duyệt đánh giá!");
  };

  const handleHideReview = async (id: string) => {
    await setVisibility(id, false);
    // Update selectedReview if it's the one being hidden
    if (selectedReview?.id === id) {
      setSelectedReview((prev) =>
        prev ? { ...prev, status: "hidden" } : null
      );
    }
    toast.success("Đã ẩn đánh giá!");
  };

  // Bulk review actions
  const handleBulkApproveReviews = async () => {
    const promises = Array.from(selectedReviews).map((id) =>
      setVisibility(id, true)
    );
    await Promise.all(promises);
    setSelectedReviews(new Set());
    toast.success(`Đã duyệt ${selectedReviews.size} đánh giá!`);
  };

  const handleBulkHideReviews = async () => {
    const promises = Array.from(selectedReviews).map((id) =>
      setVisibility(id, false)
    );
    await Promise.all(promises);
    setSelectedReviews(new Set());
    toast.success(`Đã ẩn ${selectedReviews.size} đánh giá!`);
  };

  // ============== Contact Actions ==============
  const handleMarkAsRead = (id: number, silent = false) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "read" as ContactStatus } : c
      )
    );
    // Update selectedContact if it's the one being marked
    if (selectedContact?.id === id) {
      setSelectedContact((prev) =>
        prev ? { ...prev, status: "read" as ContactStatus } : null
      );
    }
    if (!silent) {
      toast.success("Đã đánh dấu đã đọc!");
    }
  };

  const handleMarkAsUnread = (id: number) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "new" as ContactStatus } : c
      )
    );
    // Also update selectedContact if it's the one being marked
    if (selectedContact?.id === id) {
      setSelectedContact((prev) =>
        prev ? { ...prev, status: "new" as ContactStatus } : null
      );
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
      prev.map((c) =>
        selectedContacts.has(c.id)
          ? { ...c, status: "read" as ContactStatus }
          : c
      )
    );
    setSelectedContacts(new Set());
    toast.success(`Đã đánh dấu ${selectedContacts.size} liên hệ đã đọc!`);
  };

  const handleBulkMarkAsUnread = () => {
    setContacts((prev) =>
      prev.map((c) =>
        selectedContacts.has(c.id)
          ? { ...c, status: "new" as ContactStatus }
          : c
      )
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
      setConfirmDialog({
        isOpen: true,
        type: "bulk_delete_contact",
        itemId: null,
      });
    } else {
      executeBulkDeleteContacts();
    }
  };

  // Open contact detail and auto-mark as read (silently)
  const handleOpenContact = (contact: Contact) => {
    if (contact.status === "new") {
      // Set selectedContact with updated status immediately
      setSelectedContact({ ...contact, status: "read" as ContactStatus });
      // Update contacts array silently
      handleMarkAsRead(contact.id, true);
    } else {
      setSelectedContact(contact);
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
    if (confirmDialog.type === "delete_contact" && confirmDialog.itemId) {
      executeDeleteContact(confirmDialog.itemId);
    } else if (confirmDialog.type === "bulk_delete_contact") {
      executeBulkDeleteContacts();
    }

    setConfirmDialog({ isOpen: false, type: "delete_contact", itemId: null });
  };

  const handleDialogCancel = () => {
    setConfirmDialog({ isOpen: false, type: "delete_contact", itemId: null });
  };

  const handleDontShowAgain = () => {
    const keyMap = {
      delete_contact: DELETE_CONTACT_KEY,
      bulk_delete_contact: BULK_DELETE_CONTACT_KEY,
    };
    setDontShowAgain(keyMap[confirmDialog.type]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Quản lý Tương tác
        </h2>
        <p className="text-muted-foreground">
          Xem và kiểm duyệt đánh giá khách hàng, quản lý liên hệ.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Đánh giá
            </div>
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "contacts"
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
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Search & Bulk Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap overflow-x-hidden p-1">
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
                  loadAllReviews(1); // Reset to page 1 on search
                }}
              />
            </div>
            {selectedReviews.size > 0 && (
              <BulkActionBar
                selectedCount={selectedReviews.size}
                actions={
                  [
                    {
                      label: "Duyệt tất cả",
                      icon: <Check className="h-4 w-4 mr-1" />,
                      onClick: handleBulkApproveReviews,
                      disabled:
                        selectedReviewsWithStatus.approved ===
                        selectedReviewsWithStatus.total,
                    },
                    {
                      label: "Ẩn tất cả",
                      icon: <EyeOff className="h-4 w-4 mr-1" />,
                      onClick: handleBulkHideReviews,
                      disabled:
                        selectedReviewsWithStatus.hidden ===
                        selectedReviewsWithStatus.total,
                    },
                  ] as BulkAction[]
                }
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
                      checked={
                        paginatedReviews.length > 0 &&
                        selectedReviews.size === paginatedReviews.length
                      }
                      ref={(el) => {
                        if (el)
                          el.indeterminate =
                            selectedReviews.size > 0 &&
                            selectedReviews.size < paginatedReviews.length;
                      }}
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
                    onSort={toggleReviewSort}
                  >
                    Đánh giá
                  </SortableHeader>
                  <TableHead className="max-w-[200px]">Bình luận</TableHead>
                  <SortableHeader
                    sortKey="date"
                    currentSort={reviewSort}
                    onSort={toggleReviewSort}
                  >
                    Ngày
                  </SortableHeader>
                  <SortableHeader
                    sortKey="status"
                    currentSort={reviewSort}
                    onSort={toggleReviewSort}
                  >
                    Trạng thái
                  </SortableHeader>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : paginatedReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <EmptyState
                        message={
                          reviewSearchTerm
                            ? "Không tìm thấy đánh giá nào"
                            : "Chưa có đánh giá nào"
                        }
                        showClearFilters={!!reviewSearchTerm}
                        onClearFilters={() => setReviewSearchTerm("")}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReviews.map((review) => (
                    <TableRow
                      key={review.id}
                      className={
                        selectedReviews.has(review.id) ? "bg-muted/50" : ""
                      }
                    >
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
                      <TableCell className="font-medium">
                        {review.userName}
                      </TableCell>
                      <TableCell>
                        {review.tourTitle || (
                          <span className="text-muted-foreground text-xs font-mono">
                            {review.tourId
                              ? `#${review.tourId.slice(0, 8)}...`
                              : "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={review.comment}
                      >
                        {review.comment}
                      </TableCell>
                      <TableCell>{formatDate(review.createdAt)}</TableCell>
                      <TableCell>
                        {getReviewStatusBadge(review.status)}
                      </TableCell>
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
                          {review.status === "hidden" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Hiện đánh giá"
                              onClick={() => handleApproveReview(review.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Ẩn đánh giá"
                              onClick={() => handleHideReview(review.id)}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => loadAllReviews(page)}
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
              <div className="flex items-center justify-between gap-4 flex-wrap overflow-x-hidden p-1">
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
                    actions={
                      [
                        {
                          label: "Đánh dấu đã đọc",
                          icon: <CheckCircle className="h-4 w-4 mr-1" />,
                          onClick: handleBulkMarkAsRead,
                          disabled:
                            selectedContactsWithStatus.read ===
                            selectedContactsWithStatus.total,
                        },
                        {
                          label: "Đánh dấu chưa đọc",
                          icon: <MailOpen className="h-4 w-4 mr-1" />,
                          onClick: handleBulkMarkAsUnread,
                          disabled:
                            selectedContactsWithStatus.new ===
                            selectedContactsWithStatus.total,
                        },
                        {
                          label: "Xóa tất cả",
                          icon: <Trash2 className="h-4 w-4 mr-1" />,
                          onClick: handleBulkDeleteContactsClick,
                          variant: "destructive",
                        },
                      ] as BulkAction[]
                    }
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
                          checked={
                            paginatedContacts.length > 0 &&
                            selectedContacts.size === paginatedContacts.length
                          }
                          ref={(el) => {
                            if (el)
                              el.indeterminate =
                                selectedContacts.size > 0 &&
                                selectedContacts.size <
                                  paginatedContacts.length;
                          }}
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
                        onSort={toggleContactSort}
                      >
                        Ngày
                      </SortableHeader>
                      <SortableHeader
                        sortKey="status"
                        currentSort={contactSort}
                        onSort={toggleContactSort}
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
                            message={
                              contactSearchTerm
                                ? "Không tìm thấy liên hệ nào"
                                : "Chưa có liên hệ nào"
                            }
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
                              onChange={() =>
                                toggleContactSelection(contact.id)
                              }
                              className="h-4 w-4 rounded border-gray-300"
                              aria-label={`Chọn liên hệ từ ${contact.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p
                                className={
                                  contact.status === "new"
                                    ? "font-semibold"
                                    : ""
                                }
                              >
                                {contact.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {contact.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell
                            className={
                              contact.status === "new" ? "font-semibold" : ""
                            }
                          >
                            {contact.subject}
                            {contact.replies.length > 0 && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs whitespace-nowrap"
                              >
                                {contact.replies.length} phản hồi
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(contact.date)}</TableCell>
                          <TableCell>
                            {getContactStatusBadge(contact.status)}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
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
                                onClick={() =>
                                  handleDeleteContactClick(contact.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedContact(null)}
                  className="gap-2 self-start"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại danh sách
                </Button>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedContact.status === "read" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => handleMarkAsUnread(selectedContact.id)}
                    >
                      <MailOpen className="h-4 w-4 mr-1" />
                      Đánh dấu chưa đọc
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleMarkAsRead(selectedContact.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Đánh dấu đã đọc
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
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>

              {/* Email Detail Card */}
              <div className="rounded-lg border bg-card">
                {/* Email Header */}
                <div className="p-4 sm:p-6 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold break-words">
                      {selectedContact.subject}
                    </h2>
                    <div className="self-start">
                      {getContactStatusBadge(selectedContact.status)}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <p className="font-medium truncate">
                          {selectedContact.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {selectedContact.email}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground sm:ml-auto whitespace-nowrap">
                      {formatDateTime(selectedContact.date)}
                    </p>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
                  {/* Original Message */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedContact.message}
                    </p>
                  </div>

                  {/* Replies */}
                  {selectedContact.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={cn(
                        "rounded-lg p-4",
                        reply.isAdmin
                          ? "bg-primary/5 border-l-4 border-primary ml-6"
                          : "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                              reply.isAdmin
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {reply.isAdmin
                              ? "A"
                              : selectedContact.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">
                            {reply.isAdmin
                              ? "Visita Admin"
                              : selectedContact.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(reply.date)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {reply.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="p-6 border-t bg-muted/20">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Phản hồi:
                    </p>
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
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                      >
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
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(selectedReview.createdAt)}
                </p>
              </div>
              {getReviewStatusBadge(selectedReview.status)}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Tour</p>
              <p className="font-medium">
                {selectedReview.tourTitle || (
                  <span className="text-muted-foreground font-mono text-sm">
                    ID: {selectedReview.tourId || "—"}
                  </span>
                )}
              </p>
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
              {selectedReview.status === "hidden" ? (
                <Button
                  onClick={() => handleApproveReview(selectedReview.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Hiện đánh giá
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  onClick={() => handleHideReview(selectedReview.id)}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ẩn đánh giá
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        title={"Xóa liên hệ"}
        message={
          confirmDialog.type.includes("bulk")
            ? `Bạn có chắc chắn muốn xóa ${selectedContacts.size} mục đã chọn không? Hành động này không thể hoàn tác.`
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
