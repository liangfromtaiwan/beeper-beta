import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONNECTOR_IDS } from "@/lib/connectors";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { provider: "asc" },
  });

  const connected = new Set(
    accounts.filter((a) => !a.disconnectedAt).map((a) => a.provider)
  );

  return <SettingsClient connectorStatus={CONNECTOR_IDS.map((id) => ({ id, connected: connected.has(id) }))} accountIds={Object.fromEntries(accounts.filter((a) => !a.disconnectedAt).map((a) => [a.provider, a.id]))} />;
}
