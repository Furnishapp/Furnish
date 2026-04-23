"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Plus, Trash2, DoorOpen, Loader2 } from "lucide-react";

interface Room {
  id: string;
  name: string;
  position_x: number;
  position_y: number;
  link_count: number;
}

interface PlanModeProps {
  projectId: string;
}

const ROOM_W = 180;
const ROOM_H = 100;

const PlanMode = ({ projectId }: PlanModeProps) => {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const fetchRooms = useCallback(async () => {
    const { data: roomRows } = await supabase
      .from("rooms")
      .select("id, name, position_x, position_y")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (!roomRows) { setRooms([]); setLoading(false); return; }

    const { data: roomLinks } = await supabase
      .from("room_links")
      .select("room_id")
      .in("room_id", roomRows.map(r => r.id));

    const counts: Record<string, number> = {};
    roomLinks?.forEach((rl) => { counts[rl.room_id] = (counts[rl.room_id] || 0) + 1; });

    setRooms(roomRows.map((r) => ({
      ...r,
      link_count: counts[r.id] || 0,
    })));
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const px = 60 + Math.random() * 400;
    const py = 60 + Math.random() * 300;
    await supabase.from("rooms").insert({
      name: name.trim(),
      project_id: projectId,
      position_x: px,
      position_y: py,
    });
    setName("");
    setCreating(false);
    fetchRooms();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("rooms").delete().eq("id", id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const onMouseDown = (e: React.MouseEvent, room: Room) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    dragRef.current = {
      id: room.id,
      offsetX: e.clientX - room.position_x,
      offsetY: e.clientY - room.position_y,
    };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, offsetX, offsetY } = dragRef.current;
      const nx = Math.max(0, e.clientX - offsetX);
      const ny = Math.max(0, e.clientY - offsetY);
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, position_x: nx, position_y: ny } : r))
      );
    };

    const onMouseUp = async () => {
      if (!dragRef.current) return;
      const { id } = dragRef.current;
      const room = rooms.find((r) => r.id === id);
      dragRef.current = null;
      if (room) {
        await supabase
          .from("rooms")
          .update({ position_x: room.position_x, position_y: room.position_y })
          .eq("id", id);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [rooms]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 py-3 border-b border-border">
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New room name…"
            className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground px-3 py-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-ring/20"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
          >
            {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add Room
          </button>
        </form>
      </div>

      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {rooms.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Add rooms above to create your floor plan
          </p>
        )}

        {rooms.map((room) => (
          <div
            key={room.id}
            className="absolute group bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none flex flex-col items-center justify-center gap-1"
            style={{
              left: room.position_x,
              top: room.position_y,
              width: ROOM_W,
              height: ROOM_H,
            }}
            onMouseDown={(e) => onMouseDown(e, room)}
            onDoubleClick={() => router.push(`/projects/${projectId}/rooms/${room.id}`)}
          >
            <DoorOpen className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-medium text-card-foreground">{room.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {room.link_count} item{room.link_count !== 1 ? "s" : ""}
            </span>
            <button
              onClick={(e) => handleDelete(room.id, e)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanMode;
