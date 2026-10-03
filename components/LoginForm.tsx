"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { loginAdmin, type ActionState } from "@/lib/actions";

const initial: ActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initial);

  return (
    <form className="admin-form" action={action}>
      <label>
        Desk email
        <input type="email" name="email" autoComplete="username" placeholder="you@liorastudio.com" required />
      </label>
      <label>
        Password
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      {state.error ? <p className="field-error">{state.error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? <>Signing in <LoaderCircle className="login-spinner" aria-hidden="true" size={17} /></> : <>Sign in <ArrowRight aria-hidden="true" size={17} /></>}
      </button>
    </form>
  );
}
