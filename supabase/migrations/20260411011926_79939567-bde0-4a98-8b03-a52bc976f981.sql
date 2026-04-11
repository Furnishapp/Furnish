
ALTER TABLE public.rooms ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE public.rooms ADD COLUMN mood_colors TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.rooms ADD COLUMN mood_images TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.room_links ADD COLUMN show_caption BOOLEAN NOT NULL DEFAULT true;
