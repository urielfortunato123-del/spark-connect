-- Create countries table
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_pt TEXT,
  continent TEXT NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create 5G towers table
CREATE TABLE public.towers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(3) NOT NULL REFERENCES public.countries(code),
  city TEXT,
  state TEXT,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  operator TEXT,
  technology TEXT DEFAULT '5G',
  frequency TEXT,
  status TEXT DEFAULT 'active',
  installed_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create EV stations table
CREATE TABLE public.ev_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(3) NOT NULL REFERENCES public.countries(code),
  city TEXT,
  state TEXT,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  operator TEXT,
  connector_types TEXT[],
  power_kw DECIMAL(6, 2),
  num_chargers INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  installed_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_towers_country ON public.towers(country_code);
CREATE INDEX idx_towers_location ON public.towers(latitude, longitude);
CREATE INDEX idx_ev_stations_country ON public.ev_stations(country_code);
CREATE INDEX idx_ev_stations_location ON public.ev_stations(latitude, longitude);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ev_stations ENABLE ROW LEVEL SECURITY;

-- Public read access (data is public infrastructure info)
CREATE POLICY "Public read access for countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public read access for towers" ON public.towers FOR SELECT USING (true);
CREATE POLICY "Public read access for ev_stations" ON public.ev_stations FOR SELECT USING (true);