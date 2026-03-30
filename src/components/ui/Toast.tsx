import React from "react";
import type { Notification } from "@/types";

interface ToastProps {
  notification: Notification;
}

export function Toast({ notification }: ToastProps) {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[3000] animate-in fade-in slide-in-from-top-4 uix-toast ${
      notification.type === "error" ? "uix-toast-error toast-error" : "uix-toast-success"
    }`}>
      {notification.type === "error" ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {notification.message}
    </div>
  );
}
