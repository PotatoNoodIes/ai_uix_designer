import React, { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import { IconButton, CloseIcon } from "./IconButton";
import { Micro } from "./Micro";

interface ModalProps {
  open?: boolean;
  onClose: () => void;
  title: string;
  /** Hides the visible heading while keeping it available to screen readers. */
  hideTitle?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Accent the panel's drop shadow, e.g. for the upgrade prompt. */
  emphasis?: boolean;
  showClose?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * The single modal shell. Four near-identical hand-rolled versions existed
 * before, two of them styled with classes that no longer had definitions.
 *
 * Adds what none of them had: a labelled dialog role, Escape to close, a focus
 * trap, and focus restored to whatever was focused before opening.
 */
export function Modal({
  open = true,
  onClose,
  title,
  hideTitle,
  children,
  className,
  emphasis,
  showClose = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus() ?? panel?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = `modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-modal flex items-center justify-center p-4 animate-in fade-in duration-fast"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "brutal-panel-flush w-full max-w-lg max-h-[85vh] flex flex-col outline-none animate-in zoom-in-95 duration-fast",
          className
        )}
        style={{ boxShadow: emphasis ? "8px 8px 0 var(--acid)" : "8px 8px 0 var(--hairline)" }}
      >
        <header className="flex items-center justify-between gap-4 p-4 border-b border-hairline shrink-0">
          <Micro as="div" id={titleId} className={cn(hideTitle && "sr-only")}>
            {title}
          </Micro>
          {showClose && (
            <IconButton label="Close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </header>
        <div className="overflow-y-auto p-4 flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
