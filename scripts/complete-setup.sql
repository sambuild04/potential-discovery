-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contents table
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'diary')),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contents table
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own content" ON public.contents;
DROP POLICY IF EXISTS "Users can insert their own content" ON public.contents;
DROP POLICY IF EXISTS "Users can update their own content" ON public.contents;
DROP POLICY IF EXISTS "Users can delete their own content" ON public.contents;

-- Create RLS policies for contents table
CREATE POLICY "Users can view their own content" ON public.contents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content" ON public.contents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content" ON public.contents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content" ON public.contents
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for user content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-content',
  'user-content',
  true,
  10485760, -- 10MB in bytes
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
  ]
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
  ];

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own content" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own content" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own content" ON storage.objects;
DROP POLICY IF EXISTS "Public can view user content" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload their own content" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-content' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own content" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-content' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own content" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-content' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public access to user content (for public URLs)
CREATE POLICY "Public can view user content" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-content');
