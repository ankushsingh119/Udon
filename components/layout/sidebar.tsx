"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Workspace",
    href: "/workspace",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Brand Profile",
    href: "/brand",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    label: "History",
    href: "/history",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/billing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

const bottomItems: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const SIDEBAR_W = 220;
const SIDEBAR_COLLAPSED_W = 64;

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside
      className="sidebar-root fixed left-0 top-0 bottom-0 z-40 flex flex-col"
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_W,
        background: "#f0f0f0",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center overflow-hidden"
        style={{
          height: 72,
          padding: collapsed ? "0 12px" : "0 20px",
          justifyContent: collapsed ? "flex-start" : "flex-start",
          transition: "padding 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <button
          onClick={handleSignOut}
          className="flex items-center cursor-pointer bg-transparent border-none p-0 transition-transform duration-200 hover:scale-105"
        >
          {collapsed ? (
            <img
              src="/udon-logo-collapsed.png"
              alt="Udon"
              style={{
                width: 40,
                height: "auto",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          ) : (
            <img
              src="/udon-logo.png"
              alt="Udon"
              style={{
                height: 50,
                width: "auto",
                objectFit: "contain",
                objectPosition: "left center",
                flexShrink: 0,
              }}
            />
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />

      {/* Main nav */}
      <div className="flex-1 flex flex-col" style={{ padding: "16px 0" }}>
        <nav className="flex flex-col" style={{ gap: 2 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center group relative",
                  isActive
                    ? "text-[var(--coral)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              style={{
                height: 36,
                margin: "0 8px",
                borderRadius: 8,
                justifyContent: collapsed ? "center" : "flex-start",
                paddingLeft: collapsed ? 0 : 12,
                paddingRight: collapsed ? 0 : 12,
                background: isActive ? "rgba(232,72,85,0.1)" : "transparent",
                transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                  style={{ background: "var(--coral)" }}
                />
              )}
                <span
                  className={cn(
                    "flex items-center justify-center shrink-0 transition-colors duration-200",
                    isActive ? "text-[var(--coral)]" : "group-hover:text-[var(--text-secondary)]"
                  )}
                  style={{ width: 20, height: 20 }}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="ml-3 whitespace-nowrap text-[13px] font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col" style={{ padding: "0 0 16px" }}>
        <div className="mx-5 mb-3 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center group relative",
                isActive
                  ? "text-[var(--coral)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
              style={{
                height: 36,
                margin: "0 8px",
                borderRadius: 8,
                justifyContent: collapsed ? "center" : "flex-start",
                paddingLeft: collapsed ? 0 : 12,
                paddingRight: collapsed ? 0 : 12,
                background: isActive ? "rgba(232,72,85,0.1)" : "transparent",
                transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: "var(--coral)" }}
                />
              )}
              <span
                className={cn(
                  "flex items-center justify-center shrink-0 transition-colors duration-200",
                  isActive ? "text-[var(--coral)]" : "group-hover:text-[var(--text-secondary)]"
                )}
                style={{ width: 20, height: 20 }}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="ml-3 whitespace-nowrap text-[13px] font-medium">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 z-50 w-5 h-10 flex items-center justify-center rounded-l-md transition-all duration-200 hover:w-6"
        style={{
          right: 0,
          transform: "translateY(-50%) translateX(0)",
          background: "var(--cloud)",
          color: "var(--text-muted)",
          borderRight: "1px solid rgba(0,0,0,0.06)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.background = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'var(--cloud)';
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </aside>
  );
}
