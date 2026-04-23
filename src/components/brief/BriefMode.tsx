"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Save, FileText, User, Send } from "lucide-react";

interface BriefCard {
  id: string;
  type: "about" | "client";
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BriefModeProps {
  projectId: string;
}

const DEFAULT_CARDS: BriefCard[] = [
  { id: "about", type: "about", x: 60, y: 60, width: 420, height: 380 },
  { id: "client", type: "client", x: 540, y: 60, width: 420, height: 380 },
];

const BriefMode = ({ projectId }: BriefModeProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // About fields
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [goals, setGoals] = useState("");

  // Client fields
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");

  // Card positions
  const [cards, setCards] = useState<BriefCard[]>(DEFAULT_CARDS);
  const [dragging, setDragging] = useState<{ id: string; offX: number; offY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("projects")
      .select("description")
      .eq("id", projectId)
      .single()
      .then(({ data }) => {
        if (data?.description) {
          try {
            const parsed = JSON.parse(data.description);
            if (parsed.brief) {
              setDescription(parsed.brief.description || "");
              setAddress(parsed.brief.address || "");
              setGoals(parsed.brief.goals || "");
              setClientName(parsed.brief.clientName || "");
              setClientContact(parsed.brief.clientContact || "");
              if (parsed.brief.cards) setCards(parsed.brief.cards);
            }
          } catch {
            setDescription(data.description);
          }
        }
        setLoading(false);
      });
  }, [projectId]);

  const save = useCallback(async () => {
    setSaving(true);
    const brief = { description, address, goals, clientName, clientContact, cards };
    await supabase
      .from("projects")
      .update({ description: JSON.stringify({ brief }) })
      .eq("id", projectId);
    setSaving(false);
  }, [projectId, description, address, goals, clientName, clientContact, cards]);

  // Auto-save on changes
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => save(), 1200);
    return () => clearTimeout(t);
  }, [description, address, goals, clientName, clientContact, cards, save, loading]);

  const onMouseDown = (id: string, e: React.MouseEvent) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setDragging({ id, offX: e.clientX - card.x, offY: e.clientY - card.y });
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      setCards((prev) =>
        prev.map((c) =>
          c.id === dragging.id
            ? { ...c, x: Math.max(0, e.clientX - dragging.offX), y: Math.max(0, e.clientY - dragging.offY) }
            : c
        )
      );
    },
    [dragging]
  );

  const onMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }
  }, [dragging, onMouseMove, onMouseUp]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div ref={canvasRef} className="flex-1 overflow-auto relative bg-muted/30" style={{ minHeight: 600 }}>
      {/* Save indicator */}
      <div className="absolute top-4 right-4 z-10">
        {saving && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Save className="w-3 h-3" /> Saving…
          </span>
        )}
      </div>

      {cards.map((card) => (
        <div
          key={card.id}
          className="absolute bg-card border border-border rounded-xl shadow-sm overflow-hidden"
          style={{ left: card.x, top: card.y, width: card.width, minHeight: card.height }}
        >
          {/* Drag handle */}
          <div
            onMouseDown={(e) => onMouseDown(card.id, e)}
            className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border cursor-grab active:cursor-grabbing select-none"
          >
            {card.type === "about" ? (
              <>
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">About the Project</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Client</span>
              </>
            )}
          </div>

          {card.type === "about" ? (
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-lg p-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                  rows={3}
                  placeholder="Project overview…"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 block">
                  Address
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Project location…"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 block">
                  Goals
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-lg p-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                  rows={3}
                  placeholder="What do we want to achieve…"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 block">
                  Client Name
                </label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Full name…"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 block">
                  Contact
                </label>
                <input
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Email or phone…"
                />
              </div>
              <button className="mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-xs font-medium hover:opacity-90 transition-opacity">
                <Send className="w-3.5 h-3.5" />
                Submit Brief Form
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BriefMode;
