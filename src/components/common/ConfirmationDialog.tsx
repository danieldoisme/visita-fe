import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "danger" | "warning";
    showDontShowAgain?: boolean;
    onDontShowAgainChange?: (checked: boolean) => void;
}

const variantConfig = {
    default: {
        icon: Info,
        iconColor: "text-blue-500",
        buttonVariant: "default" as const,
    },
    danger: {
        icon: AlertTriangle,
        iconColor: "text-red-500",
        buttonVariant: "destructive" as const,
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "text-amber-500",
        buttonVariant: "default" as const,
    },
};

export function ConfirmationDialog({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "default",
    showDontShowAgain = false,
    onDontShowAgainChange,
}: ConfirmationDialogProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const config = variantConfig[variant];
    const IconComponent = config.icon;

    const handleConfirm = () => {
        if (showDontShowAgain && dontShowAgain && onDontShowAgainChange) {
            onDontShowAgainChange(true);
        }
        onConfirm();
    };

    const handleCancel = () => {
        setDontShowAgain(false);
        onCancel();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCancel} title={title} className="max-w-md">
            <div className="flex flex-col items-center gap-4 py-4">
                <div
                    className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        variant === "danger" && "bg-red-100",
                        variant === "warning" && "bg-amber-100",
                        variant === "default" && "bg-blue-100"
                    )}
                >
                    <IconComponent className={cn("h-6 w-6", config.iconColor)} />
                </div>

                <p className="text-center text-muted-foreground">{message}</p>

                {showDontShowAgain && (
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Không hiển thị lại
                    </label>
                )}

                <div className="flex w-full gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={handleCancel}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        className="flex-1"
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
