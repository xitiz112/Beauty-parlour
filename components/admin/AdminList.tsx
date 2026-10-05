import type { ReactNode } from "react";
import { ConfirmSubmit } from "./ConfirmSubmit";

/** A collapsible row in an admin list: a one-line summary that opens into its edit form. */
export function AdminItem({
  title,
  subtitle,
  thumb,
  order,
  hidden,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  thumb?: string;
  order?: number;
  hidden?: boolean;
  children: ReactNode;
}) {
  return (
    <details className={`admin-item${hidden ? " is-hidden" : ""}`}>
      <summary>
        {order !== undefined ? <span className="admin-item-order">{order}</span> : null}
        {thumb ? <img className="admin-item-thumb" src={thumb} alt="" loading="lazy" /> : null}
        <span className="admin-item-text">
          <span className="admin-item-title">{title}</span>
          {subtitle ? <span className="admin-item-subtitle">{subtitle}</span> : null}
        </span>
        {hidden ? <span className="admin-badge is-off">Hidden</span> : null}
        <span className="admin-item-chevron" aria-hidden="true" />
      </summary>
      <div className="admin-item-body">{children}</div>
    </details>
  );
}

/** Save on the left, optional delete on the right (the delete form is rendered separately, by id). */
export function FormActions({
  saveLabel = "Save changes",
  deleteFormId,
  deleteLabel = "Delete",
  deleteMessage = "Delete this item?",
}: {
  saveLabel?: string;
  deleteFormId?: string;
  deleteLabel?: string;
  deleteMessage?: string;
}) {
  return (
    <div className="admin-form-actions">
      <button className="btn btn-primary" type="submit">
        {saveLabel}
      </button>
      {deleteFormId ? (
        <ConfirmSubmit form={deleteFormId} className="admin-delete-button" label={deleteLabel} message={deleteMessage} />
      ) : null}
    </div>
  );
}
