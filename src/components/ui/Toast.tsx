import type { Notification } from "@/types";
import { cn } from "@/utils/cn";

interface ToastProps {
  notification: Notification;
}

export function Toast({ notification }: ToastProps) {
  const isError = notification.type === "error";

  return (
    <div
      role="status"
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-modal",
        "flex items-center gap-3 px-4 py-3 max-w-[90vw]",
        "border bg-sunken font-mono text-micro uppercase tracking-wider",
        "animate-in fade-in slide-in-from-top-4",
        isError ? "border-ink text-ink" : "border-acid text-acid"
      )}
      style={{ boxShadow: isError ? "4px 4px 0 var(--hairline)" : "4px 4px 0 var(--acid)" }}
    >
      {isError ? (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="square" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="square" strokeWidth={2.5} d="m5 13 4 4L19 7" />
        </svg>
      )}
      <span className="min-w-0">{notification.message}</span>
    </div>
  );
}
