"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { SlideData } from "@/components/SlidesMode";

const PresentationView = dynamic(() => import("@/components/PresentationView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-white/40" />
    </div>
  ),
});

export default function SharedPresentationClient({
  slidesData,
}: {
  slidesData: unknown;
}) {
  return (
    <PresentationView
      externalSlides={slidesData as SlideData[]}
    />
  );
}
