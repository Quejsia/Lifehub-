"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AttemptResult } from "@/lib/types";
import {
  Award,
  BookOpen,
  Calculator,
  ChevronRight,
  Flame,
  GraduationCap,
  Menu,
  PanelLeftClose,
  Sprout,
  Target,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import type { Profile } from "@/lib/types";

const navItems = [
  { href: "/", label: "Learn", icon: GraduationCap, ready: true },
  { href: "/practice", label: "Practice", icon: BookOpen, ready: true },
];

const futureItems = [
  { label: "Solve", icon: Target },
  { label: "Grow", icon: Sprout },
];

function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="sidebar-section-label">LEARNING</div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active ? "active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{item.label}</span>
              {active && <ChevronRight className="sidebar-active-mark" size={16} />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-section-label sidebar-section-spaced">MORE</div>
      <div className="sidebar-nav" aria-label="Future navigation">
        {futureItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="sidebar-link disabled" aria-disabled="true">
              <Icon size={19} strokeWidth={2} />
              <span>{item.label}</span>
              <span className="coming-soon">Soon</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ProfileBlock({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return (
      <Link href="/auth" className="sidebar-signin">
        <span className="avatar avatar-sm">?</span>
        <span>
          <strong>Sign in</strong>
          <small>Save your progress</small>
        </span>
        <ChevronRight size={17} />
      </Link>
    );
  }

  const initial = (profile.display_name ?? "You").slice(0, 1).toUpperCase();

  return (
    <div className="sidebar-profile">
      <div className="sidebar-profile-main">
        <div className="avatar avatar-sm" aria-hidden="true">{initial}</div>
        <div className="sidebar-profile-copy">
          <strong>{profile.display_name ?? "Learner"}</strong>
          <small>Level {profile.level} · {profile.xp} XP</small>
        </div>
      </div>
      <div className="sidebar-streak">
        <Flame size={16} />
        <span>{profile.current_streak} day streak</span>
      </div>
      <SignOutButton />
    </div>
  );
}

export function SiteHeader({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [liveProfile, setLiveProfile] = useState<Profile | null>(profile);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    setLiveProfile(profile);
  }, [profile]);

  useEffect(() => {
    const onAttempt = (event: Event) => {
      const result = (event as CustomEvent<AttemptResult>).detail;
      if (!result || !liveProfile) return;
      setLiveProfile(current => current ? {
        ...current,
        xp: current.xp + (result.xp_awarded ?? 0),
        level: Math.max(current.level, Math.floor((current.xp + (result.xp_awarded ?? 0)) / 500) + 1),
        current_streak: result.streak ?? current.current_streak,
        updated_at: new Date().toISOString(),
      } : current);
    };
    window.addEventListener("lifehub:attempt", onAttempt);
    return () => window.removeEventListener("lifehub:attempt", onAttempt);
  }, [liveProfile]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const sidebar = (
    <aside className="sidebar" aria-label="LifeHub navigation">
      <div className="sidebar-brand-row">
        <Link href="/" className="brand" aria-label="LifeHub home" onClick={() => setOpen(false)}>
          LifeHub
        </Link>
        <span className="sidebar-brand-dot" aria-hidden="true" />
      </div>

      <div className="sidebar-content">
        <NavItems pathname={pathname} onNavigate={() => setOpen(false)} />
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-quick">
          <div className="sidebar-quick-icon"><Award size={17} /></div>
          <div>
            <strong>Keep learning</strong>
            <small>Small practice adds up.</small>
          </div>
        </div>
        <ProfileBlock profile={liveProfile} />
      </div>
    </aside>
  );

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <div className="desktop-sidebar">{sidebar}</div>

      <header className="mobile-topbar">
        <button
          type="button"
          className="icon-button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-sidebar"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link href="/" className="mobile-brand">LifeHub</Link>
        <div className="mobile-topbar-meta">
          <Flame size={16} />
          <span>{liveProfile?.current_streak ?? 0}</span>
        </div>
      </header>

      {open && (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div id="mobile-sidebar" className={`mobile-drawer ${open ? "open" : ""}`}>
        <div className="mobile-drawer-head">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>LifeHub</Link>
          <button type="button" className="icon-button" aria-label="Close navigation menu" onClick={() => setOpen(false)}>
            <PanelLeftClose size={20} />
          </button>
        </div>
        {sidebar}
      </div>
    </>
  );
}