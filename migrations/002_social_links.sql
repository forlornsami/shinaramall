-- Add social media link columns to store_settings
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS social_facebook VARCHAR,
  ADD COLUMN IF NOT EXISTS social_instagram VARCHAR,
  ADD COLUMN IF NOT EXISTS social_linkedin VARCHAR,
  ADD COLUMN IF NOT EXISTS social_tiktok VARCHAR,
  ADD COLUMN IF NOT EXISTS social_youtube VARCHAR;
