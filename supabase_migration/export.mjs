import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Could not find Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseServiceKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const outputDir = path.resolve(__dirname);
const dataDir = path.join(outputDir, 'data');
const storageDir = path.join(outputDir, 'storage', 'tactical-images');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

async function fetchAll(tableName) {
  let allData = [];
  let from = 0;
  let limit = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + limit - 1);
    if (error) {
      console.error(`Error fetching table ${tableName}:`, error);
      throw error;
    }
    allData = allData.concat(data);
    if (data.length < limit) break;
    from += limit;
  }
  return allData;
}

function sqlEscape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val.toString();
  if (Array.isArray(val)) {
    const items = val.map(v => `'${String(v).replace(/'/g, "''")}'`).join(', ');
    return `ARRAY[${items}]::text[]`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function exportAll() {
  console.log('--- EXPORTING SUPABASE DATA ---');
  console.log('Source URL:', supabaseUrl);

  // 1. Export Auth Users
  console.log('1. Exporting Auth Users...');
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersErr) throw usersErr;
  const users = usersData.users;
  fs.writeFileSync(path.join(dataDir, 'auth_users.json'), JSON.stringify(users, null, 2));
  console.log(`✓ Exported ${users.length} auth users.`);

  // 2. Export Tables
  const tables = ['squadrons', 'airplanes', 'profiles', 'pilot_airplanes', 'airplane_tactical_images'];
  const tableData = {};

  for (const t of tables) {
    console.log(`2. Exporting table: ${t}...`);
    const rows = await fetchAll(t);
    tableData[t] = rows;
    fs.writeFileSync(path.join(dataDir, `${t}.json`), JSON.stringify(rows, null, 2));
    console.log(`✓ Exported ${rows.length} rows from ${t}.`);
  }

  // 3. Export Storage (tactical-images)
  console.log('3. Exporting Storage files from tactical-images...');
  const { data: rootItems } = await supabase.storage.from('tactical-images').list();
  let downloadedFilesCount = 0;

  if (rootItems) {
    for (const item of rootItems) {
      if (item.id === null) {
        // Folder
        const folderName = item.name;
        const localSubDir = path.join(storageDir, folderName);
        if (!fs.existsSync(localSubDir)) fs.mkdirSync(localSubDir, { recursive: true });

        const { data: subFiles } = await supabase.storage.from('tactical-images').list(folderName);
        if (subFiles) {
          for (const file of subFiles) {
            const filePath = `${folderName}/${file.name}`;
            const { data: blob, error: downloadErr } = await supabase.storage.from('tactical-images').download(filePath);
            if (!downloadErr && blob) {
              const buffer = Buffer.from(await blob.arrayBuffer());
              fs.writeFileSync(path.join(storageDir, folderName, file.name), buffer);
              downloadedFilesCount++;
            } else {
              console.error(`Failed to download ${filePath}:`, downloadErr);
            }
          }
        }
      } else {
        // Root file
        const { data: blob, error: downloadErr } = await supabase.storage.from('tactical-images').download(item.name);
        if (!downloadErr && blob) {
          const buffer = Buffer.from(await blob.arrayBuffer());
          fs.writeFileSync(path.join(storageDir, item.name), buffer);
          downloadedFilesCount++;
        }
      }
    }
  }
  console.log(`✓ Downloaded ${downloadedFilesCount} storage files.`);

  // 4. Generate 01_schema.sql
  console.log('4. Generating 01_schema.sql...');
  const schemaSql = `-- ==========================================================
-- SCRIPT DE ESTRUCTURA (SCHEMA) PARA METALTOOLS SUPABASE
-- Ejecutar en el SQL Editor de tu NUEVO proyecto Supabase
-- ==========================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Crear tabla: Squadrons (Escuadrones)
CREATE TABLE IF NOT EXISTS public.squadrons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear tabla: Profiles (Perfiles vinculados a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    squadron_id UUID REFERENCES public.squadrons(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'PILOT' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 4. Crear tabla: Airplanes (Catálogo de Aviones)
CREATE TABLE IF NOT EXISTS public.airplanes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sub_name TEXT,
    class TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Crear tabla: Pilot Airplanes (Hangar de cada piloto)
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

-- 6. Crear tabla: Airplane Tactical Images (Imágenes tácticas de aviones)
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
`;
  fs.writeFileSync(path.join(outputDir, '01_schema.sql'), schemaSql);

  // 5. Generate 02_data.sql
  console.log('5. Generating 02_data.sql...');
  let dataSql = `-- ==========================================================
-- SCRIPT DE INSERCIÓN DE DATOS (DATA SEED)
-- Ejecutar DESPUÉS de haber restaurado los usuarios de Auth y 01_schema.sql
-- ==========================================================

-- 1. Deshabilitar triggers temporalmente para carga limpia
SET session_replication_role = 'replica';

-- Limpiar tablas
TRUNCATE TABLE public.airplane_tactical_images CASCADE;
TRUNCATE TABLE public.pilot_airplanes CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.airplanes CASCADE;
TRUNCATE TABLE public.squadrons CASCADE;

-- 2. Squadrons
INSERT INTO public.squadrons (id, name, created_at) VALUES
`;

  dataSql += tableData.squadrons.map(s => 
    `(${sqlEscape(s.id)}, ${sqlEscape(s.name)}, ${sqlEscape(s.created_at)})`
  ).join(',\n') + ';\n\n';

  // 3. Airplanes
  dataSql += '-- 3. Airplanes\nINSERT INTO public.airplanes (id, name, sub_name, class, image_url) VALUES\n';
  dataSql += tableData.airplanes.map(a => 
    `(${sqlEscape(a.id)}, ${sqlEscape(a.name)}, ${sqlEscape(a.sub_name)}, ${sqlEscape(a.class)}, ${sqlEscape(a.image_url)})`
  ).join(',\n') + ';\n\n';

  // 4. Profiles
  dataSql += '-- 4. Profiles\nINSERT INTO public.profiles (id, username, squadron_id, role, created_at, is_active) VALUES\n';
  dataSql += tableData.profiles.map(p => 
    `(${sqlEscape(p.id)}, ${sqlEscape(p.username)}, ${sqlEscape(p.squadron_id)}, ${sqlEscape(p.role)}, ${sqlEscape(p.created_at)}, ${sqlEscape(p.is_active)})`
  ).join(',\n') + ';\n\n';

  // 5. Pilot Airplanes
  dataSql += '-- 5. Pilot Airplanes\nINSERT INTO public.pilot_airplanes (id, profile_id, airplane_id, is_unlocked, level, special_ability_level, passive_ability_level, mod1_name, mod1_level, mod2_name, mod2_level, trophies) VALUES\n';
  dataSql += tableData.pilot_airplanes.map(pa => 
    `(${sqlEscape(pa.id)}, ${sqlEscape(pa.profile_id)}, ${sqlEscape(pa.airplane_id)}, ${sqlEscape(pa.is_unlocked)}, ${sqlEscape(pa.level)}, ${sqlEscape(pa.special_ability_level)}, ${sqlEscape(pa.passive_ability_level)}, ${sqlEscape(pa.mod1_name)}, ${sqlEscape(pa.mod1_level)}, ${sqlEscape(pa.mod2_name)}, ${sqlEscape(pa.mod2_level)}, ${sqlEscape(pa.trophies)})`
  ).join(',\n') + ';\n\n';

  // 6. Airplane Tactical Images
  dataSql += '-- 6. Airplane Tactical Images\nINSERT INTO public.airplane_tactical_images (id, airplane_id, uploader_id, image_url, game_modes, comment, created_at) VALUES\n';
  dataSql += tableData.airplane_tactical_images.map(img => 
    `(${sqlEscape(img.id)}, ${sqlEscape(img.airplane_id)}, ${sqlEscape(img.uploader_id)}, ${sqlEscape(img.image_url)}, ${sqlEscape(img.game_modes)}, ${sqlEscape(img.comment)}, ${sqlEscape(img.created_at)})`
  ).join(',\n') + ';\n\n';

  dataSql += `-- Reactivar triggers
SET session_replication_role = 'origin';
`;

  fs.writeFileSync(path.join(outputDir, '02_data.sql'), dataSql);
  console.log('✓ Generated 01_schema.sql and 02_data.sql.');
  console.log('--- EXPORT COMPLETED SUCCESSFULLY ---');
}

exportAll().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
