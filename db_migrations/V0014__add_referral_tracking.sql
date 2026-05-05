ALTER TABLE t_p60076574_landing_price_calcul.form_submissions
  ADD COLUMN IF NOT EXISTS ref_code VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS partner_id INTEGER NULL REFERENCES t_p60076574_landing_price_calcul.partners(id);

CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.ref_clicks (
  id SERIAL PRIMARY KEY,
  ref_code VARCHAR(20) NOT NULL,
  partner_id INTEGER NULL REFERENCES t_p60076574_landing_price_calcul.partners(id),
  ip VARCHAR(64) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ref_clicks_ref_code ON t_p60076574_landing_price_calcul.ref_clicks(ref_code);
CREATE INDEX IF NOT EXISTS idx_ref_clicks_partner_id ON t_p60076574_landing_price_calcul.ref_clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_ref_code ON t_p60076574_landing_price_calcul.form_submissions(ref_code);
