import { TableOrderClient } from "./table-order-client";

export default async function TableOrderPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;
  return <TableOrderClient tableId={tableId} />;
}
