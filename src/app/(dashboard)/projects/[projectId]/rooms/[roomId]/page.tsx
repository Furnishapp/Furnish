import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import RoomViewClient from "./room-view-client";

interface Props {
  params: Promise<{ projectId: string; roomId: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { projectId, roomId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return <RoomViewClient projectId={projectId} roomId={roomId} />;
}
