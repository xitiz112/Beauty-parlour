import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Desk login" };

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <Link className="admin-login-back" href="/">
          <ArrowLeft aria-hidden="true" size={16} /> Back to Liora
        </Link>
        <div className="admin-login-mark" aria-hidden="true"><Sparkles size={22} /></div>
        <p className="eyebrow">LIORA BEAUTY STUDIO</p>
        <h1 id="admin-login-title">Welcome to the desk.</h1>
        <p className="admin-login-intro">Sign in to manage appointments, treatments, and the studio.</p>
        <LoginForm />
        <p className="admin-login-footnote">Private studio access · Authorized team members only</p>
      </section>
    </main>
  );
}
