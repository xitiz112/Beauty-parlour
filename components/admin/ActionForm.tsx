"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions";

export function ActionForm({
  action,
  children,
  className = "admin-form",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form className={className} action={formAction}>
      {children}
      {state.error ? <p className="field-error">{state.error}</p> : null}
      {state.success ? <p className="muted">{state.success}</p> : null}
      {pending ? <p className="muted">Saving…</p> : null}
    </form>
  );
}
