export function AuthInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-[#5FD0FF]"
      />
    </label>
  );
}
