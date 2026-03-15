export type LayoutZone = "header" | "sidebar" | "content" | "footer" | "actions";

export type PageComponentManifest = {
  componentId: string;
  instanceKey: string;
  layoutZone: LayoutZone;
  propsSummary?: string[];
  conditionalRuleSummary?: string;
};

export type PageManifest = {
  pageId: string;
  routePath: string;
  menuCode?: string;
  domainCode: "admin" | "join" | "home";
  layoutVersion: string;
  designTokenVersion: string;
  components: PageComponentManifest[];
};
