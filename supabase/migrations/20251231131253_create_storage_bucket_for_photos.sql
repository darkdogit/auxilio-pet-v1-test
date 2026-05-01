/*
  # Create Storage Bucket for User Photos

  1. Storage
    - Create `user-photos` bucket for selfies and pet photos
    - Set bucket as public for easy access
    - Configure file size limits and allowed mime types

  2. Security
    - Enable RLS on storage.objects
    - Allow public insert (anyone can upload)
    - Allow public select (anyone can view)
    - Files are publicly accessible via URL
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- Create policy for public upload
CREATE POLICY "Anyone can upload photos"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'user-photos');

-- Create policy for public access
CREATE POLICY "Anyone can view photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'user-photos');

-- Create policy for deleting photos
CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'user-photos');