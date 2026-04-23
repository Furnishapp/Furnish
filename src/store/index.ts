import { create } from "zustand";

type UIState = {
  // Per-project active tab persisted in memory across navigation
  projectTabs: Record<string, "brief" | "plan" | "budget" | "slides">;
  setProjectTab: (
    projectId: string,
    tab: "brief" | "plan" | "budget" | "slides"
  ) => void;
};

export const useUIStore = create<UIState>((set) => ({
  projectTabs: {},
  setProjectTab: (projectId, tab) =>
    set((s) => ({ projectTabs: { ...s.projectTabs, [projectId]: tab } })),
}));
