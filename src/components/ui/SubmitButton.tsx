"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
}

export function SubmitButton({ children, loadingText = "Carregando...", className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={`relative overflow-hidden ${className || ""}`}
      {...props}
    >
      <span className={`flex items-center justify-center gap-2 ${pending ? "opacity-0" : "opacity-100"} transition-opacity`}>
        {children}
      </span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">{loadingText}</span>
        </span>
      )}
    </button>
  );
}
