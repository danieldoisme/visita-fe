import {
    getAllPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    updatePromotionStatus,
    validatePromoCode,
} from "@/api/generated/sdk.gen";
import {
    type Promotion,
    mapPromotionEntities,
    mapPromotionEntity,
    mapToPromotionRequest,
} from "@/api/mappers/promotionMapper";

// ============================================================================
// ADMIN: FETCH ALL PROMOTIONS
// ============================================================================

export const fetchAllPromotions = async (): Promise<Promotion[]> => {
    const response = await getAllPromotions();

    if (response.data?.result) {
        return mapPromotionEntities(response.data.result);
    }

    throw new Error("Failed to fetch promotions");
};

// ============================================================================
// ADMIN: CREATE PROMOTION
// ============================================================================

export const createPromotionApi = async (
    promotion: Omit<Promotion, "id" | "status" | "usedCount">
): Promise<Promotion> => {
    const request = mapToPromotionRequest(promotion);

    const response = await createPromotion({
        body: request,
    });

    if (response.data?.result) {
        return mapPromotionEntity(response.data.result);
    }

    throw new Error("Failed to create promotion");
};

// ============================================================================
// ADMIN: UPDATE PROMOTION
// ============================================================================

export const updatePromotionApi = async (
    id: string,
    promotion: Omit<Promotion, "id" | "status" | "usedCount">
): Promise<Promotion> => {
    const request = mapToPromotionRequest(promotion);

    const response = await updatePromotion({
        path: { id },
        body: request,
    });

    if (response.data?.result) {
        return mapPromotionEntity(response.data.result);
    }

    throw new Error("Failed to update promotion");
};

// ============================================================================
// ADMIN: DELETE PROMOTION
// ============================================================================

export const deletePromotionApi = async (id: string): Promise<void> => {
    const response = await deletePromotion({
        path: { id },
    });

    if (response.error) {
        throw new Error("Failed to delete promotion");
    }
};

// ============================================================================
// ADMIN: UPDATE PROMOTION STATUS
// ============================================================================

export const updatePromotionStatusApi = async (
    id: string,
    isActive: boolean
): Promise<void> => {
    const response = await updatePromotionStatus({
        path: { id },
        query: { isActive },
    });

    if (response.error) {
        throw new Error("Failed to update promotion status");
    }
};

// ============================================================================
// PUBLIC: VALIDATE PROMO CODE
// ============================================================================

export interface PromoValidationResult {
    valid: boolean;
    discountType?: "percent" | "amount";
    discountValue?: number;
    description?: string;
    message?: string;
}

export const validatePromoCodeApi = async (
    code: string
): Promise<PromoValidationResult> => {
    const response = await validatePromoCode({
        body: { code },
    });

    if (response.data?.result) {
        const result = response.data.result;
        return {
            valid: result.valid ?? false,
            discountType: result.discountType?.toLowerCase() as "percent" | "amount",
            discountValue: result.discountValue,
            description: result.description,
            message: result.message,
        };
    }

    return { valid: false, message: "Failed to validate promo code" };
};
