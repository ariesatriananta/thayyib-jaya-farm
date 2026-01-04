import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    const headerList = headers();
    const callbackUrl = headerList.get("x-callback-url") || "/";
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return children;
}
