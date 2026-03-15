import { useEffect } from "react";
import { publishTelemetryEvent } from "./events";
import { initializeTraceContext, updateCurrentPage } from "./traceContext";

export function usePageTelemetry(pageId: string, locale: "ko" | "en") {
  useEffect(() => {
    initializeTraceContext(pageId, locale);
    updateCurrentPage(pageId, locale);
    const enteredAt = Date.now();
    publishTelemetryEvent({
      type: "page_view",
      pageId,
      payloadSummary: {
        path: `${window.location.pathname}${window.location.search}`
      }
    });

    return () => {
      publishTelemetryEvent({
        type: "page_leave",
        pageId,
        durationMs: Date.now() - enteredAt
      });
    };
  }, [locale, pageId]);
}
