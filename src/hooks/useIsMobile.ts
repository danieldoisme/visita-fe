import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile-sized.
 * @param breakpoint - The max-width in pixels to consider as mobile (default: 768)
 * @returns boolean indicating if the viewport is mobile
 */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth < breakpoint;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        const handleChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches);
        };

        // Set initial value
        setIsMobile(mediaQuery.matches);

        // Listen for changes
        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, [breakpoint]);

    return isMobile;
}
