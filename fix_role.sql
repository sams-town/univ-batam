UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'pegawai' LIMIT 1)
WHERE email = 'pegawai.dummy@univbatam.ac.id';
