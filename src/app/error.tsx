"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="auth-shell">
      <section className="card auth-card" aria-labelledby="error-title">
        <div className="topic-icon"><AlertTriangle size={22} /></div>
        <h1 id="error-title" style={{ marginTop: 18 }}>LifeHub hit a temporary problem.</h1>
        <p className="auth-sub">
          Your saved learning data is not being changed by this screen. Try loading the page again.
        </p>
        <button className="primary-btn" type="button" onClick={reset}>
          <RotateCcw size={17} /> Try again
        </button>
      </section>
    </main>
  );
}