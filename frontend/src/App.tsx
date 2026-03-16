import { Suspense, useEffect, useMemo, useState } from "react";
import { getMissingInsttWarningEventName } from "./app/telemetry/fetch";
import { usePageTelemetry } from "./app/telemetry/usePageTelemetry";
import { useTelemetryTransport } from "./app/telemetry/useTelemetryTransport";
import { useGlobalErrorHandler } from "./app/hooks/useGlobalErrorHandler";
import { getPageComponent, preloadPageModule } from "./app/routes/pageRegistry";
import { parseLocationState, resolveCanonicalRuntimePath, resolvePageFromPath, isReactManagedPath } from "./app/routes/runtime";
import { publishTelemetryEvent } from "./app/telemetry/events";
import { fetchPageHelp, getPageHelp } from "./app/screen-registry/helpContent";
import { getPageManifest } from "./app/screen-registry/pageManifests";
import { HelpOverlay } from "./components/help/HelpOverlay";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { getNavigationEventName, getRuntimeLocale, navigate, replace } from "./lib/navigation/runtime";

export default function App() {
  useTelemetryTransport();
  useGlobalErrorHandler();
  const [locationState, setLocationState] = useState(() => `${window.location.pathname}${window.location.search}${window.location.hash}`);
  const location = useMemo(() => parseLocationState(locationState), [locationState]);
  const page = useMemo(() => resolvePageFromPath(location.pathname, location.search), [location.pathname, location.search]);
  const locale = getRuntimeLocale();
  const routePath = `${location.pathname}${location.search}`;
  const manifest = getPageManifest(page);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(getPageHelp(page));
  const [insttWarning, setInsttWarning] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const CurrentPage = getPageComponent(page);
  const boundaryResetKey = `${page}|${location.pathname}|${location.search}`;

  usePageTelemetry(page, locale);

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
    function syncLocation() {
      setLocationState(`${window.location.pathname}${window.location.search}${window.location.hash}`);
      setHelpOpen(false);
      setInsttWarning("");
      setRouteLoading(false);
    }

    async function handleReactNavigation(nextUrl: URL) {
      setRouteLoading(true);
      try {
        const nextPage = resolvePageFromPath(nextUrl.pathname, nextUrl.search);
        await preloadPageModule(nextPage);
      } finally {
        navigate(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
      }
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
      if (nextUrl.origin !== window.location.origin) {
        return;
      }
      if (!isReactManagedPath(nextUrl.pathname)) {
        return;
      }
      event.preventDefault();
      void handleReactNavigation(nextUrl);
    }

    window.addEventListener("popstate", syncLocation);
    window.addEventListener(getNavigationEventName(), syncLocation);
    document.addEventListener("click", handleDocumentClick);
    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener(getNavigationEventName(), syncLocation);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;

    function handleMissingInsttWarning(event: Event) {
      const customEvent = event as CustomEvent<{ url?: string }>;
      const targetUrl = customEvent.detail?.url || routePath;
      setInsttWarning(`마스터 계정이 아닌데 요청 파라미터에 instt_id 없이 API가 실행되었습니다. 요청 경로: ${targetUrl}`);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => setInsttWarning(""), 8000);
    }

    window.addEventListener(getMissingInsttWarningEventName(), handleMissingInsttWarning as EventListener);
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener(getMissingInsttWarningEventName(), handleMissingInsttWarning as EventListener);
    };
  }, [routePath]);

  useEffect(() => {
    setHelpContent(getPageHelp(page));
    fetchPageHelp(page)
      .then((payload) => {
        if (payload) {
          setHelpContent(payload);
        }
      })
      .catch(() => undefined);
  }, [page, locationState]);

  useEffect(() => {
    if (!manifest) {
      return;
    }
    publishTelemetryEvent({
      type: "layout_render",
      pageId: page,
      payloadSummary: {
        routePath: manifest.routePath,
        layoutVersion: manifest.layoutVersion,
        componentCount: manifest.components.length
      }
    });
  }, [manifest, page, routePath]);

  return (
    <>
      <button
        className="help-fab"
        onClick={() => setHelpOpen(true)}
        type="button"
      >
        도움말
      </button>

      <HelpOverlay
        open={helpOpen}
        pageId={page}
        helpContent={helpContent}
        onClose={() => setHelpOpen(false)}
      />

      {insttWarning ? (
        <div className="fixed left-1/2 top-4 z-[1200] w-[min(960px,calc(100%-32px))] -translate-x-1/2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-warning-border)] bg-[var(--kr-gov-warning-bg)] px-5 py-4 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="text-sm font-medium text-[var(--kr-gov-text-primary)]">
              {insttWarning}
            </div>
            <button
              className="shrink-0 rounded border border-[var(--kr-gov-border-light)] bg-white px-3 py-1 text-xs font-bold text-[var(--kr-gov-text-secondary)]"
              onClick={() => setInsttWarning("")}
              type="button"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}

      {routeLoading ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/18 backdrop-blur-[1px]">
          <div className="min-w-[17rem] rounded-[calc(var(--kr-gov-radius)+6px)] border border-slate-200 bg-white/95 px-6 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
            <div className="flex items-center gap-4">
              <div className="relative h-10 w-10 shrink-0">
                <span className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
                <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[var(--kr-gov-blue)] border-r-[var(--kr-gov-blue)]" />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">페이지 이동 중</p>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">새 화면을 준비한 뒤 전환합니다.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ErrorBoundary resetKey={boundaryResetKey}>
        <Suspense fallback={<PageLoadingFallback />}>
          <CurrentPage />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

function PageLoadingFallback() {
  return null;
}
