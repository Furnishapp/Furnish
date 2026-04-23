"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { ExternalLink, Loader2 } from "lucide-react";

interface BudgetItem {
  room_link_id: string;
  link_id: string;
  title: string;
  image: string;
  url: string;
  price: string;
  status: string;
}

interface RoomBudgetViewProps {
  roomId: string;
}

const STATUS_OPTIONS = ["idea", "selected", "ordered"] as const;

const statusColor: Record<string, string> = {
  idea: "bg-secondary text-secondary-foreground",
  selected: "bg-primary/10 text-primary",
  ordered: "bg-green-100 text-green-800",
};

const RoomBudgetView = ({ roomId }: RoomBudgetViewProps) => {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data: rlRows } = await supabase
      .from("room_links")
      .select("id, link_id, status")
      .eq("room_id", roomId);

    if (!rlRows || rlRows.length === 0) { setItems([]); setLoading(false); return; }

    const linkIds = rlRows.map((rl) => rl.link_id);
    const { data: links } = await supabase.from("links").select("*").in("id", linkIds);

    const linkMap: Record<string, any> = {};
    links?.forEach((l) => { linkMap[l.id] = l; });

    setItems(
      rlRows
        .map((rl) => {
          const l = linkMap[rl.link_id] || {};
          return {
            room_link_id: rl.id,
            link_id: rl.link_id,
            title: l.title || "",
            image: l.image || "",
            url: l.url || "",
            price: l.price || "",
            status: rl.status || "idea",
          };
        })
        .filter((i) => i.url)
    );
    setLoading(false);
  }, [roomId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handlePriceChange = async (linkId: string, price: string) => {
    await supabase.from("links").update({ price }).eq("id", linkId);
    setItems((prev) => prev.map((i) => (i.link_id === linkId ? { ...i, price } : i)));
  };

  const handleStatusChange = async (rlId: string, status: string) => {
    await supabase.from("room_links").update({ status }).eq("id", rlId);
    setItems((prev) => prev.map((i) => (i.room_link_id === rlId ? { ...i, status } : i)));
  };

  const totalPrice = items.reduce((sum, i) => {
    const n = parseFloat(i.price);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const withoutPrice = items.filter((i) => !i.price || isNaN(parseFloat(i.price))).length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 py-3 border-b border-border flex items-center gap-6 text-xs">
        <span className="font-medium text-foreground">
          Total: {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {withoutPrice > 0 && (
          <span className="text-muted-foreground">{withoutPrice} without price</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          No items with URLs in this room
        </p>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background border-b border-border">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-2 w-12"></th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2 w-24">Price</th>
                <th className="px-4 py-2 w-28">Status</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.room_link_id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-2">
                    {item.image && (
                      <img src={item.image} alt="" className="w-10 h-10 object-cover rounded" />
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium text-foreground">{item.title || "Untitled"}</td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full bg-secondary px-2 py-1 rounded text-xs text-foreground outline-none"
                      value={item.price}
                      placeholder="—"
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) => prev.map((i) => (i.room_link_id === item.room_link_id ? { ...i, price: val } : i)));
                      }}
                      onBlur={(e) => handlePriceChange(item.link_id, e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.room_link_id, e.target.value)}
                      className={`text-[10px] px-2 py-1 rounded-full font-medium outline-none cursor-pointer ${statusColor[item.status] || statusColor.idea}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoomBudgetView;
