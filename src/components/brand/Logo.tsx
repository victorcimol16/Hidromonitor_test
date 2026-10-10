import logo from "@/assets/upscalemedia-transformed.png";
import { BRAND_COLORS } from "@/lib/brand";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <img src={logo} width={size} height={size} alt="HidroMonitor" className="object-contain" />
  );
}

export function LogoWordmark({
  size = 36,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} style={style}>
      <LogoMark size={size} />
      <span
        className="font-semibold tracking-tight"
        style={{
          fontSize: size * 0.55,
          letterSpacing: "-0.01em",
        }}
      >
        <span style={{ color: BRAND_COLORS.hidroOnLight }}>Hidro</span>
        <span style={{ color: BRAND_COLORS.monitor }}>Monitor</span>
      </span>
    </span>
  );
}
