import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LinkCard from "@/components/LinkCard";

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  price: string;
}

const Index = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<LinkItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("preview", {
        body: { url: url.trim() },
      });

      if (error) throw error;

      setCards((prev) => [
        {
          id: crypto.randomUUID(),
          url: url.trim(),
          title: data.title || "",
          description: data.description || "",
          image: data.image || "",
          price: "",
        },
        ...prev,
      ]);
      setUrl("");
    } catch (err) {
      console.error("Failed to fetch preview:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id: string, fields: { title?: string; price?: string }) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...fields } : card))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL…"
              className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ring/20 transition-shadow"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {cards.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm pt-20">
            Paste a link above to start your moodboard
          </p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {cards.map((card) => (
              <LinkCard key={card.id} data={card} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
