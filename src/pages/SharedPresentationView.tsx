import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import PresentationView from "./PresentationView";
import type { SlideData } from "@/components/SlidesMode";

const SharedPresentationView = () => {
  const { token } = useParams<{ token: string }>();
  const [slides, setSlides] = useState<SlideData[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase
      .from("shared_presentations")
      .select("slides_data")
      .eq("share_token", token)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(true);
        } else {
          setSlides(data.slides_data as unknown as SlideData[]);
        }
      });
  }, [token]);

  if (error) {
    return (
      <div className="h-screen bg-[#111] flex items-center justify-center">
        <p className="text-white/50 text-sm">Presentation not found or link expired.</p>
      </div>
    );
  }

  if (!slides) {
    return (
      <div className="h-screen bg-[#111] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return <PresentationView externalSlides={slides} />;
};

export default SharedPresentationView;
