import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Format a number as Vietnamese Dong (VND) currency.
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "1.500.000 ₫")
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

/**
 * Format a date string or Date object to Vietnamese date format (dd/MM/yyyy).
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy", { locale: vi });
}

/**
 * Format a date string or Date object to Vietnamese datetime format (dd/MM/yyyy HH:mm).
 * @param date - The date to format
 * @returns Formatted datetime string
 */
export function formatDateTime(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy HH:mm", { locale: vi });
}

/**
 * Format a date range to display string.
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Formatted date range string (e.g., "01/01/2025 - 31/12/2025")
 */
export function formatDateRange(startDate: string, endDate: string): string {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Format a booking ID with leading zeros.
 * @param id - The booking ID
 * @param digits - Number of digits (default: 4)
 * @returns Formatted ID string (e.g., "#0001")
 */
export function formatBookingId(id: number, digits: number = 4): string {
    return `#${id.toString().padStart(digits, "0")}`;
}
