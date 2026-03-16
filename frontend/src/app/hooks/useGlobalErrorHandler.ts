import { useEffect } from "react";
import { publishTelemetryEvent } from "../telemetry/events";

interface ErrorReportPayload {
  errorType: "WINDOW_ERROR" | "UNHANDLED_REJECTION" | "REACT_ERROR_BOUNDARY";
  fingerprint: string;
  message: string;
  stack?: string;
  componentStack?: string;
  pageId: string;
  timestamp: string;
  userAgent: string;
  url: string;
  line?: number;
  col?: number;
}

function generateFingerprint(message: string, url: string, line?: number): string {
  const hashInput = [message, url, line?.toString() || ""].join("|");
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `ERR_${Math.abs(hash).toString(16).toUpperCase()}`;
}

async function reportErrorToBackend(payload: ErrorReportPayload) {
  try {
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute("content") || "";
    
    const response = await fetch("/api/frontend/error/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify(payload),
      credentials: "same-origin"
    });
    
    const result = await response.json();
    if (result.status === "self_healing_triggered" || result.status === "ticket_created") {
      console.log("[GlobalErrorHandler] Auto-ticket created:", result.ticketId);
    }
  } catch (reportError) {
    console.error("[GlobalErrorHandler] Failed to report error to backend:", reportError);
  }
}

export function useGlobalErrorHandler() {
  useEffect(() => {
    const pageId = window.__CARBONET_REACT_MIGRATION__?.route || "unknown";

    function handleWindowError(event: ErrorEvent) {
      const fingerprint = generateFingerprint(event.message, event.filename, event.lineno);
      
      const payload: ErrorReportPayload = {
        errorType: "WINDOW_ERROR",
        fingerprint,
        message: event.message,
        stack: event.error?.stack,
        pageId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: event.filename,
        line: event.lineno,
        col: event.colno
      };

      console.error("[GlobalErrorHandler] Window error:", payload);

      publishTelemetryEvent({
        type: "ui_error",
        result: "window_error",
        payloadSummary: { ...payload } as Record<string, unknown>
      });

      reportErrorToBackend(payload);
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      const fingerprint = generateFingerprint(message, window.location.href);

      const payload: ErrorReportPayload = {
        errorType: "UNHANDLED_REJECTION",
        fingerprint,
        message,
        stack,
        pageId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.error("[GlobalErrorHandler] Unhandled rejection:", payload);

      publishTelemetryEvent({
        type: "ui_error",
        result: "unhandled_rejection",
        payloadSummary: { ...payload } as Record<string, unknown>
      });

      reportErrorToBackend(payload);
    }

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);
}
