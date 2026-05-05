CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.partner_custom_rates (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES t_p60076574_landing_price_calcul.partners(id),
  service_name TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  note TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_custom_rates_partner ON t_p60076574_landing_price_calcul.partner_custom_rates(partner_id);
