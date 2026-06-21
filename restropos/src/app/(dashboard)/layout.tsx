import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-0)", transition: "background var(--dur-normal)" }}>
      <Sidebar restaurantName={(session.user as any)?.restaurantName} />
      <main className="flex-1 overflow-auto" style={{ background: "var(--bg-0)", transition: "background var(--dur-normal)" }}>{children}</main>
    </div>
  );
}
