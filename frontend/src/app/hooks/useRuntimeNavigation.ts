import { useEffect, useMemo, useState } from "react";
import { preloadPageModule } from "../routes/pageRegistry";
import { isReactManagedPath, parseLocationState, resolveCanonicalRuntimePath, resolvePageFromPath } from "../routes/runtime";
import { getNavigationEventName, navigate, replace } from "../../lib/navigation/runtime";
import { prefetchRoutePageData } from "../../lib/api/client";

function getCurrentLocationState() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function useRuntimeNavigation() {
  const [locationState, setLocationState] = useState(getCurrentLocationState);
  const [routeLoading, setRouteLoading] = useState(false);
  const location = useMemo(() => parseLocationState(locationState), [locationState]);
  const page = useMemo(() => resolvePageFromPath(location.pathname, location.search), [location.pathname, location.search]);

  useEffect(() => {
    const canonicalPath = resolveCanonicalRuntimePath();
    if (canonicalPath && canonicalPath !== `${location.pathname}${location.search}`) {
      replace(canonicalPath);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    void preloadPageModule(page);
  }, [page]);

  useEffect(() => {
    const prefetchedHrefSet = new Set<string>();

    function scheduleRoutePrefetch(url: URL) {
      if (url.origin !== window.location.origin || !isReactManagedPath(url.pathname)) {
        return;
      }
      const cacheKey = `${url.pathname}${url.search}`;
      if (prefetchedHrefSet.has(cacheKey)) {
        return;
      }
      prefetchedHrefSet.add(cacheKey);
      const nextPage = resolvePageFromPath(url.pathname, url.search);
      void preloadPageModule(nextPage);
      void prefetchRoutePageData(nextPage, url.search).catch(() => undefined);
    }

    function syncLocation() {
      setLocationState(getCurrentLocationState());
      setRouteLoading(false);
    }

    async function handleReactNavigation(nextUrl: URL) {
      setRouteLoading(true);
      try {
        const nextPage = resolvePageFromPath(nextUrl.pathname, nextUrl.search);
        await Promise.all([
          preloadPageModule(nextPage),
          prefetchRoutePageData(nextPage, nextUrl.search).catch(() => undefined)
        ]);
      } finally {
        navigate(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
      }
    }

    function handleDocumentHover(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.hasAttribute("download") || anchor.target === "_blank") {
        return;
      }
      scheduleRoutePrefetch(new URL(anchor.href, window.location.origin));
    }

    function handleDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented) {
        return;
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.hasAttribute("download") || anchor.target === "_blank") {
        return;
      }
      const nextUrl = new URL(anchor.href, window.location.origin);
      if (nextUrl.origin !== window.location.origin || !isReactManagedPath(nextUrl.pathname)) {
        return;
      }
      event.preventDefault();
      void handleReactNavigation(nextUrl);
    }

    window.addEventListener("popstate", syncLocation);
    window.addEventListener(getNavigationEventName(), syncLocation);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("mouseover", handleDocumentHover);
    document.addEventListener("focusin", handleDocumentHover);
    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener(getNavigationEventName(), syncLocation);
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("mouseover", handleDocumentHover);
      document.removeEventListener("focusin", handleDocumentHover);
    };
  }, []);

  return {
    locationState,
    location,
    page,
    routeLoading,
    setRouteLoading
  };
}
