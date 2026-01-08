import { forwardRef } from "react";
import { REGION_MAP } from "@/api/mappers/tourMapper";

export interface RegionSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    placeholder?: string;
}

/**
 * Reusable region select dropdown.
 * Uses REGION_MAP as single source of truth for region options.
 */
export const RegionSelect = forwardRef<HTMLSelectElement, RegionSelectProps>(
    ({ className, placeholder = "-- Chọn miền --", ...props }, ref) => {
        // Convert REGION_MAP to array of [backendValue, vietnameseLabel]
        const regionOptions = Object.entries(REGION_MAP);

        return (
            <select
                ref={ref}
                autoComplete="off"
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {regionOptions.map(([backendValue, vietnameseLabel]) => (
                    <option key={backendValue} value={vietnameseLabel}>
                        {vietnameseLabel}
                    </option>
                ))}
            </select>
        );
    }
);

RegionSelect.displayName = "RegionSelect";

// Export default region for form initialization
export const DEFAULT_REGION = REGION_MAP.CENTRAL; // "Miền Trung"
