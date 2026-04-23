import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import ProjectsClient from "./projects-client";

export default async function ProjectsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Initial data fetch on the server for instant render
  const [{ data: projectRows }, { data: rooms }] = await Promise.all([
    supabase.from("projects").select("id, name").order("created_at", { ascending: false }),
    supabase.from("rooms").select("project_id"),
  ]);

  const counts: Record<string, number> = {};
  rooms?.forEach((r) => { counts[r.project_id] = (counts[r.project_id] || 0) + 1; });

  const projects = (projectRows ?? []).map((p) => ({
    ...p,
    room_count: counts[p.id] || 0,
  }));

  return <ProjectsClient initialProjects={projects} userId={user.id} />;
}
