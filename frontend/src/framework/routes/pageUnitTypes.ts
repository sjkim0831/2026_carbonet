export type RouteUnitDefinition<TId extends string = string> = {
  id: TId;
  label: string;
  group: "admin" | "platform" | "join" | "home";
  koPath: string;
  enPath: string;
};

export type LazyPageUnit<TId extends string = string> = {
  id: TId;
  exportName: string;
  loader: () => Promise<unknown>;
};
