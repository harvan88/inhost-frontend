/**
 * Utilidad para parsear spacing strings del theme
 * Convierte "4px 8px" → { paddingTop: "4px", paddingBottom: "4px", paddingLeft: "8px", paddingRight: "8px" }
 */

export interface ParsedSpacing {
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
}

export function parseSpacing(spacing: string): ParsedSpacing {
  const parts = spacing.trim().split(/\s+/);

  if (parts.length === 1) {
    // "4px" → all sides
    const value = parts[0];
    return {
      paddingTop: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
    };
  }

  if (parts.length === 2) {
    // "4px 8px" → vertical horizontal
    const vertical = parts[0];
    const horizontal = parts[1];
    return {
      paddingTop: vertical,
      paddingBottom: vertical,
      paddingLeft: horizontal,
      paddingRight: horizontal,
    };
  }

  // If more than 2, assume it's already processed or fallback
  return {
    paddingTop: parts[0] || "0px",
    paddingBottom: parts[1] || "0px",
    paddingLeft: parts[2] || "0px",
    paddingRight: parts[3] || "0px",
  };
}
