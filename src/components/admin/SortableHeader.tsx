import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export interface SortState {
    key: string;
    direction: SortDirection;
}

interface SortableHeaderProps {
    children: React.ReactNode;
    sortKey: string;
    currentSort: SortState;
    onSort: (key: string) => void;
    className?: string;
}

/**
 * A reusable table header component that supports sorting.
 * Displays an arrow icon indicating current sort state.
 */
export function SortableHeader({
    children,
    sortKey,
    currentSort,
    onSort,
    className,
}: SortableHeaderProps) {
    const isActive = currentSort.key === sortKey;

    const Icon = isActive
        ? currentSort.direction === "asc"
            ? ArrowUp
            : ArrowDown
        : ArrowUpDown;

    return (
        <TableHead
            className={cn(
                "cursor-pointer select-none hover:bg-muted/50 transition-colors",
                className
            )}
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {children}
                <Icon
                    className={cn(
                        "h-3 w-3 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                    )}
                />
            </div>
        </TableHead>
    );
}
