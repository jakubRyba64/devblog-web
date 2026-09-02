-- DevBlog – schéma databáze (MariaDB / MySQL)

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) NOT NULL UNIQUE,
  excerpt        TEXT NULL,
  category       VARCHAR(100) NOT NULL DEFAULT 'Programování',
  featured_image VARCHAR(500) NULL,
  content        MEDIUMTEXT NOT NULL,
  content_format VARCHAR(20) NOT NULL DEFAULT 'html',
  published      TINYINT(1) NOT NULL DEFAULT 0,
  published_at   DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_posts_publication (published, published_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
