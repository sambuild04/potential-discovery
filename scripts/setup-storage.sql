-- Create storage bucket for user content if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-content',
  'user-content',
  true,
  10485760, -- 10MB in bytes
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/mov'
  ]
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/mov'
  ];

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own content" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own content" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own content" ON storage.objects;
DROP POLICY IF EXISTS "Public can view user content" ON storage.objects;

-- Create storage policies for user content
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
