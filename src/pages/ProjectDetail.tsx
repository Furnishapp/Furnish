import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Loader2, ArrowLeft, Trash2, DoorOpen } from "lucide-react";

interface Room {
  id: string;
  name: string;
  link_count: number;
}

const ProjectDetail = () => {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    if (!user || !projectId) return;

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();

    if (project) setProjectName(project.name);

    const { data: roomRows } = await supabase
      .from("rooms")
      .select("id, name")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (!roomRows) { setLoading(false); return; }

    // Get link counts per room
    const { data: roomLinks } = await supabase
      .from("room_links")
      .select("room_id");

    const counts: Record<string, number> = {};
    roomLinks?.forEach((rl) => { counts[rl.room_id] = (counts[rl.room_id] || 0) + 1; });

    setRooms(roomRows.map((r) => ({ ...r, link_count: counts[r.id] || 0 })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;
    setCreating(true);
    await supabase.from("rooms").insert({ name: name.trim(), project_id: projectId });
    setName("");
    setCreating(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("rooms").delete().eq("id", id);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-semibold text-foreground">{projectName}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New room name…"
            className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring/20"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Room
          </button>
        </form>

        {rooms.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm pt-20">Add your first room above</p>
        ) : (
          <div className="grid gap-3">
            {rooms.map((r) => (
              <div
                key={r.id}
                className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${projectId}/rooms/${r.id}`)}
              >
                <div className="flex items-center gap-3">
                  <DoorOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-card-foreground">{r.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{r.link_count} link{r.link_count !== 1 ? "s" : ""}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
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
};

export default ProjectDetail;
