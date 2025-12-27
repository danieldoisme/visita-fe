import { Button, ButtonProps } from "@/components/ui/button";
import { X } from "lucide-react";

export interface BulkAction {
    /** Button label */
    label: string;
    /** Icon component to display */
    icon?: React.ReactNode;
    /** Click handler */
    onClick: () => void;
    /** Button variant (default: "outline") */
    variant?: ButtonProps["variant"];
    /** Optional disabled state */
    disabled?: boolean;
}

interface BulkActionBarProps {
    /** Number of selected items */
    selectedCount: number;
    /** List of bulk actions to display */
    actions: BulkAction[];
    /** Callback to clear selection */
    onClearSelection: () => void;
}

/**
 * Inline bulk action bar that appears when items are selected.
 * Follows the pattern from InteractionManagementPage.
 */
export function BulkActionBar({
    selectedCount,
    actions,
    onClearSelection,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap animate-in slide-in-from-left-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
                Đã chọn {selectedCount}
            </span>
            <Button
                size="sm"
                variant="ghost"
                onClick={onClearSelection}
                className="h-8 px-2"
            >
                <X className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border" />
            {actions.map((action, index) => (
                <Button
                    key={index}
                    size="sm"
                    variant={action.variant || "outline"}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="h-8"
                >
                    {action.icon}
                    {action.label}
                </Button>
            ))}
        </div>
    );
}
