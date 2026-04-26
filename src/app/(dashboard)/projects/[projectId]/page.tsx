"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Loader2,
  Map,
  DollarSign,
  Presentation,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useUIStore } from "@/store";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import ProjectPanel from "@/components/project/ProjectPanel";

const PlanMode = dynamic(() => import("@/components/rooms/PlanMode"), { ssr: false });
const BudgetMode = dynamic(() => import("@/components/products/BudgetMode"), { ssr: false });
const SlidesMode = dynamic(() => import("@/components/slides/SlidesMode"), { ssr: false });
const PeopleMode = dynamic(() => import("@/components/project/PeopleMode"), { ssr: false });

type Tab = "people" | "plan" | "budget" | "slides";

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "people", label: "People", icon: Users },
  { key: "plan",   label: "Plan",   icon: Map },
  { key: "budget", label: "Budget", icon: DollarSign },
  { key: "slides", label: "Slides", icon: Presentation },
];

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId ?? "";
  const { projectTabs, setProjectTab } = useUIStore();
  const activeTab: Tab = (projectTabs[projectId] as Tab) ?? "people";

  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false); // mobile drawer

  useEffect(() => {
    if (!projectId) return;
    supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single()
      .then(({ data }) => {
        if (data) setProjectName(data.name);
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(38 25% 93%) 0%, hsl(40 20% 97%) 50%, hsl(35 20% 94%) 100%)",
      }}
    >
      {/* ── LEFT PANEL (desktop: always visible, mobile: drawer) ── */}

      {/* Mobile backdrop */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel wrapper — slide in on mobile, static on md+ */}
      <AnimatePresence initial={false}>
        {/* Desktop: always rendered, no animation */}
        <aside className="hidden md:flex md:w-1/4 lg:w-[22%] shrink-0 p-3 pr-1.5 flex-col">
          <ProjectPanel projectId={projectId} projectName={projectName} />
        </aside>
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            key="mobile-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-40 w-4/5 max-w-sm p-3 flex flex-col md:hidden"
          >
            <ProjectPanel projectId={projectId} projectName={projectName} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── RIGHT CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden p-3 pl-1.5">
        {/* Inner container — light glass card */}
        <div
          className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.75)",
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset",
          }}
        >
          {/* Tab bar */}
          <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-black/[0.05]">
            {/* Mobile: hamburger to open panel */}
            <button
              onClick={() => setPanelOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
            >
              <Menu className="w-4 h-4 text-foreground/70" />
            </button>

            {/* Mobile: project name */}
            <span className="md:hidden text-sm font-semibold text-foreground truncate flex-1">
              {projectName}
            </span>

            {/* Tab pills */}
            <div className="flex items-center gap-1 rounded-xl p-1 ml-auto"
              style={{
                background: "rgba(0,0,0,0.05)",
              }}
            >
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setProjectTab(projectId, key)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 outline-none"
                  style={{
                    color: activeTab === key
                      ? "hsl(var(--foreground))"
                      : "hsl(var(--muted-foreground))",
                  }}
                >
                  {activeTab === key && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }}
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    />
                  )}
                  <Icon className="relative w-3.5 h-3.5 shrink-0" />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab content — animated swap */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col"
              >
                {activeTab === "people" && projectId && <PeopleMode projectId={projectId} />}
                {activeTab === "plan"   && projectId && <PlanMode   projectId={projectId} />}
                {activeTab === "budget" && projectId && <BudgetMode projectId={projectId} />}
                {activeTab === "slides" && projectId && <SlidesMode projectId={projectId} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile: close panel button when open */}
      <AnimatePresence>
        {panelOpen && (
          <motion.button
            key="close-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => setPanelOpen(false)}
            className="fixed top-4 right-4 z-50 md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-lg border border-black/10"
          >
            <X className="w-4 h-4 text-foreground/70" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
