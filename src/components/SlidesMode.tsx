import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, GripVertical, Presentation, Loader2 } from "lucide-react";

interface SlideItem {
  id: string;
  type: "room" | "item";
  room_id?: string;
  room_link_id?: string;
  title: string;
  image: string;
  description: string;
}

interface SlidesModeProps {
  projectId: string;
}

const SlidesMode = ({ projectId }: SlidesModeProps) => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [available, setAvailable] = useState<{ rooms: any[]; items: any[] }>({ rooms: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, name")
      .eq("project_id", projectId);

    if (!rooms) { setLoading(false); return; }

    const roomMap: Record<string, string> = {};
    rooms.forEach((r) => { roomMap[r.id] = r.name; });

    const { data: rlRows } = await supabase
      .from("room_links")
      .select("id, link_id, room_id")
      .in("room_id", rooms.map((r) => r.id));

    const linkIds = [...new Set(rlRows?.map((rl) => rl.link_id) || [])];
    const { data: links } = linkIds.length
      ? await supabase.from("links").select("*").in("id", linkIds)
      : { data: [] };

    const linkMap: Record<string, any> = {};
    links?.forEach((l) => { linkMap[l.id] = l; });

    const itemsList = (rlRows || []).map((rl) => {
      const l = linkMap[rl.link_id] || {};
      return {
        room_link_id: rl.id,
        room_id: rl.room_id,
        title: l.title || "Untitled",
        image: l.image || "",
        description: l.description || "",
        room_name: roomMap[rl.room_id] || "",
      };
    });

    setAvailable({
      rooms: rooms.map((r) => ({ id: r.id, name: r.name })),
      items: itemsList,
    });
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addRoomSlide = (roomId: string, roomName: string) => {
    setSlides((prev) => [
      ...prev,
      { id: `room-${roomId}-${Date.now()}`, type: "room", room_id: roomId, title: roomName, image: "", description: "" },
    ]);
  };

  const addItemSlide = (item: any) => {
    setSlides((prev) => [
      ...prev,
      { id: `item-${item.room_link_id}-${Date.now()}`, type: "item", room_link_id: item.room_link_id, title: item.title, image: item.image, description: item.description },
    ]);
  };

  const removeSlide = (idx: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setSlides((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(idx);
  };
  const onDragEnd = () => setDragIdx(null);

  const startPresentation = () => {
    // Store slides in sessionStorage and navigate
    sessionStorage.setItem("presentation-slides", JSON.stringify(slides));
    navigate(`/projects/${projectId}/present`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Slide list */}
      <div className="flex-1 overflow-auto p-6">
        {slides.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center pt-20">
            Add rooms or items from the sidebar to build your presentation
          </p>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={(e) => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                className={`flex items-center gap-3 bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing ${dragIdx === idx ? "opacity-50" : ""}`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground w-6 text-right">{idx + 1}</span>
                {slide.image ? (
                  <img src={slide.image} alt="" className="w-16 h-10 object-cover rounded" />
                ) : (
                  <div className="w-16 h-10 bg-secondary rounded flex items-center justify-center text-[10px] text-muted-foreground">
                    {slide.type === "room" ? "Room" : "Item"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{slide.title}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{slide.type}</p>
                </div>
                <button onClick={() => removeSlide(idx)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {slides.length > 0 && (
          <button
            onClick={startPresentation}
            className="mt-6 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-xs font-medium hover:opacity-90 flex items-center gap-2 mx-auto"
          >
            <Presentation className="w-4 h-4" />
            Present
          </button>
        )}
      </div>

      {/* Sidebar: add slides */}
      <div className="w-56 shrink-0 border-l border-border overflow-auto p-4 space-y-4">
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Rooms</h3>
          <div className="space-y-1">
            {available.rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => addRoomSlide(r.id, r.name)}
                className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-secondary flex items-center gap-2 text-foreground"
              >
                <Plus className="w-3 h-3 text-muted-foreground" /> {r.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Items</h3>
          <div className="space-y-1">
            {available.items.map((item) => (
              <button
                key={item.room_link_id}
                onClick={() => addItemSlide(item)}
                className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-secondary flex items-center gap-2 text-foreground"
              >
                {item.image ? (
                  <img src={item.image} alt="" className="w-5 h-5 object-cover rounded shrink-0" />
                ) : (
                  <Plus className="w-3 h-3 text-muted-foreground shrink-0" />
                )}
                <span className="truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidesMode;
