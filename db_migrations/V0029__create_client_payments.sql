CREATE TABLE t_p60076574_landing_price_calcul.client_payments (
  id          SERIAL PRIMARY KEY,
  client_id   INTEGER NOT NULL REFERENCES t_p60076574_landing_price_calcul.partner_clients(id),
  amount      NUMERIC(18,2) NOT NULL,
  description TEXT NULL,
  status      VARCHAR(30) NOT NULL DEFAULT 'pending',
  paid_at     TIMESTAMP WITH TIME ZONE NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_payments_client_id ON t_p60076574_landing_price_calcul.client_payments(client_id);
