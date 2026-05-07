CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p60076574_landing_price_calcul.users(id),
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p60076574_landing_price_calcul.users(id),
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON t_p60076574_landing_price_calcul.password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_hash ON t_p60076574_landing_price_calcul.email_verification_tokens(token_hash);

ALTER TABLE t_p60076574_landing_price_calcul.users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE t_p60076574_landing_price_calcul.users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE t_p60076574_landing_price_calcul.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE;
ALTER TABLE t_p60076574_landing_price_calcul.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE t_p60076574_landing_price_calcul.users ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMP;
ALTER TABLE t_p60076574_landing_price_calcul.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
