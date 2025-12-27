import { useState, useCallback, useMemo } from "react";

/**
 * Custom hook for managing table selection state and bulk actions.
 * Provides consistent selection behavior across all admin tables.
 * 
 * @template T - The type of item ID (string | number)
 */
export function useTableSelection<T extends string | number>() {
    // Set of selected item IDs
    const [selectedItems, setSelectedItems] = useState<Set<T>>(new Set());

    /**
     * Toggle selection for a single item
     */
    const toggleSelection = useCallback((id: T) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    /**
     * Toggle selection for all items on the current page
     * If all are selected, deselect all. Otherwise, select all.
     */
    const toggleAll = useCallback((items: T[]) => {
        setSelectedItems((prev) => {
            const allSelected = items.every((id) => prev.has(id));
            if (allSelected) {
                return new Set();
            }
            return new Set(items);
        });
    }, []);

    /**
     * Clear all selections
     */
    const clearSelection = useCallback(() => {
        setSelectedItems(new Set());
    }, []);

    /**
     * Check if a specific item is selected
     */
    const isSelected = useCallback(
        (id: T) => selectedItems.has(id),
        [selectedItems]
    );

    /**
     * Check if all provided items are selected
     */
    const isAllSelected = useCallback(
        (items: T[]) => items.length > 0 && items.every((id) => selectedItems.has(id)),
        [selectedItems]
    );

    /**
     * Check if some (but not all) items are selected (for indeterminate state)
     */
    const isSomeSelected = useCallback(
        (items: T[]) => {
            const count = items.filter((id) => selectedItems.has(id)).length;
            return count > 0 && count < items.length;
        },
        [selectedItems]
    );

    // Derived state
    const hasSelection = useMemo(() => selectedItems.size > 0, [selectedItems]);
    const selectedCount = useMemo(() => selectedItems.size, [selectedItems]);
    const selectedArray = useMemo(() => Array.from(selectedItems), [selectedItems]);

    return {
        // State
        selectedItems,
        selectedCount,
        selectedArray,
        hasSelection,

        // Actions
        toggleSelection,
        toggleAll,
        clearSelection,

        // Checks
        isSelected,
        isAllSelected,
        isSomeSelected,
    };
}
