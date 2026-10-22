-- ==========================================================
-- SCRIPT DE ESTRUCTURA (SCHEMA) PARA METALTOOLS SUPABASE
-- Ejecutar en el SQL Editor de tu NUEVO proyecto Supabase
-- ==========================================================

-- 1. Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Permisos base sobre el esquema public
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Crear tabla: Squadrons (Escuadrones)
CREATE TABLE IF NOT EXISTS public.squadrons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crear tabla: Profiles (Perfiles vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    squadron_id UUID REFERENCES public.squadrons(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'PILOT' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 5. Crear tabla: Airplanes (Catálogo de Aviones)
CREATE TABLE IF NOT EXISTS public.airplanes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sub_name TEXT,
    class TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Crear tabla: Pilot Airplanes (Hangar de cada piloto)
CREATE TABLE IF NOT EXISTS public.pilot_airplanes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    airplane_id UUID REFERENCES public.airplanes(id) ON DELETE CASCADE NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    special_ability_level INTEGER DEFAULT 0 NOT NULL,
    passive_ability_level INTEGER DEFAULT 0 NOT NULL,
    mod1_name TEXT,
    mod1_level INTEGER,
    mod2_name TEXT,
    mod2_level INTEGER,
    trophies INTEGER DEFAULT 0 NOT NULL,
    CONSTRAINT pilot_airplanes_profile_airplane_unique UNIQUE (profile_id, airplane_id)
);

-- 7. Crear tabla: Airplane Tactical Images (Imágenes tácticas de aviones)
CREATE TABLE IF NOT EXISTS public.airplane_tactical_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airplane_id UUID REFERENCES public.airplanes(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    game_modes TEXT[] NOT NULL DEFAULT '{}',
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ASIGNAR PERMISOS A LAS TABLAS (DATA API & POSTGREST)
-- ==========================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ==========================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ==========================================================

ALTER TABLE public.squadrons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airplanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_airplanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airplane_tactical_images ENABLE ROW LEVEL SECURITY;

-- Políticas para Squadrons
DROP POLICY IF EXISTS "Public / Authenticated read access for squadrons" ON public.squadrons;
CREATE POLICY "Public / Authenticated read access for squadrons"
ON public.squadrons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow staff/admin insert squadrons" ON public.squadrons;
CREATE POLICY "Allow staff/admin insert squadrons"
ON public.squadrons FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow staff/admin update squadrons" ON public.squadrons;
CREATE POLICY "Allow staff/admin update squadrons"
ON public.squadrons FOR UPDATE USING (true);

-- Políticas para Profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile or admins" ON public.profiles;
CREATE POLICY "Users can update own profile or admins" 
ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
CREATE POLICY "Allow profile insert" 
ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow profile delete" ON public.profiles;
CREATE POLICY "Allow profile delete" 
ON public.profiles FOR DELETE USING (true);

-- Políticas para Airplanes
DROP POLICY IF EXISTS "Anyone can view airplanes" ON public.airplanes;
CREATE POLICY "Anyone can view airplanes" 
ON public.airplanes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow airplanes mutation" ON public.airplanes;
CREATE POLICY "Allow airplanes mutation" 
ON public.airplanes FOR ALL USING (true);

-- Políticas para Pilot Airplanes
DROP POLICY IF EXISTS "Anyone can view pilot airplanes" ON public.pilot_airplanes;
CREATE POLICY "Anyone can view pilot airplanes" 
ON public.pilot_airplanes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can mutate pilot airplanes" ON public.pilot_airplanes;
CREATE POLICY "Authenticated users can mutate pilot airplanes" 
ON public.pilot_airplanes FOR ALL USING (true);

-- Políticas para Tactical Images
DROP POLICY IF EXISTS "Allow authenticated read access for tactical images" ON public.airplane_tactical_images;
CREATE POLICY "Allow authenticated read access for tactical images"
ON public.airplane_tactical_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert access for tactical images" ON public.airplane_tactical_images;
CREATE POLICY "Allow authenticated insert access for tactical images"
ON public.airplane_tactical_images FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete access for tactical images" ON public.airplane_tactical_images;
CREATE POLICY "Allow authenticated delete access for tactical images"
ON public.airplane_tactical_images FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow authenticated update access for tactical images" ON public.airplane_tactical_images;
CREATE POLICY "Allow authenticated update access for tactical images"
ON public.airplane_tactical_images FOR UPDATE USING (true);

-- ==========================================================
-- STORAGE: BUCKET TACTICAL-IMAGES Y POLÍTICAS
-- ==========================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('tactical-images', 'tactical-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access for tactical-images" ON storage.objects;
CREATE POLICY "Public Access for tactical-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tactical-images');

DROP POLICY IF EXISTS "Authenticated users can upload to tactical-images" ON storage.objects;
CREATE POLICY "Authenticated users can upload to tactical-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tactical-images');

DROP POLICY IF EXISTS "Authenticated users can update tactical-images" ON storage.objects;
CREATE POLICY "Authenticated users can update tactical-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'tactical-images');

DROP POLICY IF EXISTS "Authenticated users can delete tactical-images" ON storage.objects;
CREATE POLICY "Authenticated users can delete tactical-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'tactical-images');

-- ==========================================================
-- TRIGGER AUTOMÁTICO: Crear perfil al registrar usuario en Auth
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'PILOT')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
