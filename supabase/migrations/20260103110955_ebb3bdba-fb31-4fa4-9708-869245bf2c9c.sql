-- Allow public INSERT for towers table
CREATE POLICY "Public insert access for towers" 
ON public.towers 
FOR INSERT 
WITH CHECK (true);

-- Allow public INSERT for ev_stations table
CREATE POLICY "Public insert access for ev_stations" 
ON public.ev_stations 
FOR INSERT 
WITH CHECK (true);