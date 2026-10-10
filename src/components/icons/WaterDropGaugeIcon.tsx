/** Gauge-inside-a-drop mark used on the dashboard placeholder. Renders its own gradient defs, so keep `id="g"` unique per instance if reused on the same page. */
export function WaterDropGaugeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#g)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5B9BFF" />
          <stop offset="100%" stopColor="#5FD0FF" />
        </linearGradient>
      </defs>
      <path d="M12 2v6" />
      <path d="M4.93 10.93 9 15" />
      <path d="M2 18h20" />
      <path d="M6 22h12" />
      <circle cx="12" cy="14" r="4" />
    </svg>
  );
}
