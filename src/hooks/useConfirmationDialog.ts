import { useState, useCallback } from "react";
import { useConfirmationPreferences } from "./useConfirmationPreferences";

export interface DialogConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "danger" | "warning";
}

export interface UseConfirmationDialogOptions<T extends string> {
    /** Map of action types to their confirmation preference keys */
    preferenceKeyMap: Record<T, string>;
    /** Map of action types to their dialog content configuration */
    dialogContentMap: Record<T, DialogConfig>;
    /** Map of action types to their execute functions */
    actionHandlers: Record<T, (itemId?: number | null) => void | Promise<void>>;
    /** Default action type to reset to when dialog closes */
    defaultType: T;
}

export interface ConfirmationDialogState<T extends string> {
    isOpen: boolean;
    type: T;
    itemId: number | null;
}

/**
 * Custom hook to manage confirmation dialog state and actions.
 * Reduces boilerplate for confirmation dialogs across admin pages.
 */
export function useConfirmationDialog<T extends string>({
    preferenceKeyMap,
    dialogContentMap,
    actionHandlers,
    defaultType,
}: UseConfirmationDialogOptions<T>) {
    const { shouldShowConfirmation, setDontShowAgain } = useConfirmationPreferences();

    const [dialogState, setDialogState] = useState<ConfirmationDialogState<T>>({
        isOpen: false,
        type: defaultType,
        itemId: null,
    });

    /**
     * Open the confirmation dialog for a specific action type.
     * If the user has chosen "don't show again", executes the action immediately.
     */
    const openDialog = useCallback(
        (type: T, itemId: number | null = null) => {
            const preferenceKey = preferenceKeyMap[type];
            if (preferenceKey && shouldShowConfirmation(preferenceKey)) {
                setDialogState({ isOpen: true, type, itemId });
            } else {
                // Execute immediately if user disabled confirmation
                actionHandlers[type]?.(itemId);
            }
        },
        [preferenceKeyMap, shouldShowConfirmation, actionHandlers]
    );

    /**
     * Close the dialog without executing the action.
     */
    const closeDialog = useCallback(() => {
        setDialogState({ isOpen: false, type: defaultType, itemId: null });
    }, [defaultType]);

    /**
     * Confirm the action and close the dialog.
     */
    const confirmAction = useCallback(() => {
        const handler = actionHandlers[dialogState.type];
        if (handler) {
            handler(dialogState.itemId);
        }
        closeDialog();
    }, [actionHandlers, dialogState.type, dialogState.itemId, closeDialog]);

    /**
     * Handle "don't show again" checkbox change.
     */
    const handleDontShowAgain = useCallback(() => {
        const key = preferenceKeyMap[dialogState.type];
        if (key) {
            setDontShowAgain(key);
        }
    }, [preferenceKeyMap, dialogState.type, setDontShowAgain]);

    /**
     * Get the dialog content configuration for the current action type.
     */
    const getDialogContent = useCallback((): DialogConfig => {
        return (
            dialogContentMap[dialogState.type] || {
                title: "Xác nhận",
                message: "Bạn có chắc chắn muốn thực hiện hành động này?",
                variant: "default",
            }
        );
    }, [dialogContentMap, dialogState.type]);

    return {
        /** Current dialog state */
        dialogState,
        /** Open dialog for a specific action type */
        openDialog,
        /** Close the dialog */
        closeDialog,
        /** Confirm and execute the action */
        confirmAction,
        /** Handle "don't show again" checkbox */
        handleDontShowAgain,
        /** Get dialog content for current type */
        getDialogContent,
        /** Check if dialog is open */
        isOpen: dialogState.isOpen,
        /** Current action type */
        currentType: dialogState.type,
        /** Current item ID (if applicable) */
        currentItemId: dialogState.itemId,
    };
}
