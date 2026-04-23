"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const RoomView = dynamic(() => import("@/components/rooms/RoomView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function RoomViewClient({
  projectId,
  roomId,
}: {
  projectId: string;
  roomId: string;
}) {
  return <RoomView projectId={projectId} roomId={roomId} />;
}
