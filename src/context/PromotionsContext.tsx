import { createContext, useContext, useState, ReactNode } from "react";
import {
  type Promotion,
  type DiscountType,
  type PromotionStatus,
} from "@/api/mappers/promotionMapper";
import {
  fetchAllPromotions,
  validatePromoCodeApi,
} from "@/api/services/promotionService";

// ============== Re-export Types ==============
export type { Promotion, DiscountType, PromotionStatus };

// ============== Types ==============
export interface PromoValidationResult {
  isValid: boolean;
  error?: string;
  discountType?: DiscountType;
  discountValue?: number;
  description?: string;
}

export interface AppliedDiscount {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  finalPrice: number;
}

interface PromotionsContextType {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  refreshPromotions: () => Promise<void>;
  validatePromoCode: (code: string) => Promise<PromoValidationResult>;
  applyPromoCode: (
    code: string,
    originalPrice: number
  ) => Promise<AppliedDiscount | null>;
  calculateDiscount: (
    discountType: DiscountType,
    discountValue: number,
    originalPrice: number
  ) => number;
}

// ============== Context ==============
const PromotionsContext = createContext<PromotionsContextType | undefined>(
  undefined
);

// ============== Provider ==============
interface PromotionsProviderProps {
  children: ReactNode;
}

export function PromotionsProvider({ children }: PromotionsProviderProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllPromotions();
      setPromotions(data);
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
      setError("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  // Note: Not auto-fetching here since /admins/promotions requires admin auth.
  // Admin pages (PromotionsPage) will call refreshPromotions() explicitly.

  const calculateDiscountFn = (
    discountType: DiscountType,
    discountValue: number,
    originalPrice: number
  ): number => {
    if (discountType === "percent") {
      return Math.round((originalPrice * discountValue) / 100);
    }
    return Math.min(discountValue, originalPrice);
  };

  const validatePromoCode = async (
    code: string
  ): Promise<PromoValidationResult> => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return { isValid: false, error: "Vui lòng nhập mã khuyến mãi" };
    }

    try {
      const result = await validatePromoCodeApi(normalizedCode);

      if (!result.valid) {
        return {
          isValid: false,
          error: result.message || "Mã khuyến mãi không hợp lệ",
        };
      }

      return {
        isValid: true,
        discountType: result.discountType,
        discountValue: result.discountValue,
        description: result.description,
      };
    } catch (err) {
      console.error("Failed to validate promo code:", err);
      return { isValid: false, error: "Không thể xác thực mã khuyến mãi" };
    }
  };

  const applyPromoCode = async (
    code: string,
    originalPrice: number
  ): Promise<AppliedDiscount | null> => {
    const result = await validatePromoCode(code);

    if (!result.isValid || !result.discountType || !result.discountValue) {
      return null;
    }

    const discountAmount = calculateDiscountFn(
      result.discountType,
      result.discountValue,
      originalPrice
    );
    const finalPrice = originalPrice - discountAmount;

    return {
      code: code.trim().toUpperCase(),
      discountType: result.discountType,
      discountValue: result.discountValue,
      discountAmount,
      finalPrice: Math.max(0, finalPrice),
    };
  };

  return (
    <PromotionsContext.Provider
      value={{
        promotions,
        loading,
        error,
        refreshPromotions,
        validatePromoCode,
        applyPromoCode,
        calculateDiscount: calculateDiscountFn,
      }}
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
