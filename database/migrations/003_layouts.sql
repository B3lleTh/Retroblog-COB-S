CREATE TABLE IF NOT EXISTS layouts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id    UUID UNIQUE REFERENCES blogs(id) ON DELETE CASCADE,
  content    JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);