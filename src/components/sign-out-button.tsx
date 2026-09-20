"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/learning";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="secondary-btn"
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => { await signOut(); window.location.href = "/"; })}
      aria-label="Sign out"
    >
      <LogOut size={16} /> {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}