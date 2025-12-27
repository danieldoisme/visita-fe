import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

/**
 * Configuration for a single export column.
 * Maps data keys to Excel column headers with optional formatting.
 */
export interface ExportColumn<T> {
    /** The header text to display in Excel */
    header: string;
    /** The key to extract from each data item */
    key: keyof T;
    /** Optional formatter to transform the value before export */
    formatter?: (value: T[keyof T], item: T) => string | number;
}

/**
 * Configuration for the Excel export.
 */
export interface ExportConfig<T> {
    /** Column definitions for the export */
    columns: ExportColumn<T>[];
    /** Optional sheet name (default: "Sheet1") */
    sheetName?: string;
}

/**
 * Return type for the useExcelExport hook.
 */
export interface UseExcelExportReturn {
    /** Export data to an Excel file */
    exportToExcel: <T extends object>(
        data: T[],
        filename: string,
        config: ExportConfig<T>
    ) => Promise<void>;
    /** Whether an export is currently in progress */
    isExporting: boolean;
}

/**
 * A reusable hook for exporting data to Excel files.
 * Supports generic data types, column configuration, and custom formatters.
 *
 * @example
 * ```tsx
 * const { exportToExcel, isExporting } = useExcelExport();
 *
 * const handleExport = () => {
 *   exportToExcel(users, "users_export", {
 *     columns: [
 *       { header: "Name", key: "fullName" },
 *       { header: "Email", key: "email" },
 *       { header: "Created", key: "createdAt", formatter: (v) => new Date(v).toLocaleDateString() }
 *     ],
 *     sheetName: "Users"
 *   });
 * };
 * ```
 */
export function useExcelExport(): UseExcelExportReturn {
    const [isExporting, setIsExporting] = useState(false);

    const exportToExcel = useCallback(async <T extends object>(
        data: T[],
        filename: string,
        config: ExportConfig<T>
    ): Promise<void> => {
        if (data.length === 0) {
            toast.warning("Không có dữ liệu để xuất");
            return;
        }

        setIsExporting(true);

        try {
            // Transform data according to column configuration
            const exportData = data.map((item) => {
                const row: Record<string, string | number> = {};
                config.columns.forEach((col) => {
                    const value = item[col.key];
                    if (col.formatter) {
                        row[col.header] = col.formatter(value, item);
                    } else {
                        // Handle null/undefined values
                        row[col.header] = value !== null && value !== undefined
                            ? String(value)
                            : "";
                    }
                });
                return row;
            });

            // Create worksheet from data
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Auto-size columns based on content
            const colWidths = config.columns.map((col) => {
                const headerLength = col.header.length;
                const maxDataLength = Math.max(
                    ...exportData.map((row) => String(row[col.header] || "").length)
                );
                return { wch: Math.max(headerLength, maxDataLength) + 2 };
            });
            worksheet["!cols"] = colWidths;

            // Create workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                config.sheetName || "Sheet1"
            );

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            // Create blob and trigger download
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // Ensure filename has .xlsx extension
            const finalFilename = filename.endsWith(".xlsx")
                ? filename
                : `${filename}.xlsx`;

            saveAs(blob, finalFilename);
            toast.success(`Đã xuất file ${finalFilename} thành công!`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Không thể xuất file. Vui lòng thử lại.");
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { exportToExcel, isExporting };
}
