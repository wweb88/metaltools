# 🚀 Guía Completa de Migración de Base de Datos Supabase (Metaltools)

Este directorio contiene la copia de seguridad completa (usuarios, tablas, datos, imágenes de storage y scripts de restauración) de tu proyecto Supabase.

---

## 📦 Contenido del Respaldo

- **`01_schema.sql`**: Script SQL con todas las tablas, extensiones, relaciones, políticas de seguridad (RLS), bucket de Storage y triggers.
- **`02_data.sql`**: Script SQL alternativo con los datos listos para inserción masiva.
- **`data/`**: Copia en formato JSON de todas las tablas y los 59 usuarios registrados.
  - `auth_users.json` (59 usuarios de autenticación)
  - `squadrons.json` (2 escuadrones)
  - `airplanes.json` (43 aviones)
  - `profiles.json` (57 perfiles)
  - `pilot_airplanes.json` (1,103 registros de hangares de pilotos)
  - `airplane_tactical_images.json` (15 imágenes tácticas)
- **`storage/tactical-images/`**: Todas las 15 imágenes físicas descargadas del Storage.
- **`restore.mjs`**: Script automatizado que clona todo en tu nuevo proyecto Supabase en un solo comando.

---

## 🛠️ Pasos para migrar a la nueva cuenta

### Paso 1: Crear la nueva cuenta y nuevo proyecto en Supabase
1. Ingresa a [https://supabase.com](https://supabase.com) con tu nueva cuenta.
2. Crea una nueva organización / proyecto (por ejemplo: `metaltools-db`).
3. Asigna una contraseña segura a tu base de datos y selecciona tu región preferida.

### Paso 2: Crear la estructura (Schema y Políticas)
1. En el panel izquierdo de tu nuevo proyecto Supabase, haz clic en **SQL Editor** (ícono de terminal `>_`).
2. Abre o copia todo el contenido del archivo [`01_schema.sql`](./01_schema.sql).
3. Pégalo en el editor SQL y presiona **RUN**.
   > Esto creará las 5 tablas (`squadrons`, `profiles`, `airplanes`, `pilot_airplanes`, `airplane_tactical_images`), el bucket `tactical-images`, las políticas de seguridad (RLS) y los triggers.

### Paso 3: Obtener las credenciales del nuevo proyecto
En tu nuevo proyecto de Supabase, ve a:
⚙️ **Project Settings** (ícono de engranaje) -> **API**:
- **Project URL**: (Ej: `https://xyzabcdefghijklm.supabase.co`)
- **anon / public key**: (Ej: `sb_publishable_...` o `eyJhbGci...`)
- **service_role key** (Secret): (Haz clic en Reveal para copiar la clave `service_role` secreta).

---

### Paso 4: Ejecutar la restauración automática de datos
Abre tu terminal en la carpeta del proyecto y corre el siguiente comando (sustituyendo con tus datos):

```bash
node supabase_migration/restore.mjs "TU_NUEVO_PROJECT_URL" "TU_NUEVA_SERVICE_ROLE_KEY"
```

**Ejemplo real:**
```bash
node supabase_migration/restore.mjs "https://xyzabcdefghijklm.supabase.co" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Este script automáticamente:
1. Recreará todos los **59 usuarios de Auth** preservando sus UUIDs originales para que no se rompan las relaciones.
2. Restaurará los **2 escuadrones**, **43 aviones**, **57 perfiles** y los **1,103 registros de hangar**.
3. Creará el bucket de Storage y subirá todas las **15 imágenes tácticas**.
4. Actualizará las URLs de las imágenes tácticas para que apunten al dominio de tu nuevo Supabase.

---

### Paso 5: Actualizar tu archivo `.env.local`
Una vez completada la restauración, abre el archivo [`.env.local`](../.env.local) de este proyecto y reemplaza los valores con las claves de tu nuevo proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-nuevo-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_nueva_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_nueva_service_role_key
NEXT_PUBLIC_GA_ID=G-M5RQ3Y4JL3
```

---

### Paso 6: Verificar
Inicia tu aplicación localmente:
```bash
npm run dev
```
Inicia sesión en `http://localhost:3000` con tus credenciales y verifica:
- Lista de escuadrones y pilotos en el Dashboard.
- Tu Hangar con los aviones y modificaciones guardadas.
- Galería táctica con las imágenes funcionando.
