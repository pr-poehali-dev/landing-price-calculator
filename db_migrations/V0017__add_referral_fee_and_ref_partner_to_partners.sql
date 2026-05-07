ALTER TABLE t_p60076574_landing_price_calcul.partners
    ADD COLUMN IF NOT EXISTS referral_fee_percent NUMERIC(5,2) DEFAULT 0 NOT NULL;

ALTER TABLE t_p60076574_landing_price_calcul.partners
    ADD COLUMN IF NOT EXISTS ref_partner_id INTEGER REFERENCES t_p60076574_landing_price_calcul.partners(id);
