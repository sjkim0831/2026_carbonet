import type { ReactNode } from "react";

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
  const secondaryBaseClassName = "inline-flex min-h-[56px] min-w-[160px] items-center justify-center gap-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-6 py-3 text-base font-bold text-[var(--kr-gov-text-primary)] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";
  const tertiaryBaseClassName = "inline-flex min-h-[56px] min-w-[160px] items-center justify-center gap-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-6 py-3 text-base font-bold text-[var(--kr-gov-text-primary)] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

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
