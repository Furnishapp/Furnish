"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const PresentationView = dynamic(() => import("@/components/slides/PresentationView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-white/40" />
    </div>
  ),
});

export default function PresentPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId ?? "";
  return <PresentationView projectId={projectId} />;
}
