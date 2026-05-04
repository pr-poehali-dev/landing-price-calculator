CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.partner_payments (
  id            serial PRIMARY KEY,
  partner_id    integer NOT NULL REFERENCES t_p60076574_landing_price_calcul.partners(id),
  client_id     integer NULL REFERENCES t_p60076574_landing_price_calcul.partner_clients(id),
  amount        numeric(12,2) NOT NULL,
  note          text NULL,
  paid_at       timestamp NOT NULL DEFAULT now(),
  created_by    integer NULL REFERENCES t_p60076574_landing_price_calcul.users(id)
);

-- Индекс для быстрой выборки по партнёру
CREATE INDEX IF NOT EXISTS idx_partner_payments_partner_id ON t_p60076574_landing_price_calcul.partner_payments(partner_id);