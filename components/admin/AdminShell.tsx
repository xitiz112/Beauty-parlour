"use client";

import { useState, type ReactNode } from "react";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { AdminNav } from "./AdminNav";

type AdminShellProps = {
  children: ReactNode;
  userLabel: string;
  signOutAction: () => Promise<void>;
};

export function AdminShell({ children, userLabel, signOutAction }: AdminShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`admin-shell${open ? " admin-sidebar-is-open" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-mark" aria-hidden="true">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>Liora desk</strong>
            <span>{userLabel}</span>
          </div>
        </div>
        <AdminNav onNavigate={() => setOpen(false)} />
        <form className="admin-sidebar-signout" action={signOutAction}>
          <button className="btn btn-ghost" type="submit">
            <LogOut aria-hidden="true" size={16} />
            Sign out
          </button>
        </form>
      </aside>

      {open ? (
        <button
          className="admin-sidebar-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="admin-content">
        <header className="admin-topbar">
          <button
            className="admin-nav-toggle"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <strong className="admin-topbar-brand">Liora desk</strong>
        </header>
        <div className="admin-main">{children}</div>
      </div>
    </div>
  );
}
