
create policy "stream images readable" on storage.objects for select to anon, authenticated using (bucket_id = 'stream-images');
create policy "admins upload stream images" on storage.objects for insert to authenticated with check (bucket_id = 'stream-images' and public.has_role(auth.uid(),'admin'));
create policy "admins update stream images" on storage.objects for update to authenticated using (bucket_id = 'stream-images' and public.has_role(auth.uid(),'admin')) with check (bucket_id = 'stream-images' and public.has_role(auth.uid(),'admin'));
create policy "admins delete stream images" on storage.objects for delete to authenticated using (bucket_id = 'stream-images' and public.has_role(auth.uid(),'admin'));
