export const WHATSAPP_NUMBER = "5554992681225";
/** Same number as WHATSAPP_NUMBER, formatted for display to the reader. */
export const WHATSAPP_DISPLAY = "+55 54 99268-1225";
export const INSTAGRAM_HANDLE = "hidromonitor";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

/**
 * Hard-coded brand hex colors that sit alongside the oklch theme tokens.
 * Two shades of "Hidro" (#5B9BFF on dark surfaces, #1E4FA6 on light/white
 * surfaces) are both original to the source design — kept as-is per surface.
 */
export const BRAND_COLORS = {
  hidroOnDark: "#5B9BFF",
  hidroOnLight: "#1E4FA6",
  hidroOnLightHover: "#1a4494",
  monitor: "#5FD0FF",
  gradientTextOnColor: "#001a33",
  themeColor: "#002953",
} as const;
