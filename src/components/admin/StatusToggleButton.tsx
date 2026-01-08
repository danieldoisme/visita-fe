import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface StatusToggleButtonProps {
    isActive: boolean;
    onToggle: () => Promise<void>;
    disabled?: boolean;
}

/**
 * A toggle button for tour status (active/inactive).
 * Shows visual indication of current status and loading state during API call.
 */
export function StatusToggleButton({
    isActive,
    onToggle,
    disabled = false,
}: StatusToggleButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            await onToggle();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={disabled || loading}
            title={isActive ? "Hoạt động - Click để đóng" : "Đã đóng - Click để mở"}
            className={isActive ? "text-green-600 hover:text-green-700" : "text-muted-foreground hover:text-foreground"}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isActive ? (
                <ToggleRight className="h-4 w-4" />
            ) : (
                <ToggleLeft className="h-4 w-4" />
            )}
        </Button>
    );
}
