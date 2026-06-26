import fs from 'fs';
import path from 'path';

async function main() {
  const data = JSON.parse(fs.readFileSync('./public/assets/files/dataInfo.json', 'utf8'));
  const iconsDir = './public/assets/planes/icons';

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  let sql = `-- 1. Agregar la columna sub_name a la tabla airplanes
ALTER TABLE public.airplanes ADD COLUMN IF NOT EXISTS sub_name TEXT;

-- 2. Limpiar la tabla por si se corre el script dos veces
TRUNCATE TABLE public.airplanes CASCADE;

-- 3. Insertar todos los aviones
INSERT INTO public.airplanes (name, sub_name, class, image_url) VALUES\n`;

  const values = [];

  for (const plane of data.planes) {
    const url = plane.image;
    const filename = path.basename(new URL(url).pathname);
    const localPath = `/assets/planes/icons/${filename}`;
    const filePath = path.join(iconsDir, filename);

    // Download image if it doesn't exist
    if (!fs.existsSync(filePath)) {
      console.log(`Downloading ${filename}...`);
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
    }

    values.push(`('${plane.name.replace(/'/g, "''")}', '${plane.subName.replace(/'/g, "''")}', '${plane.type}', '${localPath}')`);
  }

  sql += values.join(',\n') + ';';
  fs.writeFileSync('./planes_seed.sql', sql);
  console.log('Done! Downloaded images and generated new planes_seed.sql');
}

main().catch(console.error);
