export function AuthButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-lg bg-[#1E4FA6] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#1a4494] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
