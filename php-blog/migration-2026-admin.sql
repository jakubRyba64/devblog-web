-- Jednorázová migrace původní tabulky posts pro nové administrační rozhraní.
-- Spusťte pouze na existující databázi. Nová instalace používá rovnou schema.sql.

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS excerpt TEXT NULL AFTER slug,
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Programování' AFTER excerpt,
  ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500) NULL AFTER category,
  ADD COLUMN IF NOT EXISTS content_format VARCHAR(20) NOT NULL DEFAULT 'plain' AFTER content,
  ADD COLUMN IF NOT EXISTS published_at DATETIME NULL AFTER published;

UPDATE posts
SET published_at = created_at
WHERE published = 1 AND published_at IS NULL;

ALTER TABLE posts
  ADD INDEX IF NOT EXISTS idx_posts_publication (published, published_at, created_at);
