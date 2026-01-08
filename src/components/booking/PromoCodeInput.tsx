import { useState } from "react";
import { usePromotions, AppliedDiscount } from "@/context/PromotionsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { Ticket, Check, Loader2, X, Percent, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoCodeInputProps {
    originalPrice: number;
    onDiscountApplied: (discount: AppliedDiscount | null) => void;
    appliedDiscount: AppliedDiscount | null;
    className?: string;
}

export function PromoCodeInput({
    originalPrice,
    onDiscountApplied,
    appliedDiscount,
    className,
}: PromoCodeInputProps) {
    const { validatePromoCode, applyPromoCode } = usePromotions();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApply = async () => {
        if (!code.trim()) {
            setError("Vui lòng nhập mã khuyến mãi");
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await validatePromoCode(code);

        if (!result.isValid) {
            setError(result.error || "Mã không hợp lệ");
            setIsLoading(false);
            return;
        }

        const discount = await applyPromoCode(code, originalPrice);
        if (discount) {
            onDiscountApplied(discount);
            setCode("");
        }

        setIsLoading(false);
    };

    const handleRemove = () => {
        onDiscountApplied(null);
        setCode("");
        setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleApply();
        }
    };

    // Show applied discount state
    if (appliedDiscount) {
        return (
            <div className={cn("space-y-2", className)}>
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Ticket className="w-4 h-4" />
                    Mã khuyến mãi
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-green-100 rounded-full">
                            <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-green-700">
                                    {appliedDiscount.code}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                    {appliedDiscount.discountType === "percent" ? (
                                        <>
                                            <Percent className="w-3 h-3" />
                                            {appliedDiscount.discountValue}% giảm
                                        </>
                                    ) : (
                                        <>
                                            <Banknote className="w-3 h-3" />
                                            {formatCurrency(appliedDiscount.discountValue)} giảm
                                        </>
                                    )}
                                </span>
                            </div>
                            <p className="text-xs text-green-600">
                                Bạn tiết kiệm {formatCurrency(appliedDiscount.discountAmount)}
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        className="h-8 w-8 text-green-600 hover:text-red-600 hover:bg-red-50"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // Show input state
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-2 text-sm font-medium">
                <Ticket className="w-4 h-4" />
                Mã khuyến mãi
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        id="promo-code"
                        name="promo-code"
                        placeholder="Nhập mã khuyến mãi"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        autoComplete="off"
                        className={cn(
                            "font-mono uppercase",
                            error && "border-red-500 focus-visible:ring-red-500"
                        )}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleApply}
                    disabled={isLoading || !code.trim()}
                    className="min-w-[80px]"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Áp dụng"
                    )}
                </Button>
            </div>
            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
}
