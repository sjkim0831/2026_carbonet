import type { HTMLAttributes, ReactNode } from "react";
import {
  AppButton,
  AppCheckbox,
  AppIconButton,
  AppInput,
  AppLinkButton,
  AppPermissionButton,
  AppRadio,
  AppSelect,
  AppTable,
  AppTextarea,
  getAppButtonClassName,
  type AppButtonSize as MemberButtonSize,
  type AppButtonVariant as MemberButtonVariant
} from "../app-ui/primitives";
export { ADMIN_BUTTON_LABELS, MEMBER_BUTTON_LABELS, MEMBER_LIST_LABELS } from "./labels";

export function getMemberButtonClassName({
  variant = "secondary",
  size = "md",
  className = ""
}: { variant?: MemberButtonVariant; size?: MemberButtonSize; className?: string } = {}) {
  return getAppButtonClassName({ variant, size, className });
}

export const MemberButton = AppButton;
export const MemberLinkButton = AppLinkButton;
export const MemberPermissionButton = AppPermissionButton;
export const MemberIconButton = AppIconButton;
export const AdminInput = AppInput;
export const AdminSelect = AppSelect;
export const AdminTextarea = AppTextarea;
export const AdminTable = AppTable;
export const AdminCheckbox = AppCheckbox;
export const AdminRadio = AppRadio;

export function MemberButtonGroup({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>{children}</div>;
}

export function MemberPageActions({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`flex flex-wrap items-center justify-end gap-2 ${className}`.trim()}>{children}</div>;
}

export function PageHeaderActions(props: HTMLAttributes<HTMLDivElement>) {
  return <MemberPageActions {...props} />;
}

export function MemberToolbar({
  left,
  right,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { left?: ReactNode; right?: ReactNode }) {
  return (
    <div {...props} className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}>
      <div className="min-w-0 flex-1">{left}</div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">{right}</div>
    </div>
  );
}

export function MemberSectionToolbar({
  title,
  meta,
  actions,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { title?: ReactNode; meta?: ReactNode; actions?: ReactNode }) {
  return (
    <MemberToolbar
      {...props}
      className={className}
      left={<div>{title ? <div className="text-sm font-bold">{title}</div> : null}{meta ? <div className="mt-1 text-sm text-gray-500">{meta}</div> : null}</div>}
      right={actions}
    />
  );
}

export function GridToolbar({
  title,
  meta,
  actions,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { title?: ReactNode; meta?: ReactNode; actions?: ReactNode }) {
  return <div {...props} className={`border-b border-[var(--kr-gov-border-light)] px-6 py-5 ${className}`.trim()}><MemberSectionToolbar actions={actions} meta={meta} title={title} /></div>;
}

export function MemberModalFooter({
  left,
  right,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { left?: ReactNode; right?: ReactNode }) {
  return (
    <div {...props} className={`flex flex-col gap-3 border-t border-[var(--kr-gov-border-light)] bg-gray-50 px-6 py-6 sm:flex-row sm:items-center ${className}`.trim()}>
      <div className="flex flex-1 flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">{right}</div>
    </div>
  );
}

type MemberPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  className?: string;
  dataHelpId?: string;
};

export function MemberPagination({ currentPage, totalPages, onPageChange, className = "", dataHelpId }: MemberPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const pageNumbers = Array.from({ length: safeTotalPages }, (_, index) => index + 1).filter((pageNumber) => Math.abs(pageNumber - safeCurrentPage) <= 2 || pageNumber === 1 || pageNumber === safeTotalPages);
  return (
    <div className={`border-t border-[var(--kr-gov-border-light)] bg-gray-50 px-6 py-4 ${className}`.trim()} data-help-id={dataHelpId}>
      <nav className="flex items-center justify-center gap-1">
        <button className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40" disabled={safeCurrentPage <= 1} onClick={() => onPageChange(1)} type="button"><span className="material-symbols-outlined">first_page</span></button>
        <button className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40" disabled={safeCurrentPage <= 1} onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))} type="button"><span className="material-symbols-outlined">chevron_left</span></button>
        <div className="mx-4 flex items-center gap-1">
          {pageNumbers.map((pageNumber) => <button className={`flex h-8 w-8 items-center justify-center rounded border text-sm ${pageNumber === safeCurrentPage ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] font-bold text-white" : "border-transparent hover:border-gray-200 hover:bg-white"}`} key={pageNumber} onClick={() => onPageChange(pageNumber)} type="button">{pageNumber}</button>)}
        </div>
        <button className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40" disabled={safeCurrentPage >= safeTotalPages} onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))} type="button"><span className="material-symbols-outlined">chevron_right</span></button>
        <button className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40" disabled={safeCurrentPage >= safeTotalPages} onClick={() => onPageChange(safeTotalPages)} type="button"><span className="material-symbols-outlined">last_page</span></button>
      </nav>
    </div>
  );
}

type MemberActionBarButton = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
};

type MemberActionBarProps = {
  primary?: ReactNode;
  secondary?: MemberActionBarButton;
  tertiary?: MemberActionBarButton;
  eyebrow?: string;
  title?: string;
  description?: ReactNode;
  className?: string;
  dataHelpId?: string;
};

function renderActionButton(button: MemberActionBarButton, baseClassName: string) {
  const content = <>{button.icon ? <span className="material-symbols-outlined text-[20px]">{button.icon}</span> : null}<span>{button.label}</span></>;
  if (button.href) {
    return <a className={`${baseClassName} ${button.className || ""}`.trim()} href={button.href}>{content}</a>;
  }
  return <button className={`${baseClassName} ${button.className || ""}`.trim()} disabled={button.disabled} onClick={button.onClick} type={button.type || "button"}>{content}</button>;
}

export function MemberActionBar({ primary, secondary, tertiary, eyebrow, title, description, className = "", dataHelpId }: MemberActionBarProps) {
  const secondaryBaseClassName = `${getMemberButtonClassName({ variant: "secondary", size: "lg" })} min-w-[160px]`;
  const tertiaryBaseClassName = `${getMemberButtonClassName({ variant: "secondary", size: "lg" })} min-w-[160px]`;
  const hasGuide = Boolean(eyebrow || title || description);
  return (
    <div className={`mt-8 border-t border-[var(--kr-gov-border-light)] pt-6 ${className}`.trim()} data-help-id={dataHelpId}>
      <div className="overflow-hidden rounded-[calc(var(--kr-gov-radius)+6px)] border border-[var(--kr-gov-border-light)] bg-[linear-gradient(135deg,rgba(241,245,249,0.72),rgba(255,255,255,0.98))] shadow-sm">
        <div className="flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex flex-1 flex-col gap-4">
            {hasGuide ? <div className="space-y-1">{eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--kr-gov-blue)]">{eyebrow}</p> : null}{title ? <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)]">{title}</h3> : null}{description ? <div className="text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{description}</div> : null}</div> : null}
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              {secondary ? renderActionButton(secondary, secondaryBaseClassName) : null}
              {tertiary ? renderActionButton(tertiary, tertiaryBaseClassName) : null}
            </div>
          </div>
          <div className="flex flex-1 items-stretch justify-end">{primary}</div>
        </div>
      </div>
    </div>
  );
}

export function DiagnosticCard({
  eyebrow,
  title,
  status,
  statusTone = "neutral",
  description,
  summary,
  actions,
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  status?: ReactNode;
  statusTone?: "neutral" | "healthy" | "warning" | "danger";
  description?: ReactNode;
  summary?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const toneClassName = statusTone === "healthy" ? "bg-emerald-100 text-emerald-700" : statusTone === "warning" ? "bg-amber-100 text-amber-700" : statusTone === "danger" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700";
  return (
    <article {...props} className={`gov-card ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{eyebrow}</p> : null}
          <h3 className="mt-2 text-lg font-bold">{title}</h3>
        </div>
        {status ? <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${toneClassName}`}>{status}</span> : null}
      </div>
      {description ? <div className="mt-4 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{description}</div> : null}
      {summary ? <div className="mt-5">{summary}</div> : null}
      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </article>
  );
}

export function CopyableCodeBlock({
  title = "Code",
  value,
  copied,
  onCopy,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  value: string;
  copied?: boolean;
  onCopy?: () => void;
  copyLabel?: ReactNode;
  copiedLabel?: ReactNode;
}) {
  return (
    <div {...props} className={`rounded border border-[var(--kr-gov-border-light)] bg-white p-3 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{title}</p>
        {onCopy ? <MemberButton onClick={onCopy} size="xs" type="button" variant="secondary">{copied ? copiedLabel : copyLabel}</MemberButton> : null}
      </div>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-[11px] leading-5 text-[var(--kr-gov-text-primary)]">{value}</pre>
    </div>
  );
}
