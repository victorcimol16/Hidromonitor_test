import { useEffect, useRef } from "react";

const DIGIT_COUNT = 6;

export function OtpInput({
  digits,
  onDigitsChange,
  disabled,
}: {
  digits: string[];
  onDigitsChange: (digits: string[]) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // Focus the first box on mount, and again whenever the code is wiped
  // back to empty (e.g. after a failed verification attempt).
  useEffect(() => {
    if (digits.every((d) => d === "")) inputs.current[0]?.focus();
  }, [digits]);

  function setDigit(i: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[i] = "";
      onDigitsChange(next);
      return;
    }
    // Handle paste of the full code into one box.
    if (clean.length > 1) {
      const chars = clean.slice(0, DIGIT_COUNT - i).split("");
      const next = [...digits];
      chars.forEach((c, k) => (next[i + k] = c));
      onDigitsChange(next);
      const last = Math.min(i + chars.length, DIGIT_COUNT - 1);
      inputs.current[last]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    onDigitsChange(next);
    if (i < DIGIT_COUNT - 1) inputs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < DIGIT_COUNT - 1) {
      inputs.current[i + 1]?.focus();
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {digits.map((d, i) => (
        <div key={i} className="flex items-center">
          <input
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onFocus={(e) => e.currentTarget.select()}
            disabled={disabled}
            aria-label={`Dígito ${i + 1}`}
            className="h-14 w-11 rounded-lg border border-border bg-background text-center text-3xl font-semibold text-foreground outline-none transition-colors focus:border-[#1E4FA6] disabled:opacity-60"
          />
          {i === 2 ? <span className="mx-1 text-muted-foreground">–</span> : null}
        </div>
      ))}
    </div>
  );
}
