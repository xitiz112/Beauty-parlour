"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/lib/actions";

export function ActionForm({
  action,
  children,
  className = "admin-form",
  id,
  createdHref,
  successHref,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** After creating a record, open it: navigates to this prefix + the new id. */
  createdHref?: string;
  /** After any success (e.g. a delete), navigate here. */
  successHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    if (createdHref && state.id) router.replace(`${createdHref}${state.id}`);
    else if (successHref) router.replace(successHref);
  }, [state, createdHref, successHref, router]);

  return (
    <form id={id} className={className} action={formAction}>
      {children}
      {state.error ? <p className="field-error">{state.error}</p> : null}
      {state.success ? <p className="muted">{state.success}</p> : null}
      {pending ? <p className="muted">Saving…</p> : null}
    </form>
  );
}
