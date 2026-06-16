// app/dashboard/page.js

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/option";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  switch (role) {
    case "system":
      redirect("/dashboard/system");

    case "ca":
      redirect("/dashboard/account-manager");

    case "staff":
      redirect("/dashboard/staff");

    case "client":
      redirect("/dashboard/client");

    default:
      redirect("/login");
  }
}