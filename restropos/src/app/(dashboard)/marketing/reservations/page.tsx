import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationsClient } from "./reservations-client";

export default async function ReservationsPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const [reservations, tables] = await Promise.all([
    prisma.reservation.findMany({
      where: { restaurantId },
      include: { 
        table: true,
        order: {
          include: {
            items: {
              include: {
                menuItem: true
              }
            }
          }
        }
      },
      orderBy: { dateTime: "asc" },
    }),
    prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: "asc" },
    }),
  ]);

  // Convert dates to string/ISO and format plain objects to pass safely from Server to Client component
  const serializedReservations = reservations.map(res => {
    let serializedOrder = null;
    if (res.order) {
      serializedOrder = {
        id: res.order.id,
        orderNumber: res.order.orderNumber,
        status: res.order.status,
        subtotal: res.order.subtotal,
        total: res.order.total,
        items: res.order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          menuItem: {
            id: item.menuItem.id,
            name: item.menuItem.name,
            price: item.menuItem.price,
          },
        })),
      };
    }

    return {
      id: res.id,
      guestName: res.guestName,
      guestPhone: res.guestPhone,
      guestCount: res.guestCount,
      dateTime: res.dateTime.toISOString(),
      tableId: res.tableId,
      table: res.table,
      status: res.status,
      notes: res.notes,
      orderId: res.orderId,
      order: serializedOrder,
      createdAt: res.createdAt.toISOString(),
    };
  });

  return (
    <ReservationsClient
      initialReservations={serializedReservations as any}
      tables={tables}
      restaurantId={restaurantId}
    />
  );
}
