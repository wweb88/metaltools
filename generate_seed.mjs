import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./public/assets/files/dataInfo.json', 'utf8'));

let sql = `-- 1. Agregar la columna sub_name a la tabla airplanes
ALTER TABLE public.airplanes ADD COLUMN IF NOT EXISTS sub_name TEXT;

-- 2. Limpiar la tabla por si se corre el script dos veces
TRUNCATE TABLE public.airplanes CASCADE;

-- 3. Insertar todos los aviones
INSERT INTO public.airplanes (name, sub_name, class, image_url) VALUES
`;

const values = data.planes.map(p => `('${p.name.replace(/'/g, "''")}', '${p.subName.replace(/'/g, "''")}', '${p.type}', '${p.image}')`);

sql += values.join(',\n') + ';';

fs.writeFileSync('./planes_seed.sql', sql);
console.log('SQL generated at ./planes_seed.sql');
