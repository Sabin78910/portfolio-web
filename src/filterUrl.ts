import { allTags, projects } from "./data";

export type Filters = { tag: string | null; query: string };

export function parseFilters(search: string): Filters {
  const params = new URLSearchParams(search);
  const category = params.get("category");
  const tag = category !== null && allTags(projects).includes(category) ? category : null;
  return { tag, query: params.get("q") ?? "" };
}

export function serializeFilters({ tag, query }: Filters): string {
  const params = new URLSearchParams();
  if (tag) params.set("category", tag);
  if (query) params.set("q", query);
  const s = params.toString();
  return s ? `?${s}` : "";
}
