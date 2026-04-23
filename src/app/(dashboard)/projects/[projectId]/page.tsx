"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Map, DollarSign, Presentation, FileText } from "lucide-react";
import { useUIStore } from "@/store";
import dynamic from "next/dynamic";

// Heavy canvas components loaded client-side only
const PlanMode = dynamic(() => import("@/components/rooms/PlanMode"), { ssr: false });
const BudgetMode = dynamic(() => import("@/components/products/BudgetMode"), { ssr: false });
const SlidesMode = dynamic(() => import("@/components/slides/SlidesMode"), { ssr: false });
const BriefMode = dynamic(() => import("@/components/brief/BriefMode"), { ssr: false });

type Tab = "brief" | "plan" | "budget" | "slides";

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "brief", label: "Brief", icon: FileText },
  { key: "plan", label: "Plan", icon: Map },
  { key: "budget", label: "Budget", icon: DollarSign },
  { key: "slides", label: "Slides", icon: Presentation },
];

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId ?? "";
  const router = useRouter();
  const { projectTabs, setProjectTab } = useUIStore();
  const activeTab: Tab = projectTabs[projectId] ?? "brief";

  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);

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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="shrink-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push("/projects")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{projectName}</h1>

          <div className="ml-auto flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setProjectTab(projectId, key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {projectId && activeTab === "brief" && <BriefMode projectId={projectId} />}
          {projectId && activeTab === "plan" && <PlanMode projectId={projectId} />}
          {projectId && activeTab === "budget" && <BudgetMode projectId={projectId} />}
          {projectId && activeTab === "slides" && <SlidesMode projectId={projectId} />}
        </div>
      </div>
    </div>
  );
}
