import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

export function PasswordField({
  label = "Senha",
  value,
  onChange,
  autoComplete,
  minLength,
  placeholder,
  required = true,
}: {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: React.InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  minLength?: number;
  placeholder?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-input bg-white px-4 py-3 pr-12 text-base text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-[#5FD0FF]"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-foreground/60 hover:bg-muted hover:text-[#1E4FA6]"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
