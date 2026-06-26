-- Ejecuta este script en el editor SQL de Supabase para añadir los campos de los modificadores

ALTER TABLE public.pilot_airplanes
ADD COLUMN IF NOT EXISTS mod1_name text,
ADD COLUMN IF NOT EXISTS mod1_level integer,
ADD COLUMN IF NOT EXISTS mod2_name text,
ADD COLUMN IF NOT EXISTS mod2_level integer;
