"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Presentation, Loader2, Eye, EyeOff, GripVertical, Heart,
  LayoutGrid, DollarSign, FileText, Share2, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";

interface RoomData {
  id: string;
  name: string;
  description: string;
  mood_colors: string[];
  mood_images: string[];
  items: BoardItem[];
}

interface BoardItem {
  id: string;
  title: string;
  image: string;
  description: string;
  url: string;
  price: string;
  status: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  show_caption: boolean;
}

export interface BriefData {
  description: string;
  address: string;
  goals: string;
  clientName: string;
  clientContact: string;
}

export interface SlideData {
  id: string;
  type: "brief" | "mood" | "product" | "budget";
  roomName: string;
  roomId: string;
  hidden: boolean;
  room: RoomData;
  brief?: BriefData;
  projectName?: string;
}

interface SlidesModeProps {
  projectId: string;
}

const TYPE_ICON = { brief: FileText, mood: Heart, product: LayoutGrid, budget: DollarSign };
const TYPE_LABEL = { brief: "Brief", mood: "Mood", product: "Products", budget: "Budget" };

const SlidesMode = ({ projectId }: SlidesModeProps) => {
  const router = useRouter();
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    // Fetch project info
    const { data: project } = await supabase
      .from("projects")
      .select("name, description")
      .eq("id", projectId)
      .single();

    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, name, description, mood_colors, mood_images")
      .eq("project_id", projectId)
      .order("created_at");

    if (!rooms) { setSlides([]); setLoading(false); return; }

    const roomIds = rooms.map((r) => r.id);
    const { data: rlRows } = roomIds.length
      ? await supabase
          .from("room_links")
          .select("id, link_id, room_id, position_x, position_y, width, height, status, show_caption")
          .in("room_id", roomIds)
      : { data: [] };

    const linkIds = [...new Set(rlRows?.map((rl) => rl.link_id) || [])];
    const { data: links } = linkIds.length
      ? await supabase.from("links").select("*").in("id", linkIds)
      : { data: [] };

    const linkMap: Record<string, any> = {};
    links?.forEach((l) => { linkMap[l.id] = l; });

    const roomDataMap: Record<string, RoomData> = {};
    rooms.forEach((r) => {
      roomDataMap[r.id] = {
        id: r.id,
        name: r.name,
        description: r.description || "",
        mood_colors: (r.mood_colors as string[]) || [],
        mood_images: (r.mood_images as string[]) || [],
        items: [],
      };
    });

    rlRows?.forEach((rl) => {
      const l = linkMap[rl.link_id] || {};
      roomDataMap[rl.room_id]?.items.push({
        id: rl.id,
        title: l.title || "",
        image: l.image || "",
        description: l.description || "",
        url: l.url || "",
        price: l.price || "",
        status: rl.status || "idea",
        position_x: rl.position_x,
        position_y: rl.position_y,
        width: rl.width || 260,
        height: rl.height || 200,
        show_caption: rl.show_caption !== false,
      });
    });

    // Parse brief data from project description
    let briefData: BriefData | undefined;
    if (project?.description) {
      try {
        const parsed = JSON.parse(project.description);
        if (parsed.brief) {
          briefData = {
            description: parsed.brief.description || "",
            address: parsed.brief.address || "",
            goals: parsed.brief.goals || "",
            clientName: parsed.brief.clientName || "",
            clientContact: parsed.brief.clientContact || "",
          };
        }
      } catch { /* not JSON, skip */ }
    }

    const generated: SlideData[] = [];

    // Brief slide first
    const emptyRoom: RoomData = { id: "", name: "", description: "", mood_colors: [], mood_images: [], items: [] };
    generated.push({
      id: "brief",
      type: "brief",
      roomName: project?.name || "Project",
      roomId: "",
      hidden: false,
      room: emptyRoom,
      brief: briefData,
      projectName: project?.name,
    });

    // Room slides
    rooms.forEach((r) => {
      const rd = roomDataMap[r.id];
      (["mood", "product", "budget"] as const).forEach((type) => {
        generated.push({
          id: `${r.id}-${type}`,
          type,
          roomName: r.name,
          roomId: r.id,
          hidden: false,
          room: rd,
        });
      });
    });

    setSlides(generated);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleHide = (idx: number) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, hidden: !s.hidden } : s)));
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
    const visible = slides.filter((s) => !s.hidden);
    sessionStorage.setItem("presentation-slides", JSON.stringify(visible));
    router.push(`/projects/${projectId}/present`);
  };

  const sharePresentation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSharing(true);
    try {
      const visible = slides.filter((s) => !s.hidden);

      // Check for existing share
      const { data: existing } = await supabase
        .from("shared_presentations")
        .select("share_token")
        .eq("project_id", projectId)
        .eq("created_by", user.id)
        .limit(1);

      let token: string;

      if (existing && existing.length > 0) {
        // Update existing
        token = existing[0].share_token;
        await supabase
          .from("shared_presentations")
          .update({ slides_data: visible as any })
          .eq("project_id", projectId)
          .eq("created_by", user.id);
      } else {
        // Create new
        const { data, error } = await supabase
          .from("shared_presentations")
          .insert({ project_id: projectId, created_by: user.id, slides_data: visible as any })
          .select("share_token")
          .single();
        if (error) throw error;
        token = data.share_token;
      }

      const url = `${window.location.origin}/shared/${token}`;
      setShareUrl(url);
      toast.success("Share link created!");
    } catch (err) {
      toast.error("Failed to create share link");
    } finally {
      setSharing(false);
    }
  };

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visibleCount = slides.filter((s) => !s.hidden).length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      {slides.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center pt-20">
          Add rooms to your project to generate slides
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">
              {visibleCount} of {slides.length} slides visible
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={sharePresentation}
                disabled={visibleCount === 0 || sharing}
                className="border border-border text-foreground px-4 py-2 rounded-lg text-xs font-medium hover:bg-secondary disabled:opacity-50 flex items-center gap-2"
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                Share
              </button>
              <button
                onClick={startPresentation}
                disabled={visibleCount === 0}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <Presentation className="w-4 h-4" />
                Present
              </button>
            </div>
          </div>

          {/* Share URL banner */}
          {shareUrl && (
            <div className="mb-4 p-3 bg-secondary rounded-lg flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex-1 truncate">{shareUrl}</span>
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-foreground hover:opacity-70"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {slides.map((slide, idx) => {
              const Icon = TYPE_ICON[slide.type];
              return (
                <div
                  key={slide.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnd={onDragEnd}
                  className={`relative border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                    slide.hidden
                      ? "border-border/50 opacity-40"
                      : "border-border hover:border-primary/30"
                  } ${dragIdx === idx ? "opacity-30" : ""}`}
                >
                  <div className="aspect-video bg-card overflow-hidden relative">
                    <SlidePreview slide={slide} />
                  </div>
                  <div className="px-3 py-2 bg-card border-t border-border flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                    <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground truncate">{slide.roomName}</p>
                      <p className="text-[9px] text-muted-foreground">{TYPE_LABEL[slide.type]}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleHide(idx); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {slide.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Mini previews ──────────────────────────────────────
const SlidePreview = ({ slide }: { slide: SlideData }) => {
  if (slide.type === "brief") return <BriefPreview slide={slide} />;
  if (slide.type === "mood") return <MoodPreview room={slide.room} />;
  if (slide.type === "product") return <ProductPreview room={slide.room} />;
  return <BudgetPreview room={slide.room} />;
};

const BriefPreview = ({ slide }: { slide: SlideData }) => (
  <div className="w-full h-full p-3 flex flex-col gap-1">
    <p className="text-[9px] font-semibold text-foreground">{slide.projectName || "Project"}</p>
    <p className="text-[7px] text-muted-foreground">Brief</p>
    {slide.brief && (
      <>
        {slide.brief.description && (
          <p className="text-[7px] text-muted-foreground line-clamp-2">{slide.brief.description}</p>
        )}
        {slide.brief.clientName && (
          <p className="text-[7px] text-muted-foreground mt-auto">Client: {slide.brief.clientName}</p>
        )}
      </>
    )}
  </div>
);

const MoodPreview = ({ room }: { room: RoomData }) => (
  <div className="w-full h-full p-3 flex flex-col gap-2">
    <p className="text-[9px] font-semibold text-foreground truncate">{room.name}</p>
    {room.description && (
      <p className="text-[8px] text-muted-foreground line-clamp-2">{room.description}</p>
    )}
    {room.mood_colors.length > 0 && (
      <div className="flex gap-0.5">
        {room.mood_colors.slice(0, 8).map((c) => (
          <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
      </div>
    )}
    {room.mood_images.length > 0 && (
      <div className="flex-1 flex gap-1 overflow-hidden">
        {room.mood_images.slice(0, 3).map((url, i) => (
          <img key={i} src={url} alt="" className="h-full object-cover rounded-sm flex-1 min-w-0" />
        ))}
      </div>
    )}
  </div>
);

const ProductPreview = ({ room }: { room: RoomData }) => (
  <div className="w-full h-full relative p-1">
    {room.items.length === 0 && (
      <p className="text-[8px] text-muted-foreground absolute inset-0 flex items-center justify-center">No products</p>
    )}
    {room.items.slice(0, 12).map((item) => {
      const scale = 0.12;
      return (
        <div
          key={item.id}
          className="absolute bg-secondary rounded-sm overflow-hidden"
          style={{
            left: item.position_x * scale,
            top: item.position_y * scale,
            width: item.width * scale,
            height: item.height * scale,
          }}
        >
          {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
        </div>
      );
    })}
  </div>
);

const BudgetPreview = ({ room }: { room: RoomData }) => {
  const withPrice = room.items.filter((i) => i.price && !isNaN(parseFloat(i.price)));
  const total = withPrice.reduce((s, i) => s + parseFloat(i.price), 0);
  return (
    <div className="w-full h-full p-3 flex flex-col gap-1">
      <p className="text-[9px] font-semibold text-foreground">{room.name} — Budget</p>
      <p className="text-[8px] text-muted-foreground">{room.items.length} items</p>
      <p className="text-[10px] font-bold text-foreground mt-auto">{total.toFixed(2)} €</p>
      {room.items.slice(0, 4).map((item) => (
        <div key={item.id} className="flex items-center gap-1">
          <div className="w-2 h-2 bg-secondary rounded-sm shrink-0" />
          <span className="text-[7px] text-muted-foreground truncate flex-1">{item.title || "—"}</span>
          <span className="text-[7px] text-foreground">{item.price || "—"}</span>
        </div>
      ))}
    </div>
  );
};

export default SlidesMode;
