import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const EXCLUDED_ROUTES = ['/nomination', '/voting', '/dashboard', '/login', '/register'];

const TIME_DELAY_MS = 10000; // 10 seconds
const INACTIVITY_MS = 45000; // 45 seconds idle
const SCROLL_DEPTH_THRESHOLD = 0.35; // 35% of page height
const EXIT_INTENT_THRESHOLD = 20; // 20px from top of viewport

const DISMISS_COOLDOWN_MS = 1 * 60 * 60 * 1000; // 1 hour
const ACTION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export const usePopupStrategy = () => {
    const { pathname } = useLocation();
    const [shouldShow, setShouldShow] = useState(false);

    // Core state Refs to prevent exhaustive re-renders and stale closures in listeners
    const triggerHandledRef = useRef(false);
    const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initial Cooldown Check 
    const isCooldownActive = () => {
        const cooldownUntil = localStorage.getItem('rwiba_banner_cooldown_until');
        if (cooldownUntil && new Date().getTime() < parseInt(cooldownUntil, 10)) {
            return true;
        }
        return false;
    };

    // Global Exclusions Check
    const isExcludedRoute = () => {
        return EXCLUDED_ROUTES.some(route => pathname.startsWith(route));
    };

    const triggerPopup = (reason: string) => {
        if (triggerHandledRef.current || isExcludedRoute() || isCooldownActive()) return;

        console.log(`[PopupStrategy] Triggered by: ${reason}`);
        triggerHandledRef.current = true;
        setShouldShow(true);
    };

    useEffect(() => {
        // Reset handled state on route change if it wasn't shown (lets users trigger it on another page if they missed it)
        if (!shouldShow) {
            triggerHandledRef.current = false;
        }

        if (isExcludedRoute() || isCooldownActive() || shouldShow) {
            return;
        }

        /* 1. Timer Delay Trigger */
        const delayTimer = setTimeout(() => {
            triggerPopup('Time Delay (10s)');
        }, TIME_DELAY_MS);

        /* 2. Scroll Depth Trigger */
        const handleScroll = () => {
            if (triggerHandledRef.current) return;

            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPercentage = scrollPosition / documentHeight;

            if (scrollPercentage >= SCROLL_DEPTH_THRESHOLD) {
                triggerPopup('Scroll Depth (35%)');
            }

            resetInactivityTimer();
        };

        /* 3. Exit Intent Trigger (Desktop usually) */
        const handleMouseLeave = (e: MouseEvent) => {
            if (triggerHandledRef.current) return;

            // If mouse moves above the top edge of the viewport
            if (e.clientY <= EXIT_INTENT_THRESHOLD) {
                triggerPopup('Exit Intent (Mouse moved to top)');
            }
            resetInactivityTimer();
        };

        /* 4. Inactivity Trigger */
        const resetInactivityTimer = () => {
            if (inactivityTimeoutRef.current) {
                clearTimeout(inactivityTimeoutRef.current);
            }
            if (!triggerHandledRef.current) {
                inactivityTimeoutRef.current = setTimeout(() => {
                    triggerPopup('Inactivity (45s idle)');
                }, INACTIVITY_MS);
            }
        };

        const handleInteraction = () => resetInactivityTimer();

        // Attach global listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);

        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keypress', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        resetInactivityTimer(); // Start inactivity timer

        return () => {
            clearTimeout(delayTimer);
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keypress', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [pathname, shouldShow]);

    // Externally exposed handlers
    const markDismissed = () => {
        setShouldShow(false);
        const until = new Date().getTime() + DISMISS_COOLDOWN_MS;
        localStorage.setItem('rwiba_banner_cooldown_until', until.toString());
    };

    const markActionTaken = () => {
        setShouldShow(false);
        const until = new Date().getTime() + ACTION_COOLDOWN_MS;
        localStorage.setItem('rwiba_banner_cooldown_until', until.toString());
    };

    const isVisible = shouldShow && !isExcludedRoute();

    return {
        isVisible,
        markDismissed,
        markActionTaken
    };
};
