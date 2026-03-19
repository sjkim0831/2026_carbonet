import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { PermissionButton } from "../../components/access/CanUse";
export { MEMBER_BUTTON_LABELS, MEMBER_LIST_LABELS } from "./labels";

type MemberButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "dangerSecondary"
  | "info"
  | "ghost";

type MemberButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

type MemberButtonBaseProps = {
  icon?: string;
  className?: string;
  variant?: MemberButtonVariant;
  size?: MemberButtonSize;
};

function memberButtonVariantClassName(variant: MemberButtonVariant) {
  if (variant === "primary") {
    return "border border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] text-white hover:bg-[var(--kr-gov-blue-hover)] hover:border-[var(--kr-gov-blue-hover)]";
  }
  if (variant === "success") {
    return "border border-[var(--kr-gov-green)] bg-[var(--kr-gov-green)] text-white hover:opacity-90";
  }
  if (variant === "danger") {
    return "border border-red-300 bg-red-600 text-white hover:bg-red-700 hover:border-red-700";
  }
  if (variant === "dangerSecondary") {
    return "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100";
  }
  if (variant === "info") {
    return "border border-blue-100 bg-blue-50 text-[var(--kr-gov-blue)] hover:bg-blue-100";
  }
  if (variant === "ghost") {
    return "border border-transparent bg-transparent text-[var(--kr-gov-text-secondary)] hover:bg-gray-100";
  }
  return "border border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-primary)] hover:bg-gray-50";
}

function memberButtonSizeClassName(size: MemberButtonSize) {
  if (size === "xs") {
    return "min-h-[32px] px-3 py-1.5 text-[12px]";
  }
  if (size === "sm") {
    return "min-h-[40px] px-4 py-2 text-sm";
  }
  if (size === "lg") {
    return "min-h-[56px] px-6 py-3 text-base";
  }
  if (size === "icon") {
    return "h-10 w-10 p-0 text-sm";
  }
  return "min-h-[44px] px-4 py-2 text-[13px]";
}

export function getMemberButtonClassName({
  variant = "secondary",
  size = "md",
  className = ""
}: Pick<MemberButtonBaseProps, "variant" | "size" | "className"> = {}) {
  return [
    "inline-flex items-center justify-center gap-1.5 rounded-[var(--kr-gov-radius)] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    memberButtonVariantClassName(variant),
    memberButtonSizeClassName(size),
    className
  ].filter(Boolean).join(" ");
}

export function MemberButton({
  icon,
  children,
  className,
  variant = "secondary",
  size = "md",
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement> & MemberButtonBaseProps) {
  return (
    <button {...buttonProps} className={getMemberButtonClassName({ variant, size, className })}>
      {icon ? <span className={`material-symbols-outlined ${size === "xs" ? "text-[16px]" : "text-[18px]"}`}>{icon}</span> : null}
      {children}
    </button>
  );
}

export function MemberLinkButton({
  icon,
  children,
  className,
  variant = "secondary",
  size = "md",
  ...anchorProps
}: AnchorHTMLAttributes<HTMLAnchorElement> & MemberButtonBaseProps) {
  return (
    <a {...anchorProps} className={getMemberButtonClassName({ variant, size, className })}>
      {icon ? <span className={`material-symbols-outlined ${size === "xs" ? "text-[16px]" : "text-[18px]"}`}>{icon}</span> : null}
      {children}
    </a>
  );
}

export function MemberPermissionButton({
  allowed,
  reason,
  icon,
  children,
  className,
  variant = "primary",
  size = "md",
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement> & MemberButtonBaseProps & { allowed: boolean; reason?: string }) {
  return (
    <PermissionButton
      {...buttonProps}
      allowed={allowed}
      className={getMemberButtonClassName({ variant, size, className })}
      reason={reason}
    >
      {icon ? <span className={`material-symbols-outlined ${size === "xs" ? "text-[16px]" : "text-[18px]"}`}>{icon}</span> : null}
      {children}
    </PermissionButton>
  );
}

export function MemberIconButton({
  icon,
  children,
  className,
  variant = "ghost",
  size = "icon",
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement> & MemberButtonBaseProps) {
  return (
    <button {...buttonProps} className={getMemberButtonClassName({ variant, size, className })}>
      {icon ? <span className="material-symbols-outlined text-[18px]">{icon}</span> : null}
      {children}
    </button>
  );
}

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
  return (
    <div
      {...props}
      className={`flex flex-wrap items-center justify-end gap-2 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function MemberToolbar({
  left,
  right,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { left?: ReactNode; right?: ReactNode }) {
  return (
    <div
      {...props}
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
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
      left={(
        <div>
          {title ? <div className="text-sm font-bold">{title}</div> : null}
          {meta ? <div className="mt-1 text-sm text-gray-500">{meta}</div> : null}
        </div>
      )}
      right={actions}
    />
  );
}

export function MemberModalFooter({
  left,
  right,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { left?: ReactNode; right?: ReactNode }) {
  return (
    <div
      {...props}
      className={`flex flex-col gap-3 border-t border-[var(--kr-gov-border-light)] bg-gray-50 px-6 py-6 sm:flex-row sm:items-center ${className}`.trim()}
    >
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

export function MemberPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  dataHelpId
}: MemberPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const pageNumbers = Array.from({ length: safeTotalPages }, (_, index) => index + 1)
    .filter((pageNumber) => Math.abs(pageNumber - safeCurrentPage) <= 2 || pageNumber === 1 || pageNumber === safeTotalPages);

  return (
    <div className={`border-t border-[var(--kr-gov-border-light)] bg-gray-50 px-6 py-4 ${className}`.trim()} data-help-id={dataHelpId}>
      <nav className="flex items-center justify-center gap-1">
        <button
          className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(1)}
          type="button"
        >
          <span className="material-symbols-outlined">first_page</span>
        </button>
        <button
          className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
          type="button"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="mx-4 flex items-center gap-1">
          {pageNumbers.map((pageNumber) => (
            <button
              className={`flex h-8 w-8 items-center justify-center rounded border text-sm ${pageNumber === safeCurrentPage ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] font-bold text-white" : "border-transparent hover:border-gray-200 hover:bg-white"}`}
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          ))}
        </div>
        <button
          className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={safeCurrentPage >= safeTotalPages}
          onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
          type="button"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
        <button
          className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={safeCurrentPage >= safeTotalPages}
          onClick={() => onPageChange(safeTotalPages)}
          type="button"
        >
          <span className="material-symbols-outlined">last_page</span>
        </button>
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
  className?: string;
  dataHelpId?: string;
};

function renderActionButton(button: MemberActionBarButton, baseClassName: string) {
  const content = (
    <>
      {button.icon ? <span className="material-symbols-outlined text-[20px]">{button.icon}</span> : null}
      <span>{button.label}</span>
    </>
  );
  if (button.href) {
    return (
      <a className={`${baseClassName} ${button.className || ""}`.trim()} href={button.href}>
        {content}
      </a>
    );
  }
  return (
    <button
      className={`${baseClassName} ${button.className || ""}`.trim()}
      disabled={button.disabled}
      onClick={button.onClick}
      type={button.type || "button"}
    >
      {content}
    </button>
  );
}

export function MemberActionBar({
  primary,
  secondary,
  tertiary,
  className = "",
  dataHelpId
}: MemberActionBarProps) {
  const secondaryBaseClassName = `${getMemberButtonClassName({ variant: "secondary", size: "lg" })} min-w-[160px]`;
  const tertiaryBaseClassName = `${getMemberButtonClassName({ variant: "secondary", size: "lg" })} min-w-[160px]`;

  return (
    <div className={`mt-8 border-t border-[var(--kr-gov-border-light)] bg-white pt-6 ${className}`.trim()} data-help-id={dataHelpId}>
      <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          {secondary ? renderActionButton(secondary, secondaryBaseClassName) : null}
          {tertiary ? renderActionButton(tertiary, tertiaryBaseClassName) : null}
        </div>
        <div className="flex flex-1 items-stretch justify-end">
          {primary}
        </div>
      </div>
    </div>
  );
}
