import { useState, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TourImage } from "@/context/TourContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Trash2,
    Star,
    GripVertical,
    ImageIcon,
    X,
    ChevronUp,
    ChevronDown,
} from "lucide-react";

interface TourImageManagerProps {
    images: TourImage[];
    onChange: (images: TourImage[]) => void;
}

// Generate a simple unique ID
const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Sortable Image Item Component
interface SortableImageItemProps {
    image: TourImage;
    index: number;
    totalCount: number;
    editingId: string | null;
    editCaption: string;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    onSetPrimary: (id: string) => void;
    onRemove: (id: string) => void;
    onStartEditCaption: (image: TourImage) => void;
    onSaveCaption: (id: string) => void;
    onCancelEdit: () => void;
    onEditCaptionChange: (value: string) => void;
}

function SortableImageItem({
    image,
    index,
    totalCount,
    editingId,
    editCaption,
    onMoveUp,
    onMoveDown,
    onSetPrimary,
    onRemove,
    onStartEditCaption,
    onSaveCaption,
    onCancelEdit,
    onEditCaptionChange,
}: SortableImageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-start gap-3 p-3 border rounded-lg bg-card ${image.isPrimary ? "ring-2 ring-primary ring-offset-1" : ""
                } ${isDragging ? "shadow-lg" : ""}`}
        >
            {/* Drag handle and reorder controls */}
            <div className="flex flex-col items-center gap-1">
                <button
                    type="button"
                    onClick={() => onMoveUp(image.id)}
                    disabled={index === 0}
                    className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Di chuyển lên"
                >
                    <ChevronUp className="h-4 w-4" />
                </button>
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
                    title="Kéo để sắp xếp"
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <button
                    type="button"
                    onClick={() => onMoveDown(image.id)}
                    disabled={index === totalCount - 1}
                    className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Di chuyển xuống"
                >
                    <ChevronDown className="h-4 w-4" />
                </button>
            </div>

            {/* Image thumbnail */}
            <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                <img
                    src={image.url}
                    alt={image.altText || image.caption || "Tour image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://placehold.co/80x80?text=Error";
                    }}
                />
                {image.isPrimary && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-medium">
                        Ảnh bìa
                    </div>
                )}
            </div>

            {/* Image info */}
            <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground truncate" title={image.url}>
                    {image.url}
                </p>
                {editingId === image.id ? (
                    <div className="flex gap-2">
                        <Input
                            id={`edit-caption-${image.id}`}
                            name={`edit-caption-${image.id}`}
                            aria-label="Chỉnh sửa chú thích"
                            value={editCaption}
                            onChange={(e) => onEditCaptionChange(e.target.value)}
                            placeholder="Chú thích"
                            className="h-8 text-sm"
                            autoFocus
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => onSaveCaption(image.id)}
                        >
                            Lưu
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={onCancelEdit}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <p
                        className="text-sm cursor-pointer hover:text-primary"
                        onClick={() => onStartEditCaption(image)}
                        title="Nhấn để chỉnh sửa chú thích"
                    >
                        {image.caption || (
                            <span className="text-muted-foreground italic">
                                Thêm chú thích...
                            </span>
                        )}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onSetPrimary(image.id)}
                    className={`p-2 rounded hover:bg-muted ${image.isPrimary
                        ? "text-yellow-500"
                        : "text-muted-foreground hover:text-yellow-500"
                        }`}
                    title={image.isPrimary ? "Ảnh bìa hiện tại" : "Đặt làm ảnh bìa"}
                    disabled={image.isPrimary}
                >
                    <Star
                        className={`h-4 w-4 ${image.isPrimary ? "fill-current" : ""}`}
                    />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(image.id)}
                    className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                    title="Xóa ảnh"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export function TourImageManager({ images, onChange }: TourImageManagerProps) {
    const [newUrl, setNewUrl] = useState("");
    const [newCaption, setNewCaption] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCaption, setEditCaption] = useState("");
    const [urlError, setUrlError] = useState<string | null>(null);

    // Sort images by order
    const sortedImages = [...images].sort((a, b) => a.order - b.order);

    // Configure sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Validate URL
    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Handle drag end
    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (over && active.id !== over.id) {
                const oldIndex = sortedImages.findIndex((img) => img.id === active.id);
                const newIndex = sortedImages.findIndex((img) => img.id === over.id);

                const reordered = arrayMove(sortedImages, oldIndex, newIndex);
                // Update order values
                const updated = reordered.map((img, index) => ({
                    ...img,
                    order: index,
                }));
                onChange(updated);
            }
        },
        [sortedImages, onChange]
    );

    // Add new image
    const handleAddImage = useCallback(() => {
        if (!newUrl.trim()) {
            setUrlError("Vui lòng nhập URL hình ảnh");
            return;
        }

        if (!isValidUrl(newUrl)) {
            setUrlError("URL không hợp lệ");
            return;
        }

        const newImage: TourImage = {
            id: generateId(),
            url: newUrl.trim(),
            isPrimary: images.length === 0, // First image is primary by default
            order: images.length,
            caption: newCaption.trim() || undefined,
        };

        onChange([...images, newImage]);
        setNewUrl("");
        setNewCaption("");
        setIsAdding(false);
        setUrlError(null);
    }, [newUrl, newCaption, images, onChange]);

    // Remove image
    const handleRemoveImage = useCallback(
        (id: string) => {
            const updated = images.filter((img) => img.id !== id);
            // If we removed the primary, make the first remaining image primary
            if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
                updated[0].isPrimary = true;
            }
            // Re-order remaining images
            const reordered = updated.map((img, index) => ({ ...img, order: index }));
            onChange(reordered);
        },
        [images, onChange]
    );

    // Set primary image
    const handleSetPrimary = useCallback(
        (id: string) => {
            const updated = images.map((img) => ({
                ...img,
                isPrimary: img.id === id,
            }));
            onChange(updated);
        },
        [images, onChange]
    );

    // Move image up (decrease order)
    const handleMoveUp = useCallback(
        (id: string) => {
            const index = sortedImages.findIndex((img) => img.id === id);
            if (index <= 0) return;

            const reordered = arrayMove(sortedImages, index, index - 1);
            const updated = reordered.map((img, i) => ({ ...img, order: i }));
            onChange(updated);
        },
        [sortedImages, onChange]
    );

    // Move image down (increase order)
    const handleMoveDown = useCallback(
        (id: string) => {
            const index = sortedImages.findIndex((img) => img.id === id);
            if (index >= sortedImages.length - 1) return;

            const reordered = arrayMove(sortedImages, index, index + 1);
            const updated = reordered.map((img, i) => ({ ...img, order: i }));
            onChange(updated);
        },
        [sortedImages, onChange]
    );

    // Start editing caption
    const handleStartEditCaption = (image: TourImage) => {
        setEditingId(image.id);
        setEditCaption(image.caption || "");
    };

    // Save caption
    const handleSaveCaption = useCallback(
        (id: string) => {
            const updated = images.map((img) =>
                img.id === id ? { ...img, caption: editCaption.trim() || undefined } : img
            );
            onChange(updated);
            setEditingId(null);
            setEditCaption("");
        },
        [images, editCaption, onChange]
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium leading-none">
                    Hình ảnh Tour ({images.length})
                </span>
                {!isAdding && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm ảnh
                    </Button>
                )}
            </div>

            {/* Add new image form */}
            {isAdding && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                    <div className="space-y-2">
                        <Input
                            id="tour-image-url"
                            name="tour-image-url"
                            aria-label="URL hình ảnh"
                            placeholder="Nhập URL hình ảnh (https://...)"
                            value={newUrl}
                            onChange={(e) => {
                                setNewUrl(e.target.value);
                                setUrlError(null);
                            }}
                            className={urlError ? "border-destructive" : ""}
                        />
                        {urlError && (
                            <p className="text-sm text-destructive">{urlError}</p>
                        )}
                    </div>
                    <Input
                        id="tour-image-caption"
                        name="tour-image-caption"
                        aria-label="Chú thích hình ảnh"
                        placeholder="Chú thích (tùy chọn)"
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleAddImage}
                        >
                            Thêm
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsAdding(false);
                                setNewUrl("");
                                setNewCaption("");
                                setUrlError(null);
                            }}
                        >
                            Hủy
                        </Button>
                    </div>
                </div>
            )}

            {/* Image list with drag and drop */}
            {sortedImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">Chưa có hình ảnh nào</p>
                    <p className="text-xs">Thêm ảnh để hiển thị cho tour</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedImages.map((img) => img.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {sortedImages.map((image, index) => (
                                <SortableImageItem
                                    key={image.id}
                                    image={image}
                                    index={index}
                                    totalCount={sortedImages.length}
                                    editingId={editingId}
                                    editCaption={editCaption}
                                    onMoveUp={handleMoveUp}
                                    onMoveDown={handleMoveDown}
                                    onSetPrimary={handleSetPrimary}
                                    onRemove={handleRemoveImage}
                                    onStartEditCaption={handleStartEditCaption}
                                    onSaveCaption={handleSaveCaption}
                                    onCancelEdit={() => setEditingId(null)}
                                    onEditCaptionChange={setEditCaption}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Helper text */}
            {images.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    <Star className="h-3 w-3 inline-block mr-1 fill-yellow-500 text-yellow-500" />
                    Ảnh có ngôi sao sẽ được hiển thị làm ảnh bìa. Kéo thả hoặc dùng mũi tên để sắp xếp thứ tự.
                </p>
            )}
        </div>
    );
}
