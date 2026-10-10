import { WaterDropGaugeIcon, PlusIcon } from "@/components/icons";

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center text-card-foreground shadow-2xl">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-secondary">
        <WaterDropGaugeIcon width={32} height={32} />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
      >
        <PlusIcon width={16} height={16} />
        {actionLabel}
      </button>
    </div>
  );
}
