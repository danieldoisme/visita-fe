import { forwardRef } from "react";
import { CATEGORY_MAP } from "@/api/mappers/tourMapper";

export interface CategorySelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    placeholder?: string;
}

/**
 * Reusable category select dropdown.
 * Uses CATEGORY_MAP as single source of truth for category options.
 */
export const CategorySelect = forwardRef<HTMLSelectElement, CategorySelectProps>(
    ({ className, placeholder = "-- Chọn danh mục --", ...props }, ref) => {
        // Convert CATEGORY_MAP to array of [backendValue, vietnameseLabel]
        const categoryOptions = Object.entries(CATEGORY_MAP);

        return (
            <select
                ref={ref}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {categoryOptions.map(([backendValue, vietnameseLabel]) => (
                    <option key={backendValue} value={vietnameseLabel}>
                        {vietnameseLabel}
                    </option>
                ))}
            </select>
        );
    }
);

CategorySelect.displayName = "CategorySelect";

// Export default category for form initialization
export const DEFAULT_CATEGORY = CATEGORY_MAP.EXPLORATION; // "Phiêu lưu"
