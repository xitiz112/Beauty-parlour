import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Plus } from "lucide-react";

export type MDItem = {
  id: string;
  title: string;
  subtitle?: string;
  thumb?: string | null;
  /** Small text on the right, e.g. a price or time. */
  meta?: string;
  hidden?: boolean;
  /** Items with a section start a labelled sub-group in the list (e.g. treatments by category). */
  section?: string;
};

export type MDGroup = {
  key: string;
  label: string;
  /** Singular name, used for "New review" / "Add review". */
  noun: string;
  items: MDItem[];
  /** Set to false for lists that can't be added to (e.g. fixed sections). */
  canAdd?: boolean;
};

export type MDSelection = {
  group: MDGroup;
  item: MDItem | null;
  mode: "edit" | "new" | "empty";
  /** True when the URL picked something; on phones this shows the editor instead of the list. */
  explicit: boolean;
};

type Params = Record<string, string | undefined>;

export function mdHref(basePath: string, params: Params) {
  const query = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Work out which group and item the page should show from `?group=` and `?edit=`. */
export function resolveSelection(groups: MDGroup[], params: { group?: string; edit?: string }): MDSelection {
  const group = groups.find((entry) => entry.key === params.group) ?? groups[0];
  const explicit = Boolean(params.edit);
  if (params.edit === "new" && group.canAdd !== false) return { group, item: null, mode: "new", explicit };
  const item = group.items.find((entry) => entry.id === params.edit) ?? group.items[0] ?? null;
  if (item) return { group, item, mode: "edit", explicit: explicit && item.id === params.edit };
  return { group, item: null, mode: group.canAdd === false ? "empty" : "new", explicit };
}

/**
 * Two-column admin layout: the list of records on the left, the selected record's editor on the right.
 * Selection lives in the URL, so it survives saves and reloads and works with the back button.
 */
export function MasterDetail({
  basePath,
  groups,
  selection,
  extraParams = {},
  listHeader,
  editorTitle,
  editorActions,
  children,
}: {
  basePath: string;
  groups: MDGroup[];
  selection: MDSelection;
  /** Extra query params to keep in every link (e.g. the bookings date). */
  extraParams?: Params;
  /** Content above the list (e.g. a date picker). */
  listHeader?: ReactNode;
  editorTitle?: ReactNode;
  /** Content at the right of the editor heading (e.g. a "view on site" link). */
  editorActions?: ReactNode;
  children: ReactNode;
}) {
  const { group, item, mode } = selection;
  const href = (params: Params) => mdHref(basePath, { ...extraParams, ...params });
  const groupParam = groups.length > 1 ? group.key : undefined;
  const title = editorTitle ?? (mode === "new" ? `New ${group.noun}` : item?.title ?? group.label);

  let lastSection: string | undefined;

  return (
    <div className="md" data-editing={selection.explicit || undefined}>
      <aside className="md-list" aria-label={`${group.label} list`}>
        {groups.length > 1 ? (
          <nav className="md-tabs" aria-label="Lists">
            {groups.map((entry) => (
              <Link
                key={entry.key}
                href={href({ group: entry.key })}
                aria-current={entry.key === group.key ? "page" : undefined}
              >
                {entry.label}
                <span className="admin-count">{entry.items.length}</span>
              </Link>
            ))}
          </nav>
        ) : null}
        {listHeader}
        <div className="md-list-head">
          <strong>
            {group.label}
            <span className="admin-count">{group.items.length}</span>
          </strong>
          {group.canAdd !== false ? (
            <Link
              className="md-add"
              href={href({ group: groupParam, edit: "new" })}
              aria-current={mode === "new" ? "page" : undefined}
            >
              <Plus aria-hidden="true" size={16} /> Add
            </Link>
          ) : null}
        </div>
        {group.items.length === 0 ? <p className="md-empty muted">Nothing here yet.</p> : null}
        <ul className="md-items">
          {group.items.map((entry) => {
            const showSection = entry.section && entry.section !== lastSection;
            lastSection = entry.section;
            return (
              <li key={entry.id}>
                {showSection ? <p className="md-section">{entry.section}</p> : null}
                <Link
                  className={`md-item${entry.hidden ? " is-hidden" : ""}`}
                  href={href({ group: groupParam, edit: entry.id })}
                  aria-current={mode === "edit" && item?.id === entry.id ? "page" : undefined}
                >
                  {entry.thumb ? <img className="md-thumb" src={entry.thumb} alt="" loading="lazy" /> : null}
                  <span className="md-item-text">
                    <span className="md-item-title">{entry.title}</span>
                    {entry.subtitle ? <span className="md-item-subtitle">{entry.subtitle}</span> : null}
                  </span>
                  {entry.hidden ? <span className="admin-badge is-off">Hidden</span> : null}
                  {entry.meta ? <span className="md-meta">{entry.meta}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="md-editor" aria-label="Editor">
        <Link className="md-back" href={href({ group: groupParam })}>
          <ArrowLeft aria-hidden="true" size={16} /> All {group.label.toLowerCase()}
        </Link>
        <header className="md-editor-head">
          <div>
            <p className="eyebrow">{mode === "new" ? "Add" : mode === "edit" ? "Edit" : group.label}</p>
            <h2>{title}</h2>
          </div>
          {editorActions}
        </header>
        {children}
      </section>
    </div>
  );
}

/** Ids for an editor's forms: React keys reset the fields when switching items, and the delete form gets a stable id. */
export function editorKeys(selection: MDSelection) {
  const key = `${selection.group.key}:${selection.item?.id ?? selection.mode}`;
  return { key, deleteFormId: `delete-${key.replace(/[^\w-]/g, "-")}` };
}
