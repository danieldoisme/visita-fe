/**
 * Simple hash function to convert string (e.g., UUID) to number.
 * Used for mapping backend UUIDs to frontend numeric IDs.
 */
export const hashStringToNumber = (str: string): number => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};
