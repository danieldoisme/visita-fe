import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
    /** Number of columns to render */
    columns: number;
    /** Number of rows to render (default: 5) */
    rows?: number;
    /** Whether to include a checkbox column (default: false) */
    hasCheckbox?: boolean;
}

/**
 * Consistent skeleton loader for admin tables.
 * Renders skeleton rows matching the expected table structure.
 */
export function TableSkeleton({
    columns,
    rows = 5,
    hasCheckbox = false,
}: TableSkeletonProps) {

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        {hasCheckbox && (
                            <TableHead className="w-12">
                                <Skeleton className="h-4 w-4" />
                            </TableHead>
                        )}
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {hasCheckbox && (
                                <TableCell>
                                    <Skeleton className="h-4 w-4" />
                                </TableCell>
                            )}
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton
                                        className={`h-4 ${colIndex === 0 ? "w-32" : "w-20"
                                            }`}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
