"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Plus,
  FolderOpen,
  Loader2,
  LogOut,
  Trash2,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Edit2,
  Check,
  X,
  Upload,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ── Types ────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  status: string;
  cover_url: string | null;
  updated_at: string;
  room_count: number;
}

// ── Helpers ──────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  draft:    "Draft",
  active:   "Active",
  archived: "Archived",
};

const STATUS_CLS: Record<string, string> = {
  draft:    "bg-secondary text-muted-foreground",
  active:   "bg-green-100 text-green-800",
  archived: "bg-amber-100 text-amber-800",
};

function coverGradient(name: string): string {
  const palettes = [
    ["#e8d5c4", "#c4a882"],
    ["#d4e8d5", "#82a882"],
    ["#c4d4e8", "#8296a8"],
    ["#e8c4d4", "#a88296"],
    ["#e8e4c4", "#a8a080"],
    ["#c4e8e8", "#80a8a8"],
  ];
  const [from, to] = palettes[(name.charCodeAt(0) || 0) % palettes.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ── Component ────────────────────────────────────────────────────

export default function ProjectsClient({
  initialProjects,
  orgId,
}: {
  initialProjects: Project[];
  orgId: string;
}) {
  const router = useRouter();
  const [projects, setProjects]     = useState<Project[]>(initialProjects);
  const [filter, setFilter]         = useState<"active" | "archived">("active");

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState("");
  const [creating, setCreating]     = useState(false);

  // Rename
  const [renamingId, setRenamingId]   = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Delete modal
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);

  // Cover upload — one hidden <input> ref per card
  const uploadRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Data helpers ───────────────────────────────────────────────

  const refresh = useCallback(async () => {
    const [{ data: rows }, { data: rooms }] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, status, cover_url, updated_at")
        .order("updated_at", { ascending: false }),
      supabase.from("rooms").select("project_id"),
    ]);
    const counts: Record<string, number> = {};
    rooms?.forEach((r) => { counts[r.project_id] = (counts[r.project_id] || 0) + 1; });
    setProjects((rows ?? []).map((p) => ({ ...p, room_count: counts[p.id] || 0 })));
  }, []);

  // ── Actions ────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    await supabase
      .from("projects")
      .insert({ name: newName.trim(), organization_id: orgId, status: "draft" });
    setNewName("");
    setShowCreate(false);
    setCreating(false);
    refresh();
  };

  const startRename = (p: Project) => {
    setRenamingId(p.id);
    setRenameValue(p.name);
    setOpenMenuId(null);
  };

  const confirmRename = async (id: string) => {
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (!trimmed) return;
    await supabase.from("projects").update({ name: trimmed }).eq("id", id);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p)));
  };

  const handleSetStatus = async (id: string, status: string) => {
    setOpenMenuId(null);
    await supabase.from("projects").update({ status }).eq("id", id);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from("projects").delete().eq("id", deleteId);
    setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  };

  const handleCoverUpload = async (projectId: string, file: File) => {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${projectId}/cover.${ext}`;
    const { error } = await supabase.storage
      .from("project-covers")
      .upload(path, file, { upsert: true });
    if (error) return;
    const { data: { publicUrl } } = supabase.storage
      .from("project-covers")
      .getPublicUrl(path);
    await supabase.from("projects").update({ cover_url: publicUrl }).eq("id", projectId);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, cover_url: publicUrl } : p))
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  // ── Derived state ──────────────────────────────────────────────

  const displayed = projects.filter((p) =>
    filter === "archived" ? p.status === "archived" : p.status !== "archived"
  );
  const archivedCount = projects.filter((p) => p.status === "archived").length;

  const deletingProject = projects.find((p) => p.id === deleteId);

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">Projects</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              New project
            </button>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Inline create form ── */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="flex gap-2 p-4 bg-card border border-border rounded-xl shadow-sm"
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name…"
              className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewName(""); }}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-opacity"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create
            </button>
          </form>
        )}

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg w-fit">
          {(["active", "archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "active" ? "Active" : (
                <>Archived{archivedCount > 0 && <span className="ml-1.5 text-xs opacity-60">({archivedCount})</span>}</>
              )}
            </button>
          ))}
        </div>

        {/* ── Project grid / empty state ── */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <FolderOpen className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {filter === "archived" ? "No archived projects" : "No projects yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {filter === "archived"
                ? "Archive a project from its action menu."
                : "Hit «New project» to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                renamingId={renamingId}
                renameValue={renameValue}
                openMenuId={openMenuId}
                uploadRef={(el) => { uploadRefs.current[project.id] = el; }}
                onOpen={() => router.push(`/projects/${project.id}`)}
                onMenuToggle={() =>
                  setOpenMenuId((id) => (id === project.id ? null : project.id))
                }
                onMenuClose={() => setOpenMenuId(null)}
                onStartRename={() => startRename(project)}
                onRenameChange={setRenameValue}
                onRenameConfirm={() => confirmRename(project.id)}
                onRenameCancel={() => setRenamingId(null)}
                onSetStatus={(s) => handleSetStatus(project.id, s)}
                onDeleteRequest={() => { setDeleteId(project.id); setOpenMenuId(null); }}
                onCoverClick={() => uploadRefs.current[project.id]?.click()}
                onCoverChange={(file) => handleCoverUpload(project.id, file)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Delete confirmation modal ── */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{deletingProject?.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              This permanently deletes the project along with all its rooms, mood boards,
              and linked products. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-opacity"
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete project
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── ProjectCard sub-component ─────────────────────────────────────

function ProjectCard({
  project,
  renamingId,
  renameValue,
  openMenuId,
  uploadRef,
  onOpen,
  onMenuToggle,
  onMenuClose,
  onStartRename,
  onRenameChange,
  onRenameConfirm,
  onRenameCancel,
  onSetStatus,
  onDeleteRequest,
  onCoverClick,
  onCoverChange,
}: {
  project: Project;
  renamingId: string | null;
  renameValue: string;
  openMenuId: string | null;
  uploadRef: (el: HTMLInputElement | null) => void;
  onOpen: () => void;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onStartRename: () => void;
  onRenameChange: (v: string) => void;
  onRenameConfirm: () => void;
  onRenameCancel: () => void;
  onSetStatus: (s: string) => void;
  onDeleteRequest: () => void;
  onCoverClick: () => void;
  onCoverChange: (f: File) => void;
}) {
  const isRenaming = renamingId === project.id;
  const menuOpen   = openMenuId === project.id;

  return (
    <div
      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => { if (!isRenaming && !menuOpen) onOpen(); }}
    >
      {/* ── Cover ── */}
      <div
        className="relative h-36"
        style={
          project.cover_url
            ? { backgroundImage: `url(${project.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: coverGradient(project.name) }
        }
        onClick={(e) => { e.stopPropagation(); onCoverClick(); }}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground shadow-sm">
            <Upload className="w-3 h-3" />
            {project.cover_url ? "Change cover" : "Add cover"}
          </span>
        </div>
        <input
          ref={uploadRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onCoverChange(f); }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* ── Body ── */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">

          {/* Name / rename input */}
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            {isRenaming ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => onRenameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")  onRenameConfirm();
                    if (e.key === "Escape") onRenameCancel();
                  }}
                  onBlur={onRenameConfirm}
                  className="flex-1 min-w-0 bg-secondary border border-primary/30 rounded-md px-2 py-0.5 text-sm font-semibold text-foreground focus:outline-none"
                />
                <button onClick={onRenameConfirm} className="text-primary shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={onRenameCancel} className="text-muted-foreground shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
            )}
          </div>

          {/* Action menu */}
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onMenuToggle}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={onMenuClose} />
                <div className="absolute right-0 top-7 z-20 w-44 bg-popover border border-border rounded-xl shadow-lg py-1 text-sm">
                  <button
                    onClick={() => { onMenuClose(); onOpen(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors text-foreground"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    Open
                  </button>
                  <button
                    onClick={onStartRename}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors text-foreground"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    Rename
                  </button>

                  {/* draft ↔ active toggle */}
                  {project.status === "draft" && (
                    <button
                      onClick={() => onSetStatus("active")}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors text-foreground"
                    >
                      <Check className="w-3.5 h-3.5 text-muted-foreground" />
                      Mark as active
                    </button>
                  )}
                  {project.status === "active" && (
                    <button
                      onClick={() => onSetStatus("draft")}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      Mark as draft
                    </button>
                  )}

                  {/* Archive / Unarchive */}
                  {project.status !== "archived" ? (
                    <button
                      onClick={() => onSetStatus("archived")}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors text-foreground"
                    >
                      <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => onSetStatus("active")}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors text-foreground"
                    >
                      <ArchiveRestore className="w-3.5 h-3.5 text-muted-foreground" />
                      Unarchive
                    </button>
                  )}

                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={onDeleteRequest}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 transition-colors text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
              STATUS_CLS[project.status] ?? STATUS_CLS.draft
            }`}
          >
            {STATUS_LABEL[project.status] ?? project.status}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{project.room_count} room{project.room_count !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{timeAgo(project.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
