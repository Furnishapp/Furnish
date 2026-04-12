import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, DollarSign, ExternalLink, FileText, MapPin, Target, User, X } from "lucide-react";
import type { SlideData } from "@/components/SlidesMode";

const SLIDE_W = 1920;
const SLIDE_H = 1080;

interface PresentationViewProps {
  externalSlides?: SlideData[];
}

const PresentationView = ({ externalSlides }: PresentationViewProps) => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showExit, setShowExit] = useState(false);

  useEffect(() => {
    if (externalSlides) {
      setSlides(externalSlides);
      return;
    }
    const raw = sessionStorage.getItem("presentation-slides");
    if (raw) {
      try { setSlides(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, [externalSlides]);

  const computeScale = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    setScale(Math.min(clientWidth / SLIDE_W, clientHeight / SLIDE_H));
  }, []);

  useEffect(() => {
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, [computeScale]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        setCurrent((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrent((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        if (externalSlides) return; // no exit on shared view
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slides, navigate, externalSlides]);

  // Show exit on mouse move, hide after 3s
  useEffect(() => {
    if (externalSlides) return;
    let timeout: ReturnType<typeof setTimeout>;
    const show = () => {
      setShowExit(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowExit(false), 3000);
    };
    window.addEventListener("mousemove", show);
    return () => { window.removeEventListener("mousemove", show); clearTimeout(timeout); };
  }, [externalSlides]);

  if (slides.length === 0) {
    return (
      <div className="h-screen bg-[#111] flex items-center justify-center">
        <p className="text-white/50 text-sm">No slides. Press Escape to go back.</p>
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div
      ref={containerRef}
      className="h-screen bg-[#111] overflow-hidden relative select-none"
      onClick={() => setCurrent((prev) => Math.min(prev + 1, slides.length - 1))}
    >
      {/* Exit button */}
      {!externalSlides && (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(-1); }}
          className={`absolute top-4 left-4 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-opacity ${
            showExit ? "opacity-100" : "opacity-0"
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div
        style={{
          position: "absolute",
          width: SLIDE_W,
          height: SLIDE_H,
          left: "50%",
          top: "50%",
          marginLeft: -SLIDE_W / 2,
          marginTop: -SLIDE_H / 2,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div className="slide-content w-full h-full bg-white text-[#1a1a1a] rounded-sm overflow-hidden">
          {slide.type === "brief" && <BriefSlide slide={slide} />}
          {slide.type === "mood" && <MoodSlide slide={slide} />}
          {slide.type === "product" && <ProductSlide slide={slide} />}
          {slide.type === "budget" && <BudgetSlide slide={slide} />}
        </div>
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 right-6 text-white/20 text-xs z-10">
        {current + 1} / {slides.length}
      </div>

      {/* Nav dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? "bg-white/60" : "bg-white/15 hover:bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ── Brief Slide ────────────────────────────────────────
const BriefSlide = ({ slide }: { slide: SlideData }) => {
  const brief = slide.brief;
  return (
    <div className="w-full h-full flex">
      <div className="w-1/2 flex flex-col justify-center p-20">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-[#999]" />
          <span className="text-sm uppercase tracking-[0.2em] text-[#999] font-medium">Brief</span>
        </div>
        <h1 className="text-6xl font-light mb-8 leading-tight">{slide.projectName || "Project"}</h1>
        {brief?.description && (
          <p className="text-xl text-[#666] leading-relaxed max-w-xl">{brief.description}</p>
        )}
        {brief?.address && (
          <div className="flex items-center gap-2 mt-8 text-[#888]">
            <MapPin className="w-5 h-5" />
            <span className="text-base">{brief.address}</span>
          </div>
        )}
      </div>
      <div className="w-1/2 flex flex-col justify-center p-20 bg-[#fafafa]">
        {brief?.goals && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#999]" />
              <span className="text-sm uppercase tracking-[0.15em] text-[#999] font-medium">Goals</span>
            </div>
            <p className="text-lg text-[#555] leading-relaxed whitespace-pre-line">{brief.goals}</p>
          </div>
        )}
        {brief?.clientName && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#999]" />
              <span className="text-sm uppercase tracking-[0.15em] text-[#999] font-medium">Client</span>
            </div>
            <p className="text-2xl font-light">{brief.clientName}</p>
            {brief.clientContact && (
              <p className="text-base text-[#888] mt-2">{brief.clientContact}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Mood Slide ──────────────────────────────────────────
const MoodSlide = ({ slide }: { slide: SlideData }) => {
  const { room } = slide;
  const hasImages = room.mood_images.length > 0;

  return (
    <div className="w-full h-full flex">
      <div className={`flex flex-col justify-center p-20 ${hasImages ? "w-[45%]" : "w-full items-center text-center"}`}>
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-[#999]" />
          <span className="text-sm uppercase tracking-[0.2em] text-[#999] font-medium">Mood</span>
        </div>
        <h1 className="text-6xl font-light mb-8 leading-tight">{room.name}</h1>
        {room.description && (
          <p className="text-xl text-[#666] leading-relaxed max-w-xl mb-10">{room.description}</p>
        )}
        {room.mood_colors.length > 0 && (
          <div className="flex gap-3">
            {room.mood_colors.map((c) => (
              <div key={c} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-lg shadow-sm" style={{ backgroundColor: c }} />
                <span className="text-xs text-[#999]">{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {hasImages && (
        <div className="w-[55%] p-6 flex gap-4">
          {room.mood_images.slice(0, 4).map((url, i) => (
            <div key={i} className="flex-1 min-w-0 overflow-hidden rounded-lg">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Product Slide ───────────────────────────────────────
const ProductSlide = ({ slide }: { slide: SlideData }) => {
  const { room } = slide;
  const items = room.items;

  if (items.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-2xl text-[#ccc]">No products in {room.name}</p>
      </div>
    );
  }

  const PAD = 80;
  const minX = Math.min(...items.map((i) => i.position_x));
  const minY = Math.min(...items.map((i) => i.position_y));
  const maxX = Math.max(...items.map((i) => i.position_x + i.width));
  const maxY = Math.max(...items.map((i) => i.position_y + i.height));
  const bw = maxX - minX || 1;
  const bh = maxY - minY || 1;

  const HEADER_H = 80;
  const availW = SLIDE_W - PAD * 2;
  const availH = SLIDE_H - HEADER_H - PAD;
  const fitScale = Math.min(availW / bw, availH / bh);

  const scaledW = bw * fitScale;
  const scaledH = bh * fitScale;
  const offsetX = PAD + (availW - scaledW) / 2;
  const offsetY = HEADER_H + (availH - scaledH) / 2;

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-0 left-0 right-0 h-[80px] flex items-center px-20">
        <h1 className="text-3xl font-light">{room.name}</h1>
        <span className="ml-4 text-sm text-[#999]">{items.length} products</span>
      </div>
      {items.map((item) => {
        const x = offsetX + (item.position_x - minX) * fitScale;
        const y = offsetY + (item.position_y - minY) * fitScale;
        const w = item.width * fitScale;
        const h = item.height * fitScale;
        return (
          <div
            key={item.id}
            className="absolute rounded-lg overflow-hidden bg-[#f8f8f8] shadow-sm border border-[#eee]"
            style={{ left: x, top: y, width: w, height: h }}
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full object-cover"
                style={{ height: item.show_caption ? h - 36 * fitScale : h }}
              />
            )}
            {item.show_caption && (
              <div className="px-2 py-1 flex items-center justify-between" style={{ height: 36 * fitScale }}>
                <span className="font-medium truncate" style={{ fontSize: Math.max(10, 12 * fitScale) }}>
                  {item.title || "Untitled"}
                </span>
                {item.price && (
                  <span className="shrink-0 font-semibold text-[#666]" style={{ fontSize: Math.max(10, 12 * fitScale) }}>
                    {item.price} €
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Budget Slide ────────────────────────────────────────
const BudgetSlide = ({ slide }: { slide: SlideData }) => {
  const { room } = slide;
  const items = room.items.filter((i) => i.url);

  const total = items.reduce((s, i) => {
    const n = parseFloat(i.price);
    return s + (isNaN(n) ? 0 : n);
  }, 0);
  const withoutPrice = items.filter((i) => !i.price || isNaN(parseFloat(i.price))).length;

  const statusColor: Record<string, string> = {
    idea: "#e5e5e5",
    selected: "#dbeafe",
    ordered: "#dcfce7",
  };

  return (
    <div className="w-full h-full flex flex-col px-20 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-[#999]" />
            <span className="text-sm uppercase tracking-[0.2em] text-[#999] font-medium">Budget</span>
          </div>
          <h1 className="text-4xl font-light">{room.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-5xl font-light">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</p>
          <p className="text-sm text-[#999] mt-1">
            {items.length} items{withoutPrice > 0 && ` · ${withoutPrice} without price`}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b-2 border-[#eee]">
              <th className="py-4 w-16"></th>
              <th className="py-4 text-sm font-medium text-[#999]">Product</th>
              <th className="py-4 text-sm font-medium text-[#999] w-40 text-right">Price</th>
              <th className="py-4 text-sm font-medium text-[#999] w-32 text-center">Status</th>
              <th className="py-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 12).map((item) => (
              <tr key={item.id} className="border-b border-[#f0f0f0]">
                <td className="py-3">
                  {item.image && <img src={item.image} alt="" className="w-12 h-12 object-cover rounded" />}
                </td>
                <td className="py-3 text-base font-medium">{item.title || "Untitled"}</td>
                <td className="py-3 text-base text-right font-light">
                  {item.price ? `${item.price} €` : "—"}
                </td>
                <td className="py-3 text-center">
                  <span
                    className="px-3 py-1 rounded-full text-xs capitalize"
                    style={{ backgroundColor: statusColor[item.status] || statusColor.idea }}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-3">
                  {item.url && <ExternalLink className="w-4 h-4 text-[#ccc]" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length > 12 && (
          <p className="text-sm text-[#999] mt-4 text-center">+ {items.length - 12} more items</p>
        )}
      </div>
    </div>
  );
};

export default PresentationView;
