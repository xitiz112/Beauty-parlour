import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Desk login" };

export default function AdminLoginPage() {
  return (
    <main className="admin-main">
      <section className="page-hero">
        <p className="eyebrow">Staff</p>
        <h1>Studio desk</h1>
        <p className="muted">Confirm chairs, keep the book honest.</p>
      </section>
      <LoginForm />
    </main>
  );
}
