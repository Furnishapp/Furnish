import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Loader2, ArrowLeft, ExternalLink, Pencil, Trash2, DollarSign, LayoutGrid, Heart, Eye, EyeOff } from "lucide-react";
import RoomBudgetView from "@/components/RoomBudgetView";
import MoodMode from "@/components/MoodMode";
import ProjectProductPanel from "@/components/ProjectProductPanel";

interface RoomLink {
  id: string;
  link_id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  price: string;
  status: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  show_caption: boolean;
}

const CARD_MIN_W = 160;
const CARD_MIN_H = 100;

type RoomTab = "mood" | "product" | "budget";

const RoomView = () => {
  const { user } = useAuth();
  const { projectId, roomId } = useParams<{ projectId: string; roomId: string }>();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [cards, setCards] = useState<RoomLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<RoomTab>("product");

  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const fetchCards = useCallback(async () => {
    if (!roomId) return;
    const { data: room } = await supabase.from("rooms").select("name").eq("id", roomId).single();
    if (room) setRoomName(room.name);

    const { data: rlRows } = await supabase
      .from("room_links")
      .select("id, link_id, position_x, position_y, width, height, status, show_caption")
      .eq("room_id", roomId);

    if (!rlRows || rlRows.length === 0) { setCards([]); setLoading(false); return; }

    const linkIds = rlRows.map((r) => r.link_id);
    const { data: links } = await supabase.from("links").select("*").in("id", linkIds);

    const linkMap: Record<string, any> = {};
    links?.forEach((l) => { linkMap[l.id] = l; });

    setCards(
      rlRows.map((rl) => {
        const l = linkMap[rl.link_id] || {};
        return {
          id: rl.id,
          link_id: rl.link_id,
          url: l.url || "",
          title: l.title || "",
          description: l.description || "",
          image: l.image || "",
          price: l.price || "",
          status: rl.status || "idea",
          position_x: rl.position_x,
          position_y: rl.position_y,
          width: rl.width || 260,
          height: rl.height || 200,
          show_caption: rl.show_caption !== false,
        };
      })
    );
    setLoading(false);
  }, [roomId]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !user || !roomId) return;
    setFetching(true);

    try {
      const { data: preview, error } = await supabase.functions.invoke("preview", {
        body: { url: url.trim() },
      });
      if (error) throw error;

      const { data: newLink } = await supabase
        .from("links")
        .insert({
          user_id: user.id,
          url: url.trim(),
          title: preview?.title || "",
          description: preview?.description || "",
          image: preview?.image || "",
        })
        .select()
        .single();

      if (newLink) {
        const px = 40 + Math.random() * 400;
        const py = 40 + Math.random() * 300;
        await supabase.from("room_links").insert({
          room_id: roomId,
          link_id: newLink.id,
          position_x: px,
          position_y: py,
        });
      }
      setUrl("");
      fetchCards();
    } catch (err) {
      console.error("Failed to add link:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleRemove = async (rlId: string) => {
    await supabase.from("room_links").delete().eq("id", rlId);
    setCards((prev) => prev.filter((c) => c.id !== rlId));
  };

  const handleToggleCaption = async (rlId: string, current: boolean) => {
    const next = !current;
    await supabase.from("room_links").update({ show_caption: next }).eq("id", rlId);
    setCards((prev) => prev.map((c) => (c.id === rlId ? { ...c, show_caption: next } : c)));
  };

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent, card: RoomLink) => {
    e.preventDefault();
    dragRef.current = {
      id: card.id,
      offsetX: e.clientX - card.position_x,
      offsetY: e.clientY - card.position_y,
    };
  };

  // Resize handlers
  const onResizeStart = (e: React.MouseEvent, card: RoomLink) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      id: card.id,
      startX: e.clientX,
      startY: e.clientY,
      startW: card.width,
      startH: card.height,
    };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const { id, offsetX, offsetY } = dragRef.current;
        const nx = e.clientX - offsetX;
        const ny = e.clientY - offsetY;
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, position_x: nx, position_y: ny } : c))
        );
      }
      if (resizeRef.current) {
        const { id, startX, startY, startW, startH } = resizeRef.current;
        const nw = Math.max(CARD_MIN_W, startW + (e.clientX - startX));
        const nh = Math.max(CARD_MIN_H, startH + (e.clientY - startY));
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, width: nw, height: nh } : c))
        );
      }
    };

    const onMouseUp = async () => {
      if (dragRef.current) {
        const { id } = dragRef.current;
        const card = cards.find((c) => c.id === id);
        dragRef.current = null;
        if (card) {
          await supabase
            .from("room_links")
            .update({ position_x: card.position_x, position_y: card.position_y })
            .eq("id", id);
        }
      }
      if (resizeRef.current) {
        const { id } = resizeRef.current;
        const card = cards.find((c) => c.id === id);
        resizeRef.current = null;
        if (card) {
          await supabase
            .from("room_links")
            .update({ width: card.width, height: card.height })
            .eq("id", id);
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [cards]);

  const handleUpdateField = async (linkId: string, fields: { title?: string; price?: string }) => {
    await supabase.from("links").update(fields).eq("id", linkId);
    setCards((prev) =>
      prev.map((c) => (c.link_id === linkId ? { ...c, ...fields } : c))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabItems: { key: RoomTab; label: string; icon: typeof Heart }[] = [
    { key: "mood", label: "Mood", icon: Heart },
    { key: "product", label: "Products", icon: LayoutGrid },
    { key: "budget", label: "Budget", icon: DollarSign },
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="shrink-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/projects/${projectId}`)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{roomName}</h1>
          <span className="text-xs text-muted-foreground">{cards.length} item{cards.length !== 1 ? "s" : ""}</span>

          {/* Tabs */}
          <div className="ml-4 flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            {tabItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {activeTab === "product" && (
            <form onSubmit={handleAddLink} className="ml-auto flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a URL…"
                className="w-64 bg-secondary text-foreground placeholder:text-muted-foreground px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-ring/20"
                required
              />
              <button
                type="submit"
                disabled={fetching}
                className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
              >
                {fetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Add
              </button>
            </form>
          )}
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === "mood" && roomId ? (
            <MoodMode roomId={roomId} />
          ) : activeTab === "budget" && roomId ? (
            <RoomBudgetView roomId={roomId} />
          ) : (
            <div
              ref={canvasRef}
              className="flex-1 relative overflow-auto"
              style={{ backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            >
              {cards.length === 0 && (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  Add links above to start your moodboard
                </p>
              )}

              {cards.map((card) => (
                <DraggableCard
                  key={card.id}
                  card={card}
                  onMouseDown={(e) => onMouseDown(e, card)}
                  onResizeStart={(e) => onResizeStart(e, card)}
                  onRemove={() => handleRemove(card.id)}
                  onToggleCaption={() => handleToggleCaption(card.id, card.show_caption)}
                  onUpdate={(fields) => handleUpdateField(card.link_id, fields)}
                />
              ))}
            </div>
          )}
        </div>
        {projectId && (
          <ProjectProductPanel
            projectId={projectId}
            currentRoomId={roomId}
            onProductAdded={fetchCards}
          />
        )}
      </div>
    </div>
  );
};

// ── Card Component ──────────────────────────────────────
interface DraggableCardProps {
  card: RoomLink;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onToggleCaption: () => void;
  onUpdate: (fields: { title?: string; price?: string }) => void;
}

const DraggableCard = ({ card, onMouseDown, onResizeStart, onRemove, onToggleCaption, onUpdate }: DraggableCardProps) => {
  const [editTitle, setEditTitle] = useState(false);
  const [editPrice, setEditPrice] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [price, setPrice] = useState(card.price);

  return (
    <div
      className="absolute group bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow select-none"
      style={{ left: card.position_x, top: card.position_y, width: card.width, minHeight: CARD_MIN_H }}
      onMouseDown={onMouseDown}
    >
      {card.image && (
        <img src={card.image} alt={card.title} className="w-full object-cover pointer-events-none" style={{ maxHeight: card.height - (card.show_caption ? 60 : 0) }} loading="lazy" draggable={false} />
      )}

      {card.show_caption && (
        <div className="p-3 space-y-1.5" onMouseDown={(e) => e.stopPropagation()}>
          {editTitle ? (
            <input
              className="w-full bg-secondary px-2 py-1 rounded text-xs font-medium text-card-foreground outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => { setEditTitle(false); onUpdate({ title }); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setEditTitle(false); onUpdate({ title }); } }}
              autoFocus
            />
          ) : (
            <h3
              className="text-xs font-medium text-card-foreground cursor-pointer flex items-center gap-1"
              onClick={() => setEditTitle(true)}
            >
              {title || "Untitled"}
              <Pencil className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </h3>
          )}

          <div className="flex items-center justify-between pt-0.5">
            {card.url ? (
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-[55%]"
              >
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                {(() => { try { return new URL(card.url).hostname; } catch { return card.url; } })()}
              </a>
            ) : (
              <span />
            )}

            {editPrice ? (
              <input
                className="w-20 bg-primary/10 border border-primary/20 px-2 py-1 rounded text-xs text-right font-medium text-foreground outline-none focus:border-primary/40"
                value={price}
                placeholder="0.00"
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => { setEditPrice(false); onUpdate({ price }); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setEditPrice(false); onUpdate({ price }); } }}
                autoFocus
              />
            ) : (
              <button
                className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                  price
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
                onClick={() => setEditPrice(true)}
              >
                {price ? `${price} €` : "+ price"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onMouseDown={(e) => e.stopPropagation()}>
        <button
          onClick={onToggleCaption}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded p-1 text-muted-foreground hover:text-foreground"
          title={card.show_caption ? "Hide caption" : "Show caption"}
        >
          {card.show_caption ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
        <button
          onClick={onRemove}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded p-1 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={onResizeStart}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-muted-foreground">
          <path d="M14 14L8 14L14 8Z" fill="currentColor" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
};

export default RoomView;
