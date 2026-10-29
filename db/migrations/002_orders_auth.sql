CREATE TABLE administrators (email text PRIMARY KEY);
CREATE TABLE admin_login_tokens (
  token_hash text PRIMARY KEY, email text NOT NULL REFERENCES administrators(email) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
);
CREATE TABLE admin_sessions (
  token_hash text PRIMARY KEY, email text NOT NULL REFERENCES administrators(email) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE TABLE email_outbox (
  id uuid PRIMARY KEY, dedupe_key text NOT NULL UNIQUE, recipient text NOT NULL,
  subject text NOT NULL, body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz
);
CREATE TABLE orders (
  id uuid PRIMARY KEY, photo_id uuid NOT NULL REFERENCES photos(id), email text NOT NULL,
  photo_title text NOT NULL, licence text NOT NULL CHECK (licence IN ('personal','commercial')),
  licence_terms text NOT NULL, currency text NOT NULL CHECK (currency IN ('GBP','EUR','USD')),
  amount integer NOT NULL CHECK (amount > 0), status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','checkout_failed')),
  stripe_session_id text UNIQUE, access_hash text UNIQUE, access_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz
);
CREATE TABLE download_tokens (
  token_hash text PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX ON admin_login_tokens(email,created_at);
CREATE INDEX ON orders(email);
