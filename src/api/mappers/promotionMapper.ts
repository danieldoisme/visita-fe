import type { PromotionEntity, PromotionRequest } from "../generated/types.gen";
import { isAfter, isBefore, isWithinInterval, startOfDay } from "date-fns";

// ============================================================================
// TYPES
// ============================================================================

export type DiscountType = "percent" | "amount";
export type PromotionStatus = "active" | "expired" | "disabled" | "scheduled";

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  status: PromotionStatus;
  isManuallyDisabled: boolean;
}

// ============================================================================
// STATUS CALCULATION
// ============================================================================

/**
 * Calculate promotion status based on dates and manual override
 */
export const calculateStatus = (
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
    return "scheduled";
  }

  if (isWithinInterval(today, { start, end })) {
    return "active";
  }

  return "disabled";
};

// ============================================================================
// MAPPERS: BACKEND → FRONTEND
// ============================================================================

/**
 * Derive discount type from which field is populated
 */
const deriveDiscountType = (entity: PromotionEntity): DiscountType => {
  return entity.discountPercent && entity.discountPercent > 0
    ? "percent"
    : "amount";
};

/**
 * Get discount value based on type
 */
const getDiscountValue = (entity: PromotionEntity): number => {
  const type = deriveDiscountType(entity);
  return type === "percent"
    ? entity.discountPercent || 0
    : entity.discountAmount || 0;
};

/**
 * Map single PromotionEntity to frontend Promotion
 */
export const mapPromotionEntity = (entity: PromotionEntity): Promotion => {
  const startDate = entity.startDate || new Date().toISOString().split("T")[0];
  const endDate = entity.endDate || new Date().toISOString().split("T")[0];
  const isManuallyDisabled = entity.isActive === false;

  return {
    id: entity.promotionId || "",
    code: entity.code || "",
    description: entity.description || "",
    discountType: deriveDiscountType(entity),
    discountValue: getDiscountValue(entity),
    startDate,
    endDate,
    usageLimit: entity.quantity || 0,
    status: calculateStatus(startDate, endDate, isManuallyDisabled),
    isManuallyDisabled,
  };
};

/**
 * Map array of PromotionEntity to frontend Promotions
 */
export const mapPromotionEntities = (
  entities: PromotionEntity[]
): Promotion[] => {
  return entities.map(mapPromotionEntity);
};

// ============================================================================
// MAPPERS: FRONTEND → BACKEND
// ============================================================================

/**
 * Map frontend Promotion to PromotionRequest for create/update
 */
export const mapToPromotionRequest = (
  promotion: Omit<Promotion, "id" | "status">
): PromotionRequest => {
  return {
    code: promotion.code,
    description: promotion.description,
    discountAmount:
      promotion.discountType === "amount" ? promotion.discountValue : undefined,
    discountPercent:
      promotion.discountType === "percent"
        ? promotion.discountValue
        : undefined,
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    quantity: promotion.usageLimit,
  };
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calculate discount amount for a given price
 */
export const calculateDiscount = (
  promotion: Promotion,
  originalPrice: number
): number => {
  if (promotion.discountType === "percent") {
    return Math.round((originalPrice * promotion.discountValue) / 100);
  }
  return Math.min(promotion.discountValue, originalPrice);
};
