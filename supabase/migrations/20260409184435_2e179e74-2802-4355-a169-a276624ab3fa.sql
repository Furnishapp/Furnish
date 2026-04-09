
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view rooms in own projects" ON public.rooms FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create rooms in own projects" ON public.rooms FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update rooms in own projects" ON public.rooms FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete rooms in own projects" ON public.rooms FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = rooms.project_id AND projects.user_id = auth.uid()));

-- Create links table
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own links" ON public.links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own links" ON public.links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own links" ON public.links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own links" ON public.links FOR DELETE USING (auth.uid() = user_id);

-- Create room_links junction table (link can be in multiple rooms)
CREATE TABLE public.room_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, link_id)
);
ALTER TABLE public.room_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view room_links in own projects" ON public.room_links FOR SELECT USING (EXISTS (SELECT 1 FROM public.rooms JOIN public.projects ON projects.id = rooms.project_id WHERE rooms.id = room_links.room_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create room_links in own projects" ON public.room_links FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.rooms JOIN public.projects ON projects.id = rooms.project_id WHERE rooms.id = room_links.room_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update room_links in own projects" ON public.room_links FOR UPDATE USING (EXISTS (SELECT 1 FROM public.rooms JOIN public.projects ON projects.id = rooms.project_id WHERE rooms.id = room_links.room_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete room_links in own projects" ON public.room_links FOR DELETE USING (EXISTS (SELECT 1 FROM public.rooms JOIN public.projects ON projects.id = rooms.project_id WHERE rooms.id = room_links.room_id AND projects.user_id = auth.uid()));

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
