import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Map, DollarSign, Presentation, FileText } from "lucide-react";
import PlanMode from "@/components/PlanMode";
import BudgetMode from "@/components/BudgetMode";
import SlidesMode from "@/components/SlidesMode";
import BriefMode from "@/components/BriefMode";

type Tab = "brief" | "plan" | "budget" | "slides";

const tabs: { key: Tab; label: string; icon: typeof Map }[] = [
  { key: "brief", label: "Brief", icon: FileText },
  { key: "plan", label: "Plan", icon: Map },
  { key: "budget", label: "Budget", icon: DollarSign },
  { key: "slides", label: "Slides", icon: Presentation },
];

const ProjectDetail = () => {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("brief");

  useEffect(() => {
    if (!user || !projectId) return;
    supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single()
      .then(({ data }) => {
        if (data) setProjectName(data.name);
        setLoading(false);
      });
  }, [user, projectId]);

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
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{projectName}</h1>

          <div className="ml-auto flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
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

      {projectId && activeTab === "brief" && <BriefMode projectId={projectId} />}
      {projectId && activeTab === "plan" && <PlanMode projectId={projectId} />}
      {projectId && activeTab === "budget" && <BudgetMode projectId={projectId} />}
      {projectId && activeTab === "slides" && <SlidesMode projectId={projectId} />}
    </div>
  );
};

export default ProjectDetail;
