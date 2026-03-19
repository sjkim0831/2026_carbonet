import type { ReactNode } from "react";
import type { ScreenBuilderNode } from "../../lib/api/client";

export function resolveScreenBuilderQuery(searchParams: { get(name: string): string | null }): {
  menuCode: string;
  pageId: string;
  menuTitle: string;
  menuUrl: string;
} {
  return {
    menuCode: searchParams.get("menuCode") || "",
    pageId: searchParams.get("pageId") || "",
    menuTitle: searchParams.get("menuTitle") || "",
    menuUrl: searchParams.get("menuUrl") || ""
  };
}

export function sortScreenBuilderNodes(nodes: ScreenBuilderNode[]) {
  return [...nodes].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function renderScreenBuilderNodePreview(node: ScreenBuilderNode, nodes: ScreenBuilderNode[], en: boolean): ReactNode {
  const children = sortScreenBuilderNodes(nodes.filter((item) => (item.parentNodeId || "") === node.nodeId));
  const props = node.props || {};
  const key = node.nodeId;
  switch (node.componentType) {
    case "page":
      return <div key={key} className="space-y-4">{children.map((child) => renderScreenBuilderNodePreview(child, nodes, en))}</div>;
    case "section":
      return (
        <section key={key} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4 shadow-sm">
          <div className="mb-3 border-b border-[var(--kr-gov-border-light)] pb-2 text-sm font-black text-[var(--kr-gov-text-primary)]">
            {String(props.title || (en ? "Section" : "섹션"))}
          </div>
          <div className="space-y-3">{children.map((child) => renderScreenBuilderNodePreview(child, nodes, en))}</div>
        </section>
      );
    case "heading":
      return <h3 key={key} className="text-lg font-black text-[var(--kr-gov-text-primary)]">{String(props.text || (en ? "Heading" : "제목"))}</h3>;
    case "text":
      return <p key={key} className="text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{String(props.text || (en ? "Description" : "설명"))}</p>;
    case "input":
      return (
        <label key={key} className="block">
          <span className="gov-label">{String(props.label || (en ? "Input" : "입력"))}</span>
          <input className="gov-input" placeholder={String(props.placeholder || "")} readOnly />
        </label>
      );
    case "textarea":
      return (
        <label key={key} className="block">
          <span className="gov-label">{String(props.label || (en ? "Textarea" : "긴 입력"))}</span>
          <textarea className="gov-input min-h-[110px] py-3" placeholder={String(props.placeholder || "")} readOnly rows={4} />
        </label>
      );
    case "select":
      return (
        <label key={key} className="block">
          <span className="gov-label">{String(props.label || (en ? "Select" : "선택"))}</span>
          <select className="gov-select" defaultValue="">
            <option value="">{String(props.placeholder || (en ? "Select an option" : "옵션 선택"))}</option>
          </select>
        </label>
      );
    case "checkbox":
      return (
        <label key={key} className="flex items-center gap-2 text-sm font-medium text-[var(--kr-gov-text-primary)]">
          <input type="checkbox" />
          <span>{String(props.label || (en ? "Checkbox" : "체크박스"))}</span>
        </label>
      );
    case "button":
      return (
        <button
          key={key}
          className={`inline-flex items-center justify-center rounded-[var(--kr-gov-radius)] px-4 py-2 text-sm font-bold ${
            String(props.variant || "primary") === "secondary"
              ? "border border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-primary)]"
              : "border border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] text-white"
          }`}
          type="button"
        >
          {String(props.label || (en ? "Button" : "버튼"))}
        </button>
      );
    default:
      return (
        <div key={key} className="rounded border border-dashed border-[var(--kr-gov-border-light)] px-3 py-2 text-xs text-[var(--kr-gov-text-secondary)]">
          {node.componentType}
        </div>
      );
  }
}
