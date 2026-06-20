import { TableOrderClient } from "./table-order-client";

export default async function SessionOrderPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <TableOrderClient sessionId={sessionId} />;
}
