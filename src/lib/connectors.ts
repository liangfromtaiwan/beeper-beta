export const CONNECTOR_IDS = ["facebook", "instagram", "line", "telegram"] as const;
export type ConnectorId = (typeof CONNECTOR_IDS)[number];

export const CONNECTOR_LABELS: Record<ConnectorId, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  line: "LINE",
  telegram: "Telegram",
};
