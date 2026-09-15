import React, { useId } from "react";
import { cn } from "@/utils/cn";
import { Micro } from "./Micro";

export function Input({
  label,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Micro as="label" {...({ htmlFor: inputId } as object)}>
          {label}
        </Micro>
      )}
      <input id={inputId} className={cn("brutal-input", className)} {...props} />
    </div>
  );
}

export function Textarea({
  label,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Micro as="label" {...({ htmlFor: inputId } as object)}>
          {label}
        </Micro>
      )}
      <textarea id={inputId} className={cn("brutal-input", className)} {...props} />
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Micro as="div">{label}</Micro>}
      <div role="group" aria-label={label} className="flex border border-hairline">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className="brutal-ghost flex-1 py-2 text-center"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
