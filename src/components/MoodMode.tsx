"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, X, Palette } from "lucide-react";

interface MoodModeProps {
  roomId: string;
}

const PRESET_COLORS = [
  "#F5F5DC", "#D2B48C", "#8B7355", "#2F4F4F",
  "#FAF0E6", "#C4A882", "#556B2F", "#708090",
  "#FFF8DC", "#DEB887", "#A0522D", "#36454F",
  "#FFFAF0", "#E8D5B7", "#BC8F8F", "#4A4A4A",
];

const MoodMode = ({ roomId }: MoodModeProps) => {
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMood = useCallback(async () => {
    const { data } = await supabase
      .from("rooms")
      .select("description, mood_colors, mood_images")
      .eq("id", roomId)
      .single();

    if (data) {
      setDescription(data.description || "");
      setColors((data.mood_colors as string[]) || []);
      setImages((data.mood_images as string[]) || []);
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => { fetchMood(); }, [fetchMood]);

  const save = async (fields: { description?: string; mood_colors?: string[]; mood_images?: string[] }) => {
    setSaving(true);
    await supabase.from("rooms").update(fields).eq("id", roomId);
    setSaving(false);
  };

  const toggleColor = (color: string) => {
    const next = colors.includes(color) ? colors.filter((c) => c !== color) : [...colors, color];
    setColors(next);
    save({ mood_colors: next });
  };

  const removeColor = (color: string) => {
    const next = colors.filter((c) => c !== color);
    setColors(next);
    save({ mood_colors: next });
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    const next = [...images, newImageUrl.trim()];
    setImages(next);
    setNewImageUrl("");
    save({ mood_images: next });
  };

  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    setImages(next);
    save({ mood_images: next });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Description */}
        <section className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Room Description</label>
          <textarea
            className="w-full bg-secondary/50 text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring/20 resize-none min-h-[120px]"
            placeholder="Describe the mood, atmosphere, and vision for this room…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => save({ description })}
          />
        </section>

        {/* Color Palette */}
        <section className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Color Palette
          </label>

          {/* Selected colors */}
          {colors.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <div key={color} className="relative group">
                  <div
                    className="w-12 h-12 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <button
                    onClick={() => removeColor(color)}
                    className="absolute -top-1 -right-1 bg-card border border-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5 text-muted-foreground" />
                  </button>
                  <span className="block text-[9px] text-muted-foreground text-center mt-1">{color}</span>
                </div>
              ))}
            </div>
          )}

          {/* Preset palette */}
          <div className="flex gap-1.5 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`w-7 h-7 rounded-md border transition-all ${
                  colors.includes(color)
                    ? "border-primary ring-2 ring-primary/20 scale-110"
                    : "border-border/50 hover:border-border hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Custom color */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-7 h-7 rounded cursor-pointer border-none"
              onChange={(e) => {
                const c = e.target.value;
                if (!colors.includes(c)) {
                  const next = [...colors, c];
                  setColors(next);
                  save({ mood_colors: next });
                }
              }}
            />
            <span className="text-[10px] text-muted-foreground">Add custom color</span>
          </div>
        </section>

        {/* Inspiration Images */}
        <section className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inspiration</label>

          <form
            onSubmit={(e) => { e.preventDefault(); addImage(); }}
            className="flex gap-2"
          >
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste an image URL…"
              className="flex-1 bg-secondary/50 text-foreground placeholder:text-muted-foreground px-3 py-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </form>

          {images.length > 0 && (
            <div className="columns-2 gap-3 space-y-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative group break-inside-avoid">
                  <img
                    src={url}
                    alt="Inspiration"
                    className="w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-card/80 border border-border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Add inspiration images to set the mood
            </p>
          )}
        </section>

        {saving && (
          <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5 shadow-sm">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving…
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodMode;
