export type ChartPoint = { x: number; y: number };

/** Normalizes a value series into viewBox-space points (min/max scaled, evenly spaced on x). */
export function toChartPoints(
  values: number[],
  width: number,
  height: number,
  paddingY: number,
): ChartPoint[] {
  if (values.length === 0) return [];
  if (values.length === 1) return [{ x: width / 2, y: height / 2 }];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableHeight = height - paddingY * 2;

  return values.map((value, i) => ({
    x: (i / (values.length - 1)) * width,
    y: paddingY + usableHeight - ((value - min) / range) * usableHeight,
  }));
}

/** Smooth cubic-bezier path through the points, using the midpoint between each pair as the control anchor. */
export function smoothLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    path += ` C${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
  }
  return path;
}

export function areaPathFromLine(linePath: string, points: ChartPoint[], height: number): string {
  if (points.length === 0) return "";
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath} L${last.x},${height} L${first.x},${height} Z`;
}
