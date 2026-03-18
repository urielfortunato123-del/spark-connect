
-- Table to store module categories and subtypes (backend-managed)
CREATE TABLE public.module_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL,
  category_id text NOT NULL,
  title text NOT NULL,
  icon_name text NOT NULL DEFAULT 'FileText',
  color text NOT NULL DEFAULT 'bg-gray-500',
  description text,
  subtypes text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(module_id, category_id)
);

-- RLS
ALTER TABLE public.module_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read (public reference data)
CREATE POLICY "Public read access for module_categories"
  ON public.module_categories FOR SELECT
  TO public
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage module_categories"
  ON public.module_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_module_categories_updated_at
  BEFORE UPDATE ON public.module_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
