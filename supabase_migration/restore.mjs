import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usage:
// node restore.mjs <NEW_SUPABASE_URL> <NEW_SERVICE_ROLE_KEY> [DEFAULT_PASSWORD]
// or set environment variables NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_KEY

const args = process.argv.slice(2);
const newUrl = args[0] || process.env.NEW_SUPABASE_URL;
const newServiceKey = args[1] || process.env.NEW_SUPABASE_SERVICE_KEY;
const defaultPassword = args[2] || process.env.DEFAULT_MIGRATION_PASSWORD || 'Metalstorm2026!';

if (!newUrl || !newServiceKey) {
  console.log(`
================================================================================
   METALTOOLS - RESTAURADOR AUTOMÁTICO A NUEVO SUPABASE
================================================================================

Uso:
  node supabase_migration/restore.mjs <NEW_SUPABASE_URL> <NEW_SERVICE_ROLE_KEY> [DEFAULT_PASSWORD]

Ejemplo:
  node supabase_migration/restore.mjs https://abcdefghijklmno.supabase.co eyJhbGci... Metalstorm2026!

Parámetros:
  1. NEW_SUPABASE_URL: URL de tu nuevo proyecto Supabase (Project Settings -> API -> Project URL)
  2. NEW_SERVICE_ROLE_KEY: Clave secreta service_role (Project Settings -> API -> service_role key)
  3. DEFAULT_PASSWORD (opcional): Contraseña por defecto para los usuarios migrados (default: Metalstorm2026!)

Antes de ejecutar este script:
  1. Ve al SQL Editor de tu nuevo proyecto Supabase.
  2. Copia y ejecuta todo el contenido de 'supabase_migration/01_schema.sql'.
  3. Luego corre este script para restaurar automáticamente todos los usuarios,
     datos, hangares, imágenes y actualizar las URLs de storage.
================================================================================
`);
  process.exit(0);
}

const supabase = createClient(newUrl.trim(), newServiceKey.trim(), {
  auth: { autoRefreshToken: false, persistSession: false }
});

const dataDir = path.join(__dirname, 'data');
const storageDir = path.join(__dirname, 'storage', 'tactical-images');

async function restore() {
  console.log('================================================================');
  console.log(' INICIANDO RESTAURACIÓN EN NUEVO SUPABASE');
  console.log(' Destino URL:', newUrl);
  console.log('================================================================\n');

  // 1. Restaurar Usuarios de Auth
  console.log('--- 1. RESTAURANDO USUARIOS DE AUTH ---');
  const usersPath = path.join(dataDir, 'auth_users.json');
  if (fs.existsSync(usersPath)) {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    console.log(`Encontrados ${users.length} usuarios para migrar.`);
    let createdCount = 0;
    let existingCount = 0;

    for (const u of users) {
      // Intentar crear usuario conservando exactamente el mismo ID
      const { data, error } = await supabase.auth.admin.createUser({
        id: u.id,
        email: u.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: u.user_metadata || {},
        app_metadata: u.app_metadata || {}
      });

      if (error) {
        if (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('duplicate') || error.status === 422) {
          existingCount++;
        } else {
          console.warn(`Aviso con usuario ${u.email}:`, error.message);
        }
      } else {
        createdCount++;
      }
    }
    console.log(`✓ Usuarios: ${createdCount} creados, ${existingCount} ya existían.`);
  }

  // 2. Restaurar Squadrons
  console.log('\n--- 2. RESTAURANDO ESCUADRONES (SQUADRONS) ---');
  const squadrons = JSON.parse(fs.readFileSync(path.join(dataDir, 'squadrons.json'), 'utf8'));
  if (squadrons.length > 0) {
    const { error } = await supabase.from('squadrons').upsert(squadrons, { onConflict: 'id' });
    if (error) console.error('Error insertando squadrons:', error);
    else console.log(`✓ ${squadrons.length} escuadrones restaurados.`);
  }

  // 3. Restaurar Airplanes
  console.log('\n--- 3. RESTAURANDO AVIONES (AIRPLANES) ---');
  const airplanes = JSON.parse(fs.readFileSync(path.join(dataDir, 'airplanes.json'), 'utf8'));
  if (airplanes.length > 0) {
    const { error } = await supabase.from('airplanes').upsert(airplanes, { onConflict: 'id' });
    if (error) console.error('Error insertando airplanes:', error);
    else console.log(`✓ ${airplanes.length} aviones restaurados.`);
  }

  // 4. Restaurar Profiles
  console.log('\n--- 4. RESTAURANDO PERFILES (PROFILES) ---');
  const profiles = JSON.parse(fs.readFileSync(path.join(dataDir, 'profiles.json'), 'utf8'));
  if (profiles.length > 0) {
    const { error } = await supabase.from('profiles').upsert(profiles, { onConflict: 'id' });
    if (error) console.error('Error insertando profiles:', error);
    else console.log(`✓ ${profiles.length} perfiles restaurados.`);
  }

  // 5. Restaurar Pilot Airplanes (en lotes)
  console.log('\n--- 5. RESTAURANDO HANGAR DE PILOTOS (PILOT_AIRPLANES) ---');
  const pilotAirplanes = JSON.parse(fs.readFileSync(path.join(dataDir, 'pilot_airplanes.json'), 'utf8'));
  const batchSize = 100;
  let insertedPA = 0;
  for (let i = 0; i < pilotAirplanes.length; i += batchSize) {
    const batch = pilotAirplanes.slice(i, i + batchSize);
    const { error } = await supabase.from('pilot_airplanes').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error en lote ${i} - ${i + batch.length}:`, error);
    } else {
      insertedPA += batch.length;
    }
  }
  console.log(`✓ ${insertedPA} / ${pilotAirplanes.length} registros de hangar restaurados.`);

  // 6. Asegurar Bucket de Storage y Subir Imágenes
  console.log('\n--- 6. RESTAURANDO IMÁGENES EN STORAGE (TACTICAL-IMAGES) ---');
  // Asegurar que el bucket existe
  await supabase.storage.createBucket('tactical-images', { public: true }).catch(() => {});

  let uploadedImages = 0;
  if (fs.existsSync(storageDir)) {
    const folders = fs.readdirSync(storageDir);
    for (const folder of folders) {
      const folderPath = path.join(storageDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          const filePath = path.join(folderPath, file);
          const storagePath = `${folder}/${file}`;
          const fileBuffer = fs.readFileSync(filePath);
          const ext = path.extname(file).toLowerCase();
          const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

          const { error: uploadErr } = await supabase.storage
            .from('tactical-images')
            .upload(storagePath, fileBuffer, { contentType, upsert: true });

          if (uploadErr) {
            console.warn(`Aviso subiendo imagen ${storagePath}:`, uploadErr.message);
          } else {
            uploadedImages++;
          }
        }
      }
    }
  }
  console.log(`✓ ${uploadedImages} archivos de imagen subidos al bucket.`);

  // 7. Restaurar Airplane Tactical Images con las URLs actualizadas
  console.log('\n--- 7. RESTAURANDO REGISTROS DE IMÁGENES TÁCTICAS ---');
  const tacticalImages = JSON.parse(fs.readFileSync(path.join(dataDir, 'airplane_tactical_images.json'), 'utf8'));
  if (tacticalImages.length > 0) {
    // Reemplazar la URL base del viejo supabase con el nuevo
    const cleanNewUrl = newUrl.replace(/\/$/, '');
    const updatedTacticalImages = tacticalImages.map(img => {
      let url = img.image_url;
      // Replace old supabase domain pattern
      url = url.replace(/https:\/\/[^/]+\.supabase\.co/g, cleanNewUrl);
      return {
        ...img,
        image_url: url
      };
    });

    const { error } = await supabase.from('airplane_tactical_images').upsert(updatedTacticalImages, { onConflict: 'id' });
    if (error) console.error('Error insertando airplane_tactical_images:', error);
    else console.log(`✓ ${updatedTacticalImages.length} registros de imágenes tácticas restaurados con URLs actualizadas.`);
  }

  console.log('\n================================================================');
  console.log(' ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
  console.log(' Todos los usuarios, tablas, hangares e imágenes han sido clonados.');
  console.log('================================================================\n');
}

restore().catch(err => {
  console.error('Error fatal durante la restauración:', err);
  process.exit(1);
});
