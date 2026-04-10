import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Slide {
  id: string;
  type: "room" | "item";
  title: string;
  image: string;
  description: string;
}

const PresentationView = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem("presentation-slides");
    if (raw) {
      try { setSlides(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        setCurrent((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrent((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slides, navigate]);

  // Fullscreen is not reliably available in iframe/sandbox environments, so we skip it.

  if (slides.length === 0) {
    return (
      <div className="h-screen bg-foreground flex items-center justify-center">
        <p className="text-background text-sm">No slides. Press Escape to go back.</p>
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div
      className="h-screen bg-foreground flex items-center justify-center cursor-none select-none"
      onClick={() => setCurrent((prev) => Math.min(prev + 1, slides.length - 1))}
    >
      <div className="max-w-5xl w-full px-12 flex flex-col items-center gap-8">
        {slide.image && (
          <img
            src={slide.image}
            alt={slide.title}
            className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl"
          />
        )}
        <h2 className="text-3xl font-light text-background text-center">{slide.title}</h2>
        {slide.description && (
          <p className="text-sm text-background/60 text-center max-w-xl">{slide.description}</p>
        )}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-8 text-background/30 text-xs">
        {current + 1} / {slides.length}
      </div>
    </div>
  );
};

export default PresentationView;
