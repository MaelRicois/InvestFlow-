import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Field({
  label,
  hint,
  right,
  children,
}: {
  label: string;
  hint?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-800">
            {label}
          </label>
          {hint ? <p className="mt-0.5 text-xs text-stone-500">{hint}</p> : null}
        </div>
        {right ? <div className="text-xs text-stone-500">{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 shadow-sm outline-none transition",
        "placeholder:text-stone-400",
        "focus:border-stone-400 focus:ring-4 focus:ring-amber-500/10",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "min-h-28 w-full resize-y rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition",
        "placeholder:text-stone-400",
        "focus:border-stone-400 focus:ring-4 focus:ring-amber-500/10",
        className
      )}
      {...props}
    />
  );
}

