"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Plus, FolderOpen, Loader2, LogOut, Trash2 } from "lucide-react";

interface Project { id: string; name: string; room_count: number; }

export default function ProjectsClient({
  initialProjects,
  orgId,
}: {
  initialProjects: Project[];
  orgId: string;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    const [{ data: projectRows }, { data: rooms }] = await Promise.all([
      supabase.from("projects").select("id, name").order("created_at", { ascending: false }),
      supabase.from("rooms").select("project_id"),
    ]);
    const counts: Record<string, number> = {};
    rooms?.forEach((r) => { counts[r.project_id] = (counts[r.project_id] || 0) + 1; });
    setProjects((projectRows ?? []).map((p) => ({ ...p, room_count: counts[p.id] || 0 })));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    await supabase.from("projects").insert({ name: name.trim(), organization_id: orgId });
    setName("");
    setCreating(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setProjects((p) => p.filter((pr) => pr.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">Projects</h1>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name…"
            className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring/20"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </form>

        {projects.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm pt-20">
            Create your first project above
          </p>
        ) : (
          <div className="grid gap-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => router.push(`/projects/${p.id}`)}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-card-foreground">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {p.room_count} room{p.room_count !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
