"use client";

import { useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";

interface LinkCardProps {
  data: {
    id: string;
    url: string;
    title: string;
    description: string;
    image: string;
    price: string;
  };
  onUpdate: (id: string, fields: { title?: string; price?: string }) => void;
}

const LinkCard = ({ data, onUpdate }: LinkCardProps) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [title, setTitle] = useState(data.title);
  const [price, setPrice] = useState(data.price);

  return (
    <div className="group bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow break-inside-avoid mb-4">
      {data.image && (
        <img
          src={data.image}
          alt={data.title}
          className="w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4 space-y-2">
        {editingTitle ? (
          <input
            className="w-full bg-secondary px-2 py-1 rounded text-sm font-medium text-card-foreground outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setEditingTitle(false);
              onUpdate(data.id, { title });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditingTitle(false);
                onUpdate(data.id, { title });
              }
            }}
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-medium text-card-foreground cursor-pointer group/title flex items-center gap-1"
            onClick={() => setEditingTitle(true)}
          >
            {title || "Untitled"}
            <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
        )}

        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {data.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-[70%]"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            {new URL(data.url).hostname}
          </a>

          {editingPrice ? (
            <input
              className="w-20 bg-secondary px-2 py-0.5 rounded text-xs text-right text-card-foreground outline-none"
              value={price}
              placeholder="Price"
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => {
                setEditingPrice(false);
                onUpdate(data.id, { price });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingPrice(false);
                  onUpdate(data.id, { price });
                }
              }}
              autoFocus
            />
          ) : (
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => setEditingPrice(true)}
            >
              {price || "+ price"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkCard;
