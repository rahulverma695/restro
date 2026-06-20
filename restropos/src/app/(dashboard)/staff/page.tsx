import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffClient } from "./staff-client";

export default async function StaffPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const [staffProfiles, leaves] = await Promise.all([
    prisma.staffProfile.findMany({
      where: { restaurantId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { joinDate: "desc" },
    }),
    prisma.leaveRequest.findMany({
      where: { staff: { restaurantId } },
      include: { staff: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <StaffClient
    staff={staffProfiles.map(s => ({ ...s, joinDate: s.joinDate.toISOString() }))}
    leaves={leaves.map(l => ({ ...l, fromDate: l.fromDate.toISOString(), toDate: l.toDate.toISOString(), createdAt: l.createdAt.toISOString() }))}
  />;
}
