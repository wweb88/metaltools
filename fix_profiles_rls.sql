-- Habilitar a todos los usuarios autenticados a ver los perfiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Anyone can view profiles" 
ON public.profiles FOR SELECT USING (
    auth.role() = 'authenticated'
);
