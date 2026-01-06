/**
 * AI Recommendation Service
 * Integrates with the AI recommendation microservice for tour recommendations
 */

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5050';

// Response types
interface HealthResponse {
    status: string;
    tours_loaded: number;
}

interface TourRecommendationResponse {
    source_tour_id: string;
    recommendations: string[];
}

interface UserRecommendationResponse {
    user_id: string;
    based_on_tours?: string[];
    recommendations: string[];
    message?: string;
}

/**
 * Check if the AI service is healthy and available
 */
export async function checkHealth(): Promise<HealthResponse | null> {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.warn('AI Recommendation service is unavailable:', error);
        return null;
    }
}

/**
 * Get similar tour recommendations based on a tour ID
 */
export async function getRecommendationsByTour(tourId: string): Promise<string[]> {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/recommend?tour_id=${encodeURIComponent(tourId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.warn(`Failed to get tour recommendations: ${response.status}`);
            return [];
        }

        const data: TourRecommendationResponse = await response.json();
        return data.recommendations || [];
    } catch (error) {
        console.warn('Error fetching tour recommendations:', error);
        return [];
    }
}

/**
 * Get personalized recommendations for a user based on favorites and history
 */
export async function getRecommendationsForUser(userId: string): Promise<string[]> {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/recommend/user?user_id=${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.warn(`Failed to get user recommendations: ${response.status}`);
            return [];
        }

        const data: UserRecommendationResponse = await response.json();

        // If user has no history, return empty (caller should fallback)
        if (data.message || data.recommendations.length === 0) {
            return [];
        }

        return data.recommendations;
    } catch (error) {
        console.warn('Error fetching user recommendations:', error);
        return [];
    }
}

/**
 * Main recommendation function with fallback logic
 * - For logged-in users: try personalized first, fallback to tour-based
 * - For guests: use tour-based recommendations
 * 
 * @param tourId - The current tour UUID (required for fallback)
 * @param userId - The user ID (optional, for personalized recommendations)
 * @returns Array of recommended tour UUIDs
 */
export async function getRecommendations(tourId: string, userId?: string): Promise<string[]> {
    // If user is logged in, try personalized recommendations first
    if (userId) {
        const userRecs = await getRecommendationsForUser(userId);
        if (userRecs.length > 0) {
            return userRecs;
        }
    }

    // Fallback to tour-based recommendations
    return getRecommendationsByTour(tourId);
}

export default {
    checkHealth,
    getRecommendationsByTour,
    getRecommendationsForUser,
    getRecommendations,
};
