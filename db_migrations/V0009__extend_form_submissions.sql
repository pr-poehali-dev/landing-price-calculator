ALTER TABLE t_p60076574_landing_price_calcul.form_submissions
  ADD COLUMN IF NOT EXISTS contact_position  varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS contact_note      text         NULL,
  ADD COLUMN IF NOT EXISTS company_full_name varchar(500) NULL,
  ADD COLUMN IF NOT EXISTS company_kpp       varchar(20)  NULL,
  ADD COLUMN IF NOT EXISTS company_ogrn      varchar(20)  NULL,
  ADD COLUMN IF NOT EXISTS company_address   text         NULL,
  ADD COLUMN IF NOT EXISTS company_director  varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS bank_name         varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS bank_bik          varchar(20)  NULL,
  ADD COLUMN IF NOT EXISTS bank_account      varchar(30)  NULL,
  ADD COLUMN IF NOT EXISTS bank_corr         varchar(30)  NULL,
  ADD COLUMN IF NOT EXISTS status            varchar(50)  NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS updated_at        timestamp    NULL DEFAULT now();