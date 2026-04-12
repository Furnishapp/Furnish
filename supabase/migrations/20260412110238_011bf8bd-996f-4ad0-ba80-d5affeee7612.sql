CREATE TABLE public.shared_presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  slides_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_presentations ENABLE ROW LEVEL SECURITY;

-- Owner can manage their shares
CREATE POLICY "Users can create shares for own projects"
ON public.shared_presentations FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (SELECT 1 FROM projects WHERE projects.id = shared_presentations.project_id AND projects.user_id = auth.uid())
);

CREATE POLICY "Users can view own shares"
ON public.shared_presentations FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own shares"
ON public.shared_presentations FOR DELETE
USING (auth.uid() = created_by);

CREATE POLICY "Users can update own shares"
ON public.shared_presentations FOR UPDATE
USING (auth.uid() = created_by);

-- Public access by token (for anon/unauthenticated)
CREATE POLICY "Anyone can view by share token"
ON public.shared_presentations FOR SELECT
USING (true);

CREATE TRIGGER update_shared_presentations_updated_at
BEFORE UPDATE ON public.shared_presentations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();