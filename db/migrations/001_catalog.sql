CREATE TABLE photos (
  id uuid PRIMARY KEY,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  collection text NOT NULL CHECK (length(collection) BETWEEN 1 AND 80),
  description text NOT NULL CHECK (length(description) BETWEEN 1 AND 2000),
  width integer NOT NULL CHECK (width > 0),
  height integer NOT NULL CHECK (height > 0),
  prices jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
