import { useEffect, useRef, useState } from "react";
import { fetchScreenCommandPage, type ScreenCommandEvent, type ScreenCommandPagePayload, type ScreenCommandSurface } from "../../lib/api/client";
import { isReactManagedPath, resolvePageFromPath } from "../routes/runtime";

export type MatchedContext = {
  page: ScreenCommandPagePayload["page"];
  surface?: ScreenCommandSurface;
  event?: ScreenCommandEvent;
  highlightElement: Element;
};

type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
  pageId: string;
  routePath: string;
  pageData: ScreenCommandPagePayload | null;
  match: MatchedContext | null;
};

const INTERACTIVE_TARGET_SELECTOR = [
  "input",
  "select",
  "textarea",
  "button",
  "a",
  "label",
  "th",
  "td"
].join(", ");

const BROAD_CONTAINER_SELECTOR = [
  "[data-help-id]",
  "form",
  "section",
  "article",
  "table",
  ".gov-card"
].join(", ");

function safelyClosest(element: Element, selector: string): Element | null {
  const normalized = selector.trim();
  if (!normalized) {
    return null;
  }
  try {
    return element.closest(normalized);
  } catch {
    return null;
  }
}

function resolvePreferredTargetElement(element: Element | null) {
  if (!element) {
    return null;
  }
  let current: Element | null = element;
  let fallback: Element | null = null;
  while (current && current !== document.body) {
    if (current.matches(INTERACTIVE_TARGET_SELECTOR)) {
      return current;
    }
    if (!fallback && current.tagName === "DIV" && current.parentElement?.matches(BROAD_CONTAINER_SELECTOR)) {
      fallback = current;
    }
    if (current.hasAttribute("data-help-id")) {
      return fallback || current;
    }
    current = current.parentElement;
  }
  return fallback || safelyClosest(element, INTERACTIVE_TARGET_SELECTOR) || element;
}

function resolveMatchedContext(payload: ScreenCommandPagePayload | null, element: Element | null): MatchedContext | null {
  if (!payload?.page || !element) {
    return null;
  }
  const page = payload.page;
  const targetElement = resolvePreferredTargetElement(element);
  const matchedSurface = [...(page.surfaces || [])]
    .map((surface) => ({
      surface,
      matchedElement: (targetElement ? safelyClosest(targetElement, surface.selector) : null) || safelyClosest(element, surface.selector)
    }))
    .filter((item): item is { surface: ScreenCommandSurface; matchedElement: Element } => Boolean(item.matchedElement))
    .sort((left, right) => right.surface.selector.length - left.surface.selector.length)[0];
  const highlightElement = targetElement || matchedSurface?.matchedElement || element;
  const surface = matchedSurface?.surface;
  const relatedEvents = (page.events || []).filter((event) => !surface?.eventIds?.length || surface.eventIds.includes(event.eventId));
  const event = relatedEvents.find((item) => Boolean((targetElement ? safelyClosest(targetElement, item.triggerSelector) : null) || safelyClosest(element, item.triggerSelector)))
    || relatedEvents[0]
    || (page.events || [])[0];
  return {
    page,
    surface,
    event,
    highlightElement
  };
}

function resolveContextTargetFromElement(element: Element | null, fallbackPageId: string, fallbackRoutePath: string) {
  if (!element) {
    return { pageId: fallbackPageId, routePath: fallbackRoutePath };
  }
  const anchor = element.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return { pageId: fallbackPageId, routePath: fallbackRoutePath };
  }
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) {
    return { pageId: fallbackPageId, routePath: fallbackRoutePath };
  }
  const nextUrl = new URL(anchor.href, window.location.origin);
  if (nextUrl.origin !== window.location.origin || !isReactManagedPath(nextUrl.pathname)) {
    return { pageId: fallbackPageId, routePath: fallbackRoutePath };
  }
  return {
    pageId: resolvePageFromPath(nextUrl.pathname, nextUrl.search),
    routePath: `${nextUrl.pathname}${nextUrl.search}`
  };
}

function measureHighlightRect(element: Element | null) {
  if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
    return null;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}

function createClosedContextMenu(): ContextMenuState {
  return { open: false, x: 0, y: 0, pageId: "", routePath: "", pageData: null, match: null };
}

function buildHighlightLabel(match: MatchedContext | null) {
  return [match?.page?.label, match?.surface?.label, match?.event?.label].filter(Boolean).join(" / ");
}

export function useScreenContextMenu(page: string, routePath: string) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(createClosedContextMenu);
  const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [highlightLabel, setHighlightLabel] = useState("");
  const [contextComment, setContextComment] = useState("");
  const [contextTargetId, setContextTargetId] = useState("");
  const [contextActionLoading, setContextActionLoading] = useState(false);
  const [contextToast, setContextToast] = useState("");
  const contextMenuDragOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const contextMenuDraggingRef = useRef(false);
  const screenCommandCacheRef = useRef<Record<string, ScreenCommandPagePayload>>({});

  function clampContextMenuPosition(x: number, y: number) {
    return {
      x: Math.max(8, Math.min(x, window.innerWidth - 360)),
      y: Math.max(8, Math.min(y, window.innerHeight - 320))
    };
  }

  function closeContextMenu() {
    setContextMenu(createClosedContextMenu());
    setHighlightRect(null);
    setHighlightLabel("");
    setContextComment("");
    setContextTargetId("");
    setContextActionLoading(false);
  }

  useEffect(() => {
    closeContextMenu();
  }, [page, routePath]);

  useEffect(() => {
    let toastTimer: number | undefined;
    if (contextToast) {
      toastTimer = window.setTimeout(() => setContextToast(""), 5000);
    }
    return () => {
      if (toastTimer) {
        window.clearTimeout(toastTimer);
      }
    };
  }, [contextToast]);

  useEffect(() => {
    async function ensureScreenCommandPage(pageId: string) {
      if (screenCommandCacheRef.current[pageId]) {
        return screenCommandCacheRef.current[pageId];
      }
      const payload = await fetchScreenCommandPage(pageId);
      screenCommandCacheRef.current[pageId] = payload;
      return payload;
    }

    async function handleContextMenu(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element) || target.closest("[data-codex-context-menu]")) {
        return;
      }
      event.preventDefault();
      const targetContext = resolveContextTargetFromElement(target, page, routePath);
      const payload = await ensureScreenCommandPage(targetContext.pageId);
      const match = resolveMatchedContext(payload, target);
      const defaultTarget = payload.page?.changeTargets?.[0]?.targetId || "";
      setContextMenu({
        open: true,
        ...clampContextMenuPosition(event.clientX, event.clientY),
        pageId: targetContext.pageId,
        routePath: targetContext.routePath,
        pageData: payload,
        match
      });
      setContextTargetId(defaultTarget);
      setHighlightRect(measureHighlightRect(match?.highlightElement || target));
      setHighlightLabel(buildHighlightLabel(match));
    }

    function handleMouseMove(event: MouseEvent) {
      if (contextMenuDraggingRef.current && contextMenuDragOffsetRef.current) {
        const nextX = event.clientX - contextMenuDragOffsetRef.current.x;
        const nextY = event.clientY - contextMenuDragOffsetRef.current.y;
        setContextMenu((current) => current.open
          ? { ...current, ...clampContextMenuPosition(nextX, nextY) }
          : current);
        return;
      }
      if (!contextMenu.open || !contextMenu.pageData) {
        return;
      }
      const element = document.elementFromPoint(event.clientX, event.clientY);
      if (!(element instanceof Element) || element.closest("[data-codex-context-menu]")) {
        return;
      }
      const match = resolveMatchedContext(contextMenu.pageData, element);
      setContextMenu((current) => ({ ...current, match }));
      setHighlightRect(measureHighlightRect(match?.highlightElement || element));
      setHighlightLabel(buildHighlightLabel(match));
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-codex-context-menu]")) {
        return;
      }
      if (contextMenu.open) {
        closeContextMenu();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    }

    function handleMouseUp() {
      contextMenuDraggingRef.current = false;
      contextMenuDragOffsetRef.current = null;
    }

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", closeContextMenu, true);
    window.addEventListener("resize", closeContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", closeContextMenu, true);
      window.removeEventListener("resize", closeContextMenu);
    };
  }, [contextMenu.open, contextMenu.pageData, page, routePath]);

  function handleContextMenuHeaderMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    contextMenuDraggingRef.current = true;
    contextMenuDragOffsetRef.current = {
      x: event.clientX - contextMenu.x,
      y: event.clientY - contextMenu.y
    };
    event.preventDefault();
    event.stopPropagation();
  }

  const availableChangeTargets = contextMenu.pageData?.page?.changeTargets || [];
  const selectedChangeTarget = availableChangeTargets.find((item) => item.targetId === contextTargetId) || availableChangeTargets[0];

  return {
    availableChangeTargets,
    closeContextMenu,
    contextActionLoading,
    contextComment,
    contextMenu,
    contextToast,
    contextTargetId,
    handleContextMenuHeaderMouseDown,
    highlightLabel,
    highlightRect,
    selectedChangeTarget,
    setContextActionLoading,
    setContextComment,
    setContextMenu,
    setContextTargetId,
    setContextToast
  };
}
