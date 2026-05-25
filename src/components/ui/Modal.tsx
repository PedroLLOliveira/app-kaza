import Link from "next/link";
import { X } from "lucide-react";
import React from "react";

interface ModalProps {
  title: string;
  closeHref: string;
  children: React.ReactNode;
}

export function Modal({ title, closeHref, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden relative">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Link
            href={closeHref}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </Link>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
