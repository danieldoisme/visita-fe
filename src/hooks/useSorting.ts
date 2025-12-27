import { useState, useMemo, useCallback } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState {
    key: string;
    direction: SortDirection;
}

export type SortConfig<T> = {
    [K in keyof T]?: "string" | "number" | "date";
};

interface UseSortingOptions<T> {
    /** Initial sort state */
    defaultSort: SortState;
    /** Configuration for how to sort each key */
    sortConfig: SortConfig<T>;
}

interface UseSortingReturn<T> {
    /** Current sort state */
    sort: SortState;
    /** Toggle sort on a given key */
    toggleSort: (key: string) => void;
    /** Sort an array of data based on current sort state */
    sortData: (data: T[]) => T[];
}

/**
 * A reusable hook for managing table sorting state and logic.
 * Supports sorting by string, number, and date types.
 */
export function useSorting<T extends object>({
    defaultSort,
    sortConfig,
}: UseSortingOptions<T>): UseSortingReturn<T> {
    const [sort, setSort] = useState<SortState>(defaultSort);

    const toggleSort = useCallback((key: string) => {
        setSort((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "desc" };
        });
    }, []);

    const sortData = useMemo(() => {
        return (data: T[]): T[] => {
            const sortType = sortConfig[sort.key as keyof T] || "string";

            return [...data].sort((a, b) => {
                const aValue = a[sort.key as keyof T];
                const bValue = b[sort.key as keyof T];

                let comparison = 0;

                if (sortType === "number") {
                    comparison = (Number(aValue) || 0) - (Number(bValue) || 0);
                } else if (sortType === "date") {
                    const aDate = new Date(aValue as string).getTime();
                    const bDate = new Date(bValue as string).getTime();
                    comparison = aDate - bDate;
                } else {
                    // string comparison
                    comparison = String(aValue || "").localeCompare(String(bValue || ""));
                }

                return sort.direction === "asc" ? comparison : -comparison;
            });
        };
    }, [sort, sortConfig]);

    return { sort, toggleSort, sortData };
}
