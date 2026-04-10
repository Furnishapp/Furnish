
-- Add description to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

-- Add position to rooms (for plan mode layout)
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS position_x double precision NOT NULL DEFAULT 0;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS position_y double precision NOT NULL DEFAULT 0;

-- Add width, height, status to room_links (board items)
ALTER TABLE public.room_links ADD COLUMN IF NOT EXISTS width double precision NOT NULL DEFAULT 260;
ALTER TABLE public.room_links ADD COLUMN IF NOT EXISTS height double precision NOT NULL DEFAULT 200;
ALTER TABLE public.room_links ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'idea';
