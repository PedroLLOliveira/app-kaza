"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, CreditCard, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { href: "/dashboard/house", label: "Casa", icon: Home },
  { href: "/dashboard/personal", label: "Pessoal", icon: User },
  { href: "/dashboard/accounts", label: "Contas", icon: CreditCard },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border bg-background/80 pb-safe">
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-14"
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary/15 scale-100 opacity-100" : "scale-50 opacity-0"
                )}
              />
              <item.icon
                className={cn(
                  "w-5 h-5 mb-1 transition-colors relative z-10",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors relative z-10",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
