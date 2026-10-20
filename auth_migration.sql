ALTER TABLE staff ADD COLUMN password_salt TEXT;
ALTER TABLE staff ADD COLUMN password_hash TEXT;
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, failures INTEGER NOT NULL DEFAULT 0, locked_until TEXT);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
