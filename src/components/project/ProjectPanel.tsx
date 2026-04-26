"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  ArrowLeft,
  MapPin,
  Edit3,
  Check,
  X,
  ImageIcon,
  Loader2,
} from "lucide-react";

interface ProjectPanelProps {
  projectId: string;
  projectName: string;
}

interface BriefData {
  description: string;
  address: string;
  goals: string;
  clientName: string;
  clientContact: string;
}

async function loadBriefFromDb(projectId: string): Promise<BriefData> {
  const { data } = await supabase
    .from("projects")
    .select("description")
    .eq("id", projectId)
    .single();

  if (!data?.description) return { description: "", address: "", goals: "", clientName: "", clientContact: "" };

  try {
    const parsed = JSON.parse(data.description);
    const b = parsed.brief ?? {};
    return {
      description: b.description ?? "",
      address: b.address ?? "",
      goals: b.goals ?? "",
      clientName: b.clientName ?? "",
      clientContact: b.clientContact ?? "",
    };
  } catch {
    return { description: data.description, address: "", goals: "", clientName: "", clientContact: "" };
  }
}

async function saveBriefToDb(projectId: string, updates: Partial<BriefData>) {
  const { data } = await supabase
    .from("projects")
    .select("description")
    .eq("id", projectId)
    .single();

  let current: Record<string, unknown> = {};
  if (data?.description) {
    try { current = JSON.parse(data.description); } catch {}
  }

  const merged = { ...(current.brief as object ?? {}), ...updates };
  await supabase
    .from("projects")
    .update({ description: JSON.stringify({ ...current, brief: merged }) })
    .eq("id", projectId);
}

export default function ProjectPanel({ projectId, projectName }: ProjectPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [goals, setGoals] = useState("");
  const [moodImages, setMoodImages] = useState<string[]>([]);

  // Draft state for editing
  const [draftDescription, setDraftDescription] = useState("");
  const [draftAddress, setDraftAddress] = useState("");
  const [draftGoals, setDraftGoals] = useState("");

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const [brief, { data: rooms }] = await Promise.all([
        loadBriefFromDb(projectId),
        supabase
          .from("rooms")
          .select("mood_images")
          .eq("project_id", projectId),
      ]);

      setDescription(brief.description);
      setAddress(brief.address);
      setGoals(brief.goals);

      if (rooms) {
        const imgs = rooms
          .flatMap((r) => (r.mood_images as string[]) ?? [])
          .filter(Boolean)
          .slice(0, 8);
        setMoodImages(imgs);
      }

      setLoading(false);
    }
    load();
  }, [projectId]);

  const startEdit = () => {
    setDraftDescription(description);
    setDraftAddress(address);
    setDraftGoals(goals);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = useCallback(async () => {
    setEditing(false);
    setDescription(draftDescription);
    setAddress(draftAddress);
    setGoals(draftGoals);

    setSaving(true);
    await saveBriefToDb(projectId, {
      description: draftDescription,
      address: draftAddress,
      goals: draftGoals,
    });
    setSaving(false);
  }, [projectId, draftDescription, draftAddress, draftGoals]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Glass card */}
      <div
        className="flex-1 flex flex-col overflow-hidden rounded-2xl relative"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.85)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.08), 0 1.5px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.04) inset",
        }}
      >
        {/* Top bar: back + save indicator */}
        <div className="shrink-0 flex items-center gap-2 px-4 pt-4 pb-2">
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-foreground/70" />
          </button>

          <div className="flex-1" />

          {saving && (
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Saving
            </span>
          )}

          {!editing ? (
            <button
              onClick={startEdit}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
            >
              <Edit3 className="w-3 h-3 text-foreground/60" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={cancelEdit}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
              >
                <X className="w-3 h-3 text-foreground/60" />
              </button>
              <button
                onClick={confirmEdit}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-primary hover:opacity-90 transition-opacity"
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
          {/* Project name */}
          <div>
            <h1 className="text-lg font-semibold text-foreground leading-tight tracking-tight">
              {projectName}
            </h1>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60">
                Address
              </span>
            </div>
            {editing ? (
              <input
                value={draftAddress}
                onChange={(e) => setDraftAddress(e.target.value)}
                className="w-full bg-white/60 border border-white/70 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Project location…"
              />
            ) : (
              <p className="text-sm text-foreground/80">
                {address || <span className="text-muted-foreground/50 italic">No address set</span>}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-black/[0.06]" />

          {/* Description */}
          <div>
            <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60 block mb-1.5">
              Description
            </span>
            {editing ? (
              <textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                className="w-full bg-white/60 border border-white/70 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                rows={4}
                placeholder="Project overview…"
              />
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {description || <span className="text-muted-foreground/50 italic">No description yet</span>}
              </p>
            )}
          </div>

          {/* Goals */}
          <div>
            <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60 block mb-1.5">
              Goals
            </span>
            {editing ? (
              <textarea
                value={draftGoals}
                onChange={(e) => setDraftGoals(e.target.value)}
                className="w-full bg-white/60 border border-white/70 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                rows={3}
                placeholder="What do we want to achieve…"
              />
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {goals || <span className="text-muted-foreground/50 italic">No goals defined</span>}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-black/[0.06]" />

          {/* Mood board */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ImageIcon className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60">
                Mood Board
              </span>
            </div>

            {moodImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {moodImages.map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden bg-black/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-black/10 bg-black/[0.02] h-28 flex flex-col items-center justify-center gap-1.5">
                <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                <span className="text-[11px] text-muted-foreground/40">
                  Add room moodboards to populate
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
