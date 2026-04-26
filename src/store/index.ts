import { create } from "zustand";

type Tab = "people" | "plan" | "budget" | "slides";

type UIState = {
  projectTabs: Record<string, Tab>;
  setProjectTab: (projectId: string, tab: Tab) => void;
};

export const useUIStore = create<UIState>((set) => ({
  projectTabs: {},
  setProjectTab: (projectId, tab) =>
    set((s) => ({ projectTabs: { ...s.projectTabs, [projectId]: tab } })),
}));
