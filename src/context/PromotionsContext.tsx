import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";
import { isAfter, isBefore, isWithinInterval, startOfDay } from "date-fns";

// ============== Types ==============
export type DiscountType = "percent" | "amount";
export type PromotionStatus = "active" | "expired" | "disabled";

export interface Promotion {
    id: number;
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usedCount: number;
    status: PromotionStatus;
    isManuallyDisabled: boolean;
}

export interface PromoValidationResult {
    isValid: boolean;
    error?: string;
    promotion?: Promotion;
}

export interface AppliedDiscount {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number; // Actual amount discounted
    finalPrice: number;
}

interface PromotionsContextType {
    promotions: Promotion[];
    validatePromoCode: (code: string) => Promise<PromoValidationResult>;
    applyPromoCode: (code: string, originalPrice: number) => Promise<AppliedDiscount | null>;
    calculateDiscount: (promotion: Promotion, originalPrice: number) => number;
}

// ============== Mock Data (same as PromotionsPage) ==============
const PROMOTIONS: Promotion[] = [
    {
        id: 1,
        code: "SUMMER2025",
        description: "Khuyến mãi mùa hè - Giảm giá cho tất cả tour biển",
        discountType: "percent",
        discountValue: 15,
        startDate: "2025-06-01",
        endDate: "2025-08-31",
        usageLimit: 100,
        usedCount: 23,
        status: "active",
        isManuallyDisabled: false,
    },
    {
        id: 2,
        code: "TETHOLIDAY",
        description: "Ưu đãi Tết Nguyên Đán - Giảm trực tiếp",
        discountType: "amount",
        discountValue: 500000,
        startDate: "2025-01-15",
        endDate: "2025-02-15",
        usageLimit: 50,
        usedCount: 50,
        status: "expired",
        isManuallyDisabled: false,
    },
    {
        id: 3,
        code: "WELCOME10",
        description: "Ưu đãi khách hàng mới - Giảm 10% cho đơn đầu tiên",
        discountType: "percent",
        discountValue: 10,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        usageLimit: 500,
        usedCount: 127,
        status: "active",
        isManuallyDisabled: false,
    },
    {
        id: 4,
        code: "DALAT300K",
        description: "Giảm 300.000đ cho tất cả tour Đà Lạt",
        discountType: "amount",
        discountValue: 300000,
        startDate: "2025-03-01",
        endDate: "2025-04-30",
        usageLimit: 80,
        usedCount: 15,
        status: "disabled",
        isManuallyDisabled: true,
    },
    {
        id: 5,
        code: "VIP20",
        description: "Ưu đãi đặc biệt dành cho khách VIP",
        discountType: "percent",
        discountValue: 20,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        usageLimit: 200,
        usedCount: 198,
        status: "expired",
        isManuallyDisabled: false,
    },
];

// ============== Helper Functions ==============
const calculateStatus = (
    startDate: string,
    endDate: string,
    isManuallyDisabled: boolean
): PromotionStatus => {
    if (isManuallyDisabled) {
        return "disabled";
    }

    const today = startOfDay(new Date());
    const start = startOfDay(new Date(startDate));
    const end = startOfDay(new Date(endDate));

    if (isAfter(today, end)) {
        return "expired";
    }

    if (isBefore(today, start)) {
        return "disabled"; // Not yet started
    }

    if (isWithinInterval(today, { start, end })) {
        return "active";
    }

    return "disabled";
};

// Mock API delay
const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 500));

// ============== Context ==============
const PromotionsContext = createContext<PromotionsContextType | undefined>(
    undefined
);

// ============== Provider ==============
interface PromotionsProviderProps {
    children: ReactNode;
}

export function PromotionsProvider({ children }: PromotionsProviderProps) {
    const [promotions] = useState<Promotion[]>(PROMOTIONS);

    const calculateDiscount = (promotion: Promotion, originalPrice: number): number => {
        if (promotion.discountType === "percent") {
            return Math.round((originalPrice * promotion.discountValue) / 100);
        }
        // For fixed amount, don't exceed the original price
        return Math.min(promotion.discountValue, originalPrice);
    };

    const validatePromoCode = async (code: string): Promise<PromoValidationResult> => {
        await mockDelay(); // Simulate API call

        const normalizedCode = code.trim().toUpperCase();

        if (!normalizedCode) {
            return { isValid: false, error: "Vui lòng nhập mã khuyến mãi" };
        }

        const promotion = promotions.find(
            (p) => p.code.toUpperCase() === normalizedCode
        );

        if (!promotion) {
            return { isValid: false, error: "Mã khuyến mãi không tồn tại" };
        }

        // Recalculate status
        const currentStatus = calculateStatus(
            promotion.startDate,
            promotion.endDate,
            promotion.isManuallyDisabled
        );

        if (currentStatus === "expired") {
            return { isValid: false, error: "Mã khuyến mãi đã hết hạn" };
        }

        if (currentStatus === "disabled") {
            return { isValid: false, error: "Mã khuyến mãi không khả dụng" };
        }

        // Check usage limit
        if (promotion.usedCount >= promotion.usageLimit) {
            return { isValid: false, error: "Mã khuyến mãi đã hết lượt sử dụng" };
        }

        return { isValid: true, promotion };
    };

    const applyPromoCode = async (
        code: string,
        originalPrice: number
    ): Promise<AppliedDiscount | null> => {
        const result = await validatePromoCode(code);

        if (!result.isValid || !result.promotion) {
            return null;
        }

        const discountAmount = calculateDiscount(result.promotion, originalPrice);
        const finalPrice = originalPrice - discountAmount;

        return {
            code: result.promotion.code,
            discountType: result.promotion.discountType,
            discountValue: result.promotion.discountValue,
            discountAmount,
            finalPrice: Math.max(0, finalPrice),
        };
    };

    return (
        <PromotionsContext.Provider
            value={{ promotions, validatePromoCode, applyPromoCode, calculateDiscount }}
        >
            {children}
        </PromotionsContext.Provider>
    );
}

// ============== Hook ==============
export function usePromotions(): PromotionsContextType {
    const context = useContext(PromotionsContext);
    if (context === undefined) {
        throw new Error("usePromotions must be used within a PromotionsProvider");
    }
    return context;
}
