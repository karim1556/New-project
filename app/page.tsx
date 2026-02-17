import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function HomePage() {
  const session = getSession();
  if (!session) {
    redirect("/login");
  }
  redirect(session.role === "admin" ? "/admin" : "/member");
}
