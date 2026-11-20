// Name and number boxes with live counters and the shared rules' own error message (shared/print.js).
import { useId } from "react";
import { NAME_MAX, type PrintCheck } from "../lib/print";

type Props = {
  name: string;
  number: string;
  onName: (v: string) => void;
  onNumber: (v: string) => void;
  onFocusChange?: (focused: boolean) => void;
  result: PrintCheck;
  showErrors: boolean;
  autoFocus?: boolean;
};

export function PrintFields({ name, number, onName, onNumber, onFocusChange, result, showErrors, autoFocus }: Props) {
  const id = useId();
  const nameBad = showErrors && !result.ok && result.field === "name";
  const numberBad = showErrors && !result.ok && result.field === "number";
  const nameLen = [...name.trim()].length;
  const field = (bad: boolean) =>
    `h-14 w-full rounded-field border bg-paper px-4 font-[family-name:var(--font-display)] text-xl uppercase tracking-[0.12em] outline-none transition-colors placeholder:font-[family-name:var(--font-body)] placeholder:text-base placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/70 focus:border-ink ${
      bad ? "border-error" : "border-ink/15"
    }`;
  const focus = { onFocus: () => onFocusChange?.(true), onBlur: () => onFocusChange?.(false) };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_6.5rem] gap-3">
        <div className="space-y-1.5">
          <label htmlFor={`${id}-name`} className="text-sm font-semibold">Name</label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(e) => onName(e.target.value.toUpperCase().slice(0, NAME_MAX + 4))}
            placeholder="e.g. Ronaldo"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            autoFocus={autoFocus}
            aria-invalid={nameBad || undefined}
            aria-describedby={`${id}-name-count ${id}-err`}
            className={field(nameBad)}
            {...focus}
          />
          <p id={`${id}-name-count`} className={`text-xs tabular-nums ${nameLen > NAME_MAX ? "text-error" : "text-muted"}`}>
            {nameLen} / {NAME_MAX} characters
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-number`} className="text-sm font-semibold">Number</label>
          <input
            id={`${id}-number`}
            value={number}
            onChange={(e) => onNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
            placeholder="7"
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={numberBad || undefined}
            aria-describedby={`${id}-number-count ${id}-err`}
            className={`${field(numberBad)} text-center`}
            {...focus}
          />
          <p id={`${id}-number-count`} className="text-xs tabular-nums text-muted">{number.length} / 2 numbers</p>
        </div>
      </div>
      <p id={`${id}-err`} role="alert" className="min-h-5 text-sm font-medium text-error">
        {showErrors && !result.ok ? result.reason : ""}
      </p>
    </div>
  );
}
