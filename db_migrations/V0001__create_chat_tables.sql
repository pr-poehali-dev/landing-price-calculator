CREATE TABLE t_p60076574_landing_price_calcul.chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL UNIQUE,
    telegram_chat_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p60076574_landing_price_calcul.chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    role VARCHAR(16) NOT NULL,
    text TEXT NOT NULL,
    telegram_message_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON t_p60076574_landing_price_calcul.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON t_p60076574_landing_price_calcul.chat_messages(created_at);
