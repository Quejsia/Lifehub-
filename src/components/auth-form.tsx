"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push("/");
        router.refresh();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setMessage("Account created. Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed.");
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-shell">
      <section className="card auth-card" aria-labelledby="auth-title">
        <a href="/" className="brand">LifeHub</a>
        <h1 id="auth-title" style={{ marginTop: 24 }}>{mode === "signin" ? "Welcome back" : "Create your LifeHub account"}</h1>
        <p className="auth-sub">Save your learning progress, XP, streaks, and achievements.</p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && <div className="field"><label htmlFor="displayName">Display name</label><input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></div>}
          <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required /></div>
          {error && <div className="error-box" role="alert">{error}</div>}
          {message && <div className="feedback info" role="status">{message}</div>}
          <div className="auth-actions"><button className="primary-btn" type="submit" disabled={busy} aria-busy={busy}>{busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}</button></div>
        </form>
        <p className="auth-toggle">{mode === "signin" ? "New to LifeHub?" : "Already have an account?"}{" "}<button className="text-button" type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Create one" : "Sign in"}</button></p>
      </section>
    </main>
  );
}