import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { fetchAdminSitemapPage, type SitemapNode, type SitemapPagePayload } from "../../lib/api/client";

function stringOf(value: unknown) {
  return typeof value === "string" ? value : "";
}

function iconOf(value: unknown, fallback: string) {
  const next = stringOf(value);
  return next || fallback;
}

export function AdminSitemapMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<SitemapPagePayload>(() => fetchAdminSitemapPage(), [en]);
  const sections = (pageState.value?.siteMapSections || []) as SitemapNode[];

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "Content" : "콘텐츠" },
        { label: en ? "Sitemap" : "사이트맵" }
      ]}
      title={en ? "Admin Sitemap" : "관리자 사이트맵"}
      subtitle={en
        ? "This sitemap shows the administrator menus available to the current role."
        : "현재 권한으로 접근 가능한 관리자 메뉴를 실시간 트리로 보여줍니다."}
    >
      <section className="rounded-2xl bg-gradient-to-r from-[var(--kr-gov-blue)] to-[#0c6fc0] text-white px-8 py-8 shadow-lg" data-help-id="admin-sitemap-hero">
        <p className="text-sm font-bold tracking-[0.2em] uppercase opacity-80">Admin Content</p>
        <h2 className="text-3xl font-black mt-3">{en ? "Admin Sitemap" : "관리자 사이트맵"}</h2>
        <p className="text-sm text-blue-50 mt-3 leading-relaxed max-w-4xl">
          {en
            ? "This sitemap refreshes from the live admin menu tree, menu order, and view-permission mapping."
            : "메뉴 관리의 노출 상태, 순서, 페이지 연결이 바뀌면 이 화면도 같은 기준으로 즉시 갱신됩니다."}
        </p>
      </section>

      <section className="mt-6 rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-[var(--kr-gov-text-secondary)]">
        {en
          ? "The admin sitemap is generated from AMENU1, menu-order metadata, and the current administrator's view permissions."
          : "관리자 사이트맵은 AMENU1, 메뉴 정렬 정보, 현재 로그인한 관리자 권한의 VIEW 기능 매핑을 기준으로 구성됩니다."}
      </section>

      {pageState.error ? (
        <div className="mt-6 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageState.error}
        </div>
      ) : null}

      <section className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6" data-help-id="admin-sitemap-tree">
        {sections.map((top) => (
          <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white shadow-sm" key={top.code || top.label}>
            <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
              <a className="inline-flex items-center gap-2 text-2xl font-black text-[var(--kr-gov-blue)] hover:underline" href={stringOf(top.url) || "#"}>
                {stringOf(top.label)}
              </a>
              <p className="text-sm text-[var(--kr-gov-text-secondary)] mt-2">{stringOf(top.code)}</p>
            </div>
            <div className="p-6 space-y-5">
              {(top.children || []).map((section) => (
                <section key={section.code || section.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">{iconOf(section.icon, "folder_open")}</span>
                    <h3 className="text-lg font-bold">{stringOf(section.label)}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(section.children || []).map((item) => (
                      <a className="inline-flex items-center gap-2 rounded-[var(--kr-gov-radius)] px-3 py-2 text-sm font-medium text-[var(--kr-gov-text-primary)] hover:bg-[var(--kr-gov-bg-gray)] hover:text-[var(--kr-gov-blue)] transition-colors" href={stringOf(item.url) || "#"} key={item.code || item.label}>
                        <span className="material-symbols-outlined text-[20px] text-[var(--kr-gov-blue)]">{iconOf(item.icon, "chevron_right")}</span>
                        <span>{stringOf(item.label)}</span>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AdminPageShell>
  );
}
