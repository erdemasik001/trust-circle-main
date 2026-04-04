"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TxButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "default" | "destructive";
  className?: string;
}

export function TxButton({
  onClick,
  children,
  loading = false,
  disabled = false,
  variant = "default",
  className,
}: TxButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn("relative gap-2", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}
