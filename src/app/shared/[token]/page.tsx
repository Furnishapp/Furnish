// Server-side rendered — clients see content instantly without JS hydration.
import { createServerClient } from "@/lib/supabase/server";
import SharedPresentationClient from "./shared-client";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharedPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("shared_presentations")
    .select("slides_data")
    .eq("share_token", token)
    .single();

  if (!data) notFound();

  return (
    <SharedPresentationClient
      slidesData={data.slides_data}
    />
  );
}
