import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import LandingPage from "./landing-page";

export default async function RootPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/projects");
  return <LandingPage />;
}
