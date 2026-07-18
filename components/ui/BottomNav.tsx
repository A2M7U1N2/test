"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Calendar, Settings, Bot } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/bot", icon: Bot, label: "Bot", disabled: false },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // نخفي البار في صفحات معينة (تسجيل الدخول، الأونبوردنج)
  const hiddenPaths = ["/login", "/signup"];
  if (hiddenPaths.includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => !item.disabled && router.push(item.href)}
              disabled={item.disabled}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors ${
                item.disabled
                  ? "opacity-30 cursor-not-allowed"
                  : isActive
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}