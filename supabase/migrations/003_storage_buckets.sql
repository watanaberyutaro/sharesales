-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('timeline-images', 'timeline-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true);

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can read avatars" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for timeline-images bucket
CREATE POLICY "Anyone can read timeline images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'timeline-images');
CREATE POLICY "Users can upload timeline images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'timeline-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own timeline images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'timeline-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own timeline images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'timeline-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for portfolios bucket
CREATE POLICY "Anyone can read portfolios" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'portfolios');
CREATE POLICY "Users can upload portfolios" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own portfolios" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own portfolios" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);