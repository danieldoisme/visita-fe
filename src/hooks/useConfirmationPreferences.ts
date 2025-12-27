import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "visita_confirmation_preferences";

interface ConfirmationPreferences {
  [key: string]: boolean; // true = don't show again
}

/**
 * Hook to manage "don't show again" preferences for confirmation dialogs.
 * Preferences are persisted in localStorage.
 */
export function useConfirmationPreferences() {
  const [preferences, setPreferences] = useState<ConfirmationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Sync to localStorage when preferences change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  /**
   * Check if the confirmation dialog should be shown for a given action key.
   * Returns true if dialog should show, false if user opted to not show again.
   */
  const shouldShowConfirmation = useCallback(
    (key: string): boolean => {
      return !preferences[key];
    },
    [preferences]
  );

  /**
   * Mark a confirmation dialog as "don't show again".
   */
  const setDontShowAgain = useCallback((key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: true,
    }));
  }, []);

  /**
   * Restore all confirmation dialogs to show again.
   * Used in Settings page to reset all preferences.
   */
  const restoreAllConfirmations = useCallback(() => {
    setPreferences({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Check if any confirmations have been dismissed.
   */
  const hasDismissedConfirmations = useCallback((): boolean => {
    return Object.keys(preferences).length > 0;
  }, [preferences]);

  return {
    shouldShowConfirmation,
    setDontShowAgain,
    restoreAllConfirmations,
    hasDismissedConfirmations,
  };
}
