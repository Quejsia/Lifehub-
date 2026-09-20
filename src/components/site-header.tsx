import Link from "next/link";
import { Flame, Sprout } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import type { Profile } from "@/lib/types";

export function SiteHeader({ profile }: { profile: Profile | null }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="LifeHub home">LifeHub</Link>
      <nav className="nav" aria-label="Primary navigation">
        <Link className="nav-link active" href="/">Learn</Link>
        <Link className="nav-link" href="/practice">Practice</Link>
        <span className="nav-link disabled" aria-disabled="true"><Sprout size={16} />Solve</span>
        <span className="nav-link disabled" aria-disabled="true"><Sprout size={16} />Grow</span>
      </nav>
      <div className="header-actions">
        {profile && <span className="streak"><Flame size={17} /> {profile.current_streak} day streak</span>}
        {profile ? <> <div className="avatar" aria-label={profile.display_name ?? "Your profile"}>{(profile.display_name ?? "Y").slice(0,1).toUpperCase()}</div><SignOutButton /></> : <Link className="secondary-btn" href="/auth">Sign in</Link>}
      </div>
    </header>
  );
}