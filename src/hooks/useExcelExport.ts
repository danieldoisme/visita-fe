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
    /** Column width in characters (optional) */
    width?: number;
}

/**
 * Configuration for a single sheet in multi-sheet export.
 */
export interface SheetConfig<T extends object = object> {
    /** Sheet name (max 31 chars, no special chars) */
    name: string;
    /** Data array for this sheet */
    data: T[];
    /** Column definitions */
    columns: ExportColumn<T>[];
}

/**
 * Configuration for multi-sheet Excel export.
 */
export interface MultiSheetExportConfig {
    /** Array of sheet configurations */
    sheets: SheetConfig<any>[];
    /** Report title (shown in first sheet) */
    title?: string;
    /** Include export timestamp */
    includeTimestamp?: boolean;
}

/**
 * Configuration for single-sheet Excel export.
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
    /** Export data to an Excel file (single sheet) */
    exportToExcel: <T extends object>(
        data: T[],
        filename: string,
        config: ExportConfig<T>
    ) => Promise<void>;
    /** Export data to an Excel file with multiple sheets */
    exportMultiSheet: (
        filename: string,
        config: MultiSheetExportConfig
    ) => Promise<void>;
    /** Whether an export is currently in progress */
    isExporting: boolean;
}

// ============================================================================
// STYLING HELPERS
// ============================================================================

/** Header cell style - bold with blue background */
const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "3B82F6" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
    },
};

/** Title cell style - large bold text */
const titleStyle = {
    font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
    alignment: { horizontal: "center", vertical: "center" },
};

/** Timestamp style - italic gray text */
const timestampStyle = {
    font: { italic: true, color: { rgb: "6B7280" } },
    alignment: { horizontal: "right" },
};

/**
 * Apply styles to worksheet cells (for xlsx-js-style compatibility)
 */
const applyStylesToSheet = (
    worksheet: XLSX.WorkSheet,
    headerRow: number,
    numColumns: number
): void => {
    // Apply header styles
    for (let col = 0; col < numColumns; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
        if (worksheet[cellAddress]) {
            (worksheet[cellAddress] as any).s = headerStyle;
        }
    }
};

/**
 * Format date for Vietnamese locale
 */
const formatVietnameseDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * A reusable hook for exporting data to Excel files.
 * Supports generic data types, column configuration, custom formatters,
 * and multi-sheet exports with professional styling.
 *
 * @example
 * ```tsx
 * const { exportToExcel, exportMultiSheet, isExporting } = useExcelExport();
 *
 * // Single sheet export
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
 *
 * // Multi-sheet export
 * const handleMultiExport = () => {
 *   exportMultiSheet("dashboard_report", {
 *     title: "Dashboard Report",
 *     includeTimestamp: true,
 *     sheets: [
 *       { name: "Revenue", data: revenueData, columns: revenueColumns },
 *       { name: "Users", data: usersData, columns: usersColumns },
 *     ]
 *   });
 * };
 * ```
 */
export function useExcelExport(): UseExcelExportReturn {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Transform data according to column configuration
     */
    const transformData = <T extends object>(
        data: T[],
        columns: ExportColumn<T>[]
    ): Record<string, string | number>[] => {
        return data.map((item) => {
            const row: Record<string, string | number> = {};
            columns.forEach((col) => {
                const value = item[col.key];
                if (col.formatter) {
                    row[col.header] = col.formatter(value, item);
                } else {
                    row[col.header] = value !== null && value !== undefined
                        ? String(value)
                        : "";
                }
            });
            return row;
        });
    };

    /**
     * Calculate column widths based on content
     */
    const calculateColumnWidths = <T extends object>(
        columns: ExportColumn<T>[],
        exportData: Record<string, string | number>[]
    ): { wch: number }[] => {
        return columns.map((col) => {
            if (col.width) return { wch: col.width };

            const headerLength = col.header.length;
            const maxDataLength = exportData.length > 0
                ? Math.max(
                    ...exportData.map((row) => String(row[col.header] || "").length)
                )
                : 0;
            return { wch: Math.min(Math.max(headerLength, maxDataLength) + 2, 50) };
        });
    };

    /**
     * Export data to a single-sheet Excel file
     */
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
            const exportData = transformData(data, config.columns);
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Auto-size columns
            worksheet["!cols"] = calculateColumnWidths(config.columns, exportData);

            // Apply header styles
            applyStylesToSheet(worksheet, 0, config.columns.length);

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                config.sheetName || "Sheet1"
            );

            // Generate and download
            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

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

    /**
     * Export data to a multi-sheet Excel file with professional formatting
     */
    const exportMultiSheet = useCallback(async (
        filename: string,
        config: MultiSheetExportConfig
    ): Promise<void> => {
        const hasAnyData = config.sheets.some(sheet => sheet.data.length > 0);
        if (!hasAnyData) {
            toast.warning("Không có dữ liệu để xuất");
            return;
        }

        setIsExporting(true);

        try {
            const workbook = XLSX.utils.book_new();

            // Create summary sheet if title is provided
            if (config.title) {
                const summaryData: string[][] = [];

                // Title row
                summaryData.push([config.title]);
                summaryData.push([]); // Empty row

                // Timestamp
                if (config.includeTimestamp) {
                    summaryData.push([`Xuất lúc: ${formatVietnameseDate(new Date())}`]);
                    summaryData.push([]);
                }

                // Sheet overview
                summaryData.push(["Nội dung báo cáo:"]);
                config.sheets.forEach((sheet, index) => {
                    summaryData.push([`${index + 1}. ${sheet.name} (${sheet.data.length} dòng)`]);
                });

                const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

                // Apply title style
                if (summarySheet["A1"]) {
                    (summarySheet["A1"] as any).s = titleStyle;
                }

                // Apply timestamp style
                if (config.includeTimestamp && summarySheet["A3"]) {
                    (summarySheet["A3"] as any).s = timestampStyle;
                }

                // Set column width for summary
                summarySheet["!cols"] = [{ wch: 60 }];

                // Merge title cell
                summarySheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

                XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");
            }

            // Create data sheets
            config.sheets.forEach((sheetConfig) => {
                if (sheetConfig.data.length === 0) {
                    // Create empty sheet with message
                    const emptySheet = XLSX.utils.aoa_to_sheet([
                        ["Không có dữ liệu"]
                    ]);
                    XLSX.utils.book_append_sheet(workbook, emptySheet, sheetConfig.name.slice(0, 31));
                    return;
                }

                const exportData = transformData(sheetConfig.data, sheetConfig.columns);
                const worksheet = XLSX.utils.json_to_sheet(exportData);

                // Auto-size columns
                worksheet["!cols"] = calculateColumnWidths(sheetConfig.columns, exportData);

                // Apply header styles
                applyStylesToSheet(worksheet, 0, sheetConfig.columns.length);

                // Sanitize sheet name (max 31 chars, no special chars)
                const safeName = sheetConfig.name
                    .replace(/[\\/*?[\]]/g, "")
                    .slice(0, 31);

                XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
            });

            // Generate and download
            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

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

    return { exportToExcel, exportMultiSheet, isExporting };
}
