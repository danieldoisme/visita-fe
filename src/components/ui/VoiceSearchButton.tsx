import { Mic } from "lucide-react";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { cn } from "@/lib/utils";

interface VoiceSearchButtonProps {
    onResult: (transcript: string) => void;
    onError?: (error: string) => void;
    className?: string;
    size?: "sm" | "md" | "lg";
}

/**
 * Voice search button component using Web Speech API.
 * Automatically hidden on unsupported browsers.
 */
export function VoiceSearchButton({
    onResult,
    onError,
    className,
    size = "md",
}: VoiceSearchButtonProps) {
    const { isSupported, isListening, startListening, stopListening } =
        useVoiceSearch({
            lang: "vi-VN",
            onResult,
            onError,
        });

    // Hide button if browser doesn't support speech recognition
    if (!isSupported) {
        return null;
    }

    const sizeClasses = {
        sm: "h-7 w-7",
        md: "h-9 w-9",
        lg: "h-11 w-11",
    };

    const iconSizes = {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "flex items-center justify-center rounded-full transition-all duration-200",
                "hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50",
                sizeClasses[size],
                isListening && [
                    "bg-red-100 text-red-600 hover:bg-red-200",
                    "animate-pulse",
                ],
                !isListening && "text-muted-foreground hover:text-primary",
                className
            )}
            aria-label={isListening ? "Dừng ghi âm" : "Tìm kiếm bằng giọng nói"}
            title={isListening ? "Đang nghe... (nhấp để dừng)" : "Tìm kiếm bằng giọng nói"}
        >
            <Mic className={iconSizes[size]} />
        </button>
    );
}
