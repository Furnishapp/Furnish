import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExternalLink, Plus, Loader2, Package, ChevronUp, X, Search } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectLink {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  price: string;
  rooms: { roomId: string; roomName: string; roomLinkId: string }[];
}

interface Room {
  id: string;
  name: string;
}

interface ProjectProductPanelProps {
  projectId: string;
  currentRoomId?: string;
  onProductAdded?: () => void;
}

const ProjectProductPanel = ({ projectId, currentRoomId, onProductAdded }: ProjectProductPanelProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<ProjectLink[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [addingToRoom, setAddingToRoom] = useState<string | null>(null);
  const [quickUrl, setQuickUrl] = useState("");
  const [quickAdding, setQuickAdding] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!user) return;

    const { data: projectRooms } = await supabase
      .from("rooms")
      .select("id, name")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (!projectRooms || projectRooms.length === 0) {
      setRooms([]);
      setProducts([]);
      setLoading(false);
      return;
    }
    setRooms(projectRooms);

    const roomIds = projectRooms.map((r) => r.id);
    const { data: rlRows } = await supabase
      .from("room_links")
      .select("id, link_id, room_id")
      .in("room_id", roomIds);

    if (!rlRows || rlRows.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const linkIds = [...new Set(rlRows.map((rl) => rl.link_id))];
    const { data: links } = await supabase.from("links").select("*").in("id", linkIds);

    const roomMap: Record<string, string> = {};
    projectRooms.forEach((r) => { roomMap[r.id] = r.name; });

    const linkMap: Record<string, ProjectLink> = {};
    links?.forEach((l) => {
      linkMap[l.id] = {
        id: l.id,
        url: l.url,
        title: l.title || "",
        description: l.description || "",
        image: l.image || "",
        price: l.price || "",
        rooms: [],
      };
    });

    rlRows.forEach((rl) => {
      if (linkMap[rl.link_id]) {
        linkMap[rl.link_id].rooms.push({
          roomId: rl.room_id,
          roomName: roomMap[rl.room_id] || "",
          roomLinkId: rl.id,
        });
      }
    });

    setProducts(Object.values(linkMap));
    setLoading(false);
  }, [projectId, user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAddToRoom = async (linkId: string, roomId: string) => {
    setAddingToRoom(linkId);
    const px = 40 + Math.random() * 400;
    const py = 40 + Math.random() * 300;
    await supabase.from("room_links").insert({
      room_id: roomId,
      link_id: linkId,
      position_x: px,
      position_y: py,
    });
    await fetchProducts();
    setAddingToRoom(null);
    onProductAdded?.();
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim() || !user) return;
    setQuickAdding(true);
    try {
      const { data: preview } = await supabase.functions.invoke("preview", {
        body: { url: quickUrl.trim() },
      });
      const { data: newLink } = await supabase
        .from("links")
        .insert({
          user_id: user.id,
          url: quickUrl.trim(),
          title: preview?.title || "",
          description: preview?.description || "",
          image: preview?.image || "",
        })
        .select()
        .single();

      // If on a room page, also place it on the current room board
      if (newLink && currentRoomId) {
        const px = 40 + Math.random() * 400;
        const py = 40 + Math.random() * 300;
        await supabase.from("room_links").insert({
          room_id: currentRoomId,
          link_id: newLink.id,
          position_x: px,
          position_y: py,
        });
      }
      setQuickUrl("");
      await fetchProducts();
      onProductAdded?.();
    } catch (err) {
      console.error("Quick add failed:", err);
    } finally {
      setQuickAdding(false);
    }
  };

  const filtered = products.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.url.toLowerCase().includes(search.toLowerCase())
  );

  const panelContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border space-y-2">
        <form onSubmit={handleQuickAdd} className="flex gap-1.5">
          <input
            type="url"
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            placeholder="Paste URL to add product…"
            className="flex-1 min-w-0 bg-secondary text-foreground placeholder:text-muted-foreground px-2.5 py-1.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-ring/20"
            required
          />
          <button
            type="submit"
            disabled={quickAdding}
            className="shrink-0 bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            title={currentRoomId ? "Add product (also placed on this room)" : "Add product to project"}
          >
            {quickAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </button>
        </form>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-8 pr-3 py-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 p-6">
          <Package className="w-8 h-8 opacity-50" />
          <p className="text-xs">{search ? "No matching products" : "No products yet"}</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {filtered.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                rooms={rooms}
                currentRoomId={currentRoomId}
                addingToRoom={addingToRoom}
                onAddToRoom={handleAddToRoom}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="px-4 py-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          {products.length} product{products.length !== 1 ? "s" : ""} across {rooms.length} room{rooms.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:opacity-90 transition-opacity"
        >
          <Package className="w-5 h-5" />
        </button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="pb-0">
              <DrawerTitle className="text-sm">All Products</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 min-h-0 overflow-hidden">
              {panelContent}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Tablet+: collapsible right panel
  return (
    <div className={`shrink-0 border-l border-border bg-card flex flex-col transition-all duration-200 ${open ? "w-72" : "w-10"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="shrink-0 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
        title={open ? "Collapse products" : "Expand products"}
      >
        {open ? <X className="w-4 h-4" /> : <Package className="w-4 h-4" />}
      </button>

      {open && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <h2 className="px-4 pb-2 text-xs font-semibold text-foreground">All Products</h2>
          {panelContent}
        </div>
      )}
    </div>
  );
};

// ── Product Item ──────────────────────────────────────
interface ProductItemProps {
  product: ProjectLink;
  rooms: Room[];
  currentRoomId?: string;
  addingToRoom: string | null;
  onAddToRoom: (linkId: string, roomId: string) => void;
}

const ProductItem = ({ product, rooms, currentRoomId, addingToRoom, onAddToRoom }: ProductItemProps) => {
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const usedRoomIds = new Set(product.rooms.map((r) => r.roomId));
  const availableRooms = rooms.filter((r) => !usedRoomIds.has(r.id));

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="flex gap-2 p-2">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-12 h-12 rounded object-cover shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-secondary shrink-0 flex items-center justify-center">
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-foreground truncate">{product.title || "Untitled"}</h4>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 truncate"
          >
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            {(() => { try { return new URL(product.url).hostname; } catch { return product.url; } })()}
          </a>
          {product.price && (
            <span className="text-[10px] font-medium text-primary">{product.price} €</span>
          )}
        </div>
      </div>

      {/* Rooms used */}
      <div className="px-2 pb-2 flex flex-wrap gap-1">
        {product.rooms.map((r) => (
          <span
            key={r.roomLinkId}
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              r.roomId === currentRoomId
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {r.roomName}
          </span>
        ))}

        {availableRooms.length > 0 && (
          currentRoomId && availableRooms.some((r) => r.id === currentRoomId) ? (
            <button
              onClick={() => onAddToRoom(product.id, currentRoomId)}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-0.5"
              disabled={addingToRoom === product.id}
            >
              {addingToRoom === product.id ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <Plus className="w-2.5 h-2.5" />
              )}
              Add here
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowRoomPicker(!showRoomPicker)}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                disabled={addingToRoom === product.id}
              >
                {addingToRoom === product.id ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Plus className="w-2.5 h-2.5" />
                )}
                Add to room
              </button>

              {showRoomPicker && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                  {availableRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => { onAddToRoom(product.id, room.id); setShowRoomPicker(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent transition-colors"
                    >
                      {room.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectProductPanel;
