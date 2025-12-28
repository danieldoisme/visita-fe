/**
 * Date utility functions for tour filtering
 */

/**
 * Check if a tour's date range overlaps with the selected filter date range.
 * Returns true if there's any overlap between the two date ranges.
 * 
 * @param tourStart - Tour start date (ISO format "YYYY-MM-DD")
 * @param tourEnd - Tour end date (ISO format "YYYY-MM-DD")
 * @param filterStart - Filter start date (ISO format "YYYY-MM-DD")
 * @param filterEnd - Filter end date (ISO format "YYYY-MM-DD")
 * @returns true if dates overlap, false otherwise
 */
export function matchesDateRange(
    tourStart?: string,
    tourEnd?: string,
    filterStart?: string,
    filterEnd?: string
): boolean {
    // If no filter dates provided, match all tours
    if (!filterStart && !filterEnd) {
        return true;
    }

    // If tour has no dates, still show it (backward compatibility)
    // This allows existing tours without dates to appear in results
    if (!tourStart || !tourEnd) {
        return true;
    }

    const tourStartDate = new Date(tourStart);
    const tourEndDate = new Date(tourEnd);

    // If only start filter is provided, tour must start on or after that date
    if (filterStart && !filterEnd) {
        const filterStartDate = new Date(filterStart);
        return tourStartDate >= filterStartDate;
    }

    // If only end filter is provided, tour must end on or before that date
    if (!filterStart && filterEnd) {
        const filterEndDate = new Date(filterEnd);
        return tourEndDate <= filterEndDate;
    }

    // Both filter dates provided - check for overlap
    const filterStartDate = new Date(filterStart!);
    const filterEndDate = new Date(filterEnd!);

    // Two ranges overlap if: tourStart <= filterEnd AND tourEnd >= filterStart
    return tourStartDate <= filterEndDate && tourEndDate >= filterStartDate;
}
