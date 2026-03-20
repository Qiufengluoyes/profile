import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { OverlayScrollbars } from 'overlayscrollbars';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const previousHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
        const previousBodyScrollBehavior = document.body.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.scrollBehavior = 'auto';

        const scrollToTop = () => {
            // Also try scrolling window and document body for broad compatibility including OverlayScrollbars
            window.scrollTo(0, 0);
            document.body.scrollTo(0, 0);
            document.documentElement.scrollTo(0, 0);

            const osInstance = OverlayScrollbars(document.body);
            if (osInstance) {
                const { scrollOffsetElement, viewport } = osInstance.elements();
                scrollOffsetElement.scrollTop = 0;
                scrollOffsetElement.scrollLeft = 0;
                viewport.scrollTop = 0;
                viewport.scrollLeft = 0;
            }
        };

        scrollToTop();
        const rafId = requestAnimationFrame(scrollToTop);
        const timeoutId = window.setTimeout(scrollToTop, 30);

        const restoreRafId = requestAnimationFrame(() => {
            document.documentElement.style.scrollBehavior = previousHtmlScrollBehavior;
            document.body.style.scrollBehavior = previousBodyScrollBehavior;
        });

        return () => {
            window.clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
            cancelAnimationFrame(restoreRafId);
        };
    }, [pathname]);

    return null;
}
